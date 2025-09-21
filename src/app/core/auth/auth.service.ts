import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, throwError, timer, of } from 'rxjs';
import { catchError, tap, switchMap, filter, take } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { User } from './models/user.model';
import { LoginRequest } from './models/login-request.model';
import { LoginResponse } from './models/login-response.model';
import { ChangePassword } from './models/change-password.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private configService = inject(ConfigService);

  // Signals per lo stato dell'autenticazione
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isLoadingSignal = signal<boolean>(false);

  // Subjects per compatibilità observable
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Getters pubblici per i signals (readonly)
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  // Observables per compatibilità
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Computed signals
  public readonly isAdmin = computed(() => {
    const user = this.currentUserSignal();
    return user?.groups.some((group: any) => group.name === 'Administrators') ?? false;
  });

  public readonly userPermissions = computed(() => {
    return this.currentUserSignal()?.permissions ?? [];
  });

  private apiBaseUrl = computed(() => this.configService.config()?.apiBaseUrl ?? 'http://localhost:5000');
  private refreshTokenTimer?: any;

  constructor() {
    // Carica il token dal localStorage al startup
    this.loadTokenFromStorage();

    // Auto-refresh del token
    this.startTokenRefreshTimer();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this.isLoadingSignal.set(true);

    try {
      const response = await this.http.post<LoginResponse>(
        `${this.apiBaseUrl()}/api/auth/login`,
        credentials
      ).toPromise();

      if (!response) {
        throw new Error('Risposta vuota dal server');
      }

      this.setAuthData(response);
      return response;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      try {
        await this.http.post(`${this.apiBaseUrl()}/api/auth/logout`, { refreshToken }).toPromise();
      } catch (error) {
        console.warn('Errore durante il logout:', error);
      }
    }

    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await this.http.post<LoginResponse>(
        `${this.apiBaseUrl()}/api/auth/refresh`,
        { refreshToken }
      ).toPromise();

      if (response) {
        this.setAuthData(response);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Errore durante il refresh del token:', error);
      this.logout();
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.http.get<User>(`${this.apiBaseUrl()}/api/auth/me`).toPromise();
      if (user) {
        this.setUser(user);
      }
      return user || null;
    } catch (error) {
      console.error('Errore nel recupero dell\'utente corrente:', error);
      this.logout();
      return null;
    }
  }

  async changePassword(passwordData: ChangePassword): Promise<void> {
    await this.http.post(`${this.apiBaseUrl()}/api/auth/change-password`, passwordData).toPromise();
  }

  hasPermission(resource: string, action: string): boolean {
    const permissions = this.userPermissions();
    return permissions.includes(`${resource}:${action}`);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.userPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  isInSecurityGroup(groupName: string): boolean {
    const user = this.currentUserSignal();
    return user?.groups.some((group: any) => group.name === groupName) ?? false;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setAuthData(authData: LoginResponse): void {
    // Salva i token
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('tokenExpiry', authData.expiresAt);

    // Aggiorna lo stato
    this.setUser(authData.user);
    this.isAuthenticatedSignal.set(true);
    this.isAuthenticatedSubject.next(true);

    // Riavvia il timer per il refresh
    this.startTokenRefreshTimer();
  }

  private setUser(user: User): void {
    this.currentUserSignal.set(user);
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');

    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }
  }

  private loadTokenFromStorage(): void {
    const token = this.getAccessToken();
    const expiry = localStorage.getItem('tokenExpiry');

    if (token && expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate > new Date()) {
        this.isAuthenticatedSignal.set(true);
        this.isAuthenticatedSubject.next(true);

        // Recupera i dati dell'utente
        this.getCurrentUser();
      } else {
        // Token scaduto, prova il refresh
        this.refreshToken();
      }
    }
  }

  private startTokenRefreshTimer(): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return;

    const expiryDate = new Date(expiry);
    const now = new Date();
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();

    // Refresh 5 minuti prima della scadenza
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000);

    this.refreshTokenTimer = setTimeout(async () => {
      const success = await this.refreshToken();
      if (success) {
        this.startTokenRefreshTimer();
      }
    }, refreshTime);
  }

  private handleAuthError(error: any): void {
    console.error('Errore di autenticazione:', error);

    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.logout();
      }
    }
  }

}