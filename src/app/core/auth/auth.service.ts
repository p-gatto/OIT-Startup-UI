import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  BehaviorSubject,
  Observable,
  of,
  throwError,
  timer,
  EMPTY,
  combineLatest,
  defer,
  merge
} from 'rxjs';
import {
  catchError,
  tap,
  switchMap,
  filter,
  take,
  map,
  shareReplay,
  distinctUntilChanged,
  retry,
  retryWhen,
  delay,
  takeWhile,
  finalize,
  startWith
} from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { User } from './models/user.model';
import { LoginRequest } from './models/login-request.model';
import { LoginResponse } from './models/login-response.model';
import { ChangePassword } from './models/change-password.model';

interface TokenData {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly configService = inject(ConfigService);

  // State management con BehaviorSubject
  private readonly authState$ = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Token management
  private readonly tokenData$ = new BehaviorSubject<TokenData>({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    expiresAt: localStorage.getItem('tokenExpiry')
  });

  // API Base URL come Observable
  private readonly apiBaseUrl$ = this.configService.config$.pipe(
    map(config => config?.apiBaseUrl ?? 'http://localhost:5000'),
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Auto-refresh token stream
  private readonly tokenRefresh$ = this.tokenData$.pipe(
    filter(tokens => !!tokens.expiresAt && !!tokens.refreshToken),
    switchMap(tokens => {
      const expiryTime = new Date(tokens.expiresAt!).getTime();
      const now = Date.now();
      const refreshTime = Math.max(expiryTime - now - (5 * 60 * 1000), 60000); // 5 min before expiry

      if (refreshTime <= 0) {
        return this.performRefreshToken().pipe(catchError(() => EMPTY));
      }

      return timer(refreshTime).pipe(
        switchMap(() => this.performRefreshToken().pipe(
          catchError(error => {
            console.error('Auto-refresh failed:', error);
            this.logout();
            return EMPTY;
          })
        ))
      );
    }),
    shareReplay(1)
  );

  // Public Observables
  public readonly currentUser$: Observable<User | null> = this.authState$.pipe(
    map(state => state.user),
    distinctUntilChanged()
  );

  public readonly isAuthenticated$: Observable<boolean> = this.authState$.pipe(
    map(state => state.isAuthenticated),
    distinctUntilChanged()
  );

  public readonly isLoading$: Observable<boolean> = this.authState$.pipe(
    map(state => state.isLoading),
    distinctUntilChanged()
  );

  public readonly error$: Observable<string | null> = this.authState$.pipe(
    map(state => state.error),
    distinctUntilChanged()
  );

  // Computed properties con Signals per compatibility
  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);

  public readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.groups.some((group: any) => group.name === 'Administrators') ?? false;
  });

  public readonly userPermissions = computed(() => {
    return this.currentUser()?.permissions ?? [];
  });

  constructor() {
    this.initializeAuth();
    this.setupAutoRefresh();
  }

  private initializeAuth(): void {
    // Sync BehaviorSubjects with signals
    this.currentUser$.subscribe(user => this.currentUser.set(user));
    this.isAuthenticated$.subscribe(auth => this.isAuthenticated.set(auth));
    this.isLoading$.subscribe(loading => this.isLoading.set(loading));

    // Initialize with stored tokens
    const tokenData = this.tokenData$.value;
    if (this.isTokenValid(tokenData)) {
      this.updateAuthState({ isAuthenticated: true });
      this.loadCurrentUser().subscribe();
    }
  }

  private setupAutoRefresh(): void {
    // Avvia l'auto-refresh solo quando necessario
    this.tokenRefresh$.subscribe();
  }

  private isTokenValid(tokenData: TokenData): boolean {
    if (!tokenData.accessToken || !tokenData.expiresAt) return false;
    return new Date(tokenData.expiresAt) > new Date();
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authState$.value;
    this.authState$.next({ ...currentState, ...updates });
  }

  private updateTokenData(tokenData: Partial<TokenData>): void {
    const currentTokens = this.tokenData$.value;
    const newTokenData = { ...currentTokens, ...tokenData };
    this.tokenData$.next(newTokenData);

    // Update localStorage
    if (newTokenData.accessToken) {
      localStorage.setItem('accessToken', newTokenData.accessToken);
    }
    if (newTokenData.refreshToken) {
      localStorage.setItem('refreshToken', newTokenData.refreshToken);
    }
    if (newTokenData.expiresAt) {
      localStorage.setItem('tokenExpiry', newTokenData.expiresAt);
    }
  }

  private clearTokenData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');

    this.tokenData$.next({
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    });
  }

  // Public Methods

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.updateAuthState({ isLoading: true, error: null });

    return this.apiBaseUrl$.pipe(
      take(1),
      switchMap(apiUrl =>
        this.http.post<LoginResponse>(`${apiUrl}/api/auth/login`, credentials).pipe(
          tap(response => {
            this.updateTokenData({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              expiresAt: response.expiresAt
            });

            this.updateAuthState({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }),
          catchError(error => {
            this.updateAuthState({
              isLoading: false,
              error: this.getErrorMessage(error)
            });
            return throwError(() => error);
          })
        )
      )
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.tokenData$.value.refreshToken;

    const logoutRequest$ = refreshToken ?
      this.apiBaseUrl$.pipe(
        take(1),
        switchMap(apiUrl =>
          this.http.post<void>(`${apiUrl}/api/auth/logout`, { refreshToken }).pipe(
            map(() => void 0), // Assicura che il tipo sia sempre void
            catchError(error => {
              console.warn('Logout request failed:', error);
              return of(void 0); // Ritorna void invece di null
            })
          )
        )
      ) : of(void 0); // Ritorna void invece di null

    return logoutRequest$.pipe(
      tap(() => {
        this.clearTokenData();
        this.updateAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        this.router.navigate(['/login']);
      })
    );
  }

  private performRefreshToken(): Observable<LoginResponse> {
    const currentTokens = this.tokenData$.value;

    if (!currentTokens.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiBaseUrl$.pipe(
      take(1),
      switchMap(apiUrl =>
        this.http.post<LoginResponse>(`${apiUrl}/api/auth/refresh`, {
          refreshToken: currentTokens.refreshToken
        }).pipe(
          tap(response => {
            this.updateTokenData({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              expiresAt: response.expiresAt
            });

            this.updateAuthState({
              user: response.user,
              isAuthenticated: true
            });
          }),
          retryWhen(errors => errors.pipe(
            delay(1000),
            take(2) // Retry max 2 times
          )),
          catchError(error => {
            console.error('Token refresh failed:', error);
            this.logout().subscribe();
            return throwError(() => error);
          })
        )
      )
    );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.performRefreshToken();
  }

  private loadCurrentUser(): Observable<User | null> {
    if (!this.tokenData$.value.accessToken) {
      return of(null);
    }

    return this.apiBaseUrl$.pipe(
      take(1),
      switchMap(apiUrl =>
        this.http.get<User>(`${apiUrl}/api/auth/me`).pipe(
          tap(user => {
            this.updateAuthState({ user });
          }),
          catchError(error => {
            if (error.status === 401) {
              this.logout().subscribe();
            }
            console.error('Failed to load current user:', error);
            return of(null);
          })
        )
      )
    );
  }

  getCurrentUser(): Observable<User | null> {
    // Return cached user or fetch from server
    return this.currentUser$.pipe(
      take(1),
      switchMap(cachedUser =>
        cachedUser ? of(cachedUser) : this.loadCurrentUser()
      )
    );
  }

  changePassword(passwordData: ChangePassword): Observable<void> {
    return this.apiBaseUrl$.pipe(
      take(1),
      switchMap(apiUrl =>
        this.http.post<void>(`${apiUrl}/api/auth/change-password`, passwordData).pipe(
          retry(1),
          catchError(error => {
            console.error('Password change failed:', error);
            return throwError(() => error);
          })
        )
      )
    );
  }

  // Permission checks
  hasPermission(resource: string, action: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.permissions.includes(`${resource}:${action}`) ?? false),
      distinctUntilChanged()
    );
  }

  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        const userPermissions = user?.permissions ?? [];
        return permissions.some(permission => userPermissions.includes(permission));
      }),
      distinctUntilChanged()
    );
  }

  isInSecurityGroup(groupName: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.groups.some((group: any) => group.name === groupName) ?? false),
      distinctUntilChanged()
    );
  }

  // Synchronous methods for backward compatibility
  getAccessToken(): string | null {
    return this.tokenData$.value.accessToken;
  }

  hasPermissionSync(resource: string, action: string): boolean {
    const user = this.authState$.value.user;
    return user?.permissions.includes(`${resource}:${action}`) ?? false;
  }

  hasAnyPermissionSync(permissions: string[]): boolean {
    const user = this.authState$.value.user;
    const userPermissions = user?.permissions ?? [];
    return permissions.some(permission => userPermissions.includes(permission));
  }

  isInSecurityGroupSync(groupName: string): boolean {
    const user = this.authState$.value.user;
    return user?.groups.some((group: any) => group.name === groupName) ?? false;
  }

  // Utility methods
  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || error.message || 'An error occurred';
    }
    return error.message || 'An unknown error occurred';
  }

  // Public method to manually check and refresh if needed
  checkAndRefreshToken(): Observable<boolean> {
    const tokenData = this.tokenData$.value;

    if (!tokenData.accessToken) {
      return of(false);
    }

    if (this.isTokenValid(tokenData)) {
      return of(true);
    }

    if (tokenData.refreshToken) {
      return this.performRefreshToken().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }

    return of(false);
  }

  // Stream of authentication events
  authEvents$ = merge(
    this.isAuthenticated$.pipe(
      distinctUntilChanged(),
      map(isAuth => ({ type: isAuth ? 'LOGIN' : 'LOGOUT', payload: isAuth }))
    ),
    this.error$.pipe(
      filter(error => !!error),
      map(error => ({ type: 'ERROR', payload: error }))
    )
  );
}