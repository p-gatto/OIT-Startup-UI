import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { User } from '../../auth/models/user.model';
import { Group } from '../../auth/models/group.model';
import { CreateUser } from '../../auth/models/create-user.model';
import { UpdateUser } from '../../auth/models/update-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private readonly apiBaseUrl$ = this.configService.config$.pipe(
    map(config => config?.apiBaseUrl ?? 'http://localhost:5000')
  );

  getUsers(): Observable<User[]> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<User[]>(`${baseUrl}/api/users`).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  getUserById(id: number): Observable<User> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<User>(`${baseUrl}/api/users/${id}`).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  createUser(user: CreateUser): Observable<User> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.post<User>(`${baseUrl}/api/users`, user).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  updateUser(id: number, user: UpdateUser): Observable<User> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.put<User>(`${baseUrl}/api/users/${id}`, user).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  deleteUser(id: number): Observable<boolean> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.delete<void>(`${baseUrl}/api/users/${id}`).pipe(
          map(() => true),
          catchError(this.handleError)
        )
      )
    );
  }

  resetPassword(id: number, newPassword: string): Observable<boolean> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.post<void>(`${baseUrl}/api/users/${id}/reset-password`, { newPassword }).pipe(
          map(() => true),
          catchError(this.handleError)
        )
      )
    );
  }

  getGroups(): Observable<Group[]> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<Group[]>(`${baseUrl}/api/security-groups`).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('UserService error:', error);
    return throwError(() => error);
  }
}