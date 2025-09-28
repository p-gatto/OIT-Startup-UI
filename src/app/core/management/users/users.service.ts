import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { environment } from "../../../../environments/environment";

import { ConfigService } from '../../config/config.service';

import { User } from '../../auth/models/user.model';
import { Group } from '../../auth/models/group.model';
import { Permission } from '../../auth/models/permission.model';
import { CreateUser } from '../../auth/models/create-user.model';
import { UpdateUser } from '../../auth/models/update-user.model';
import { CreateGroup } from '../../auth/models/create-group.model';
import { UpdateGroup } from '../../auth/models/update-group.model';
import { CreatePermission } from '../../auth/models/create-permission.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  userBaseUrl = signal(environment.apiBaseUrl);

  private readonly apiBaseUrl$ = this.configService.config$.pipe(
    map(config => config?.apiBaseUrl ?? environment.apiBaseUrl)
  );

  constructor() {
    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        this.userBaseUrl.set(config.apiBaseUrl);
        console.log('Get userBaseUrl da *** usersService ***: ', this.userBaseUrl());
      }
    });
  }

  // ========== USER METHODS ==========

  getUsers(): Observable<User[]> {
    /* return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<User[]>(`${baseUrl}/api/users`).pipe(
          catchError(this.handleError)
        )
      )
    ); */
    return this.http.get<User[]>(`${this.userBaseUrl()}/api/users`).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<User> {
    /* return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<User>(`${baseUrl}/api/users/${id}`).pipe(
          catchError(this.handleError)
        )
      )
    ); */

    return this.http.get<User>(`${this.userBaseUrl()}/api/users/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createUser(user: CreateUser): Observable<User> {
    /*  return this.apiBaseUrl$.pipe(
       switchMap(baseUrl =>
         this.http.post<User>(`${baseUrl}/api/users`, user).pipe(
           catchError(this.handleError)
         )
       )
     ); */

    return this.http.post<User>(`${this.userBaseUrl()}/api/users`, user).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(id: number, user: UpdateUser): Observable<User> {
    /* return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.put<User>(`${baseUrl}/api/users/${id}`, user).pipe(
          catchError(this.handleError)
        )
      )
    ); */

    return this.http.put<User>(`${this.userBaseUrl()}/api/users/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(id: number): Observable<boolean> {
    /* return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.delete<void>(`${baseUrl}/api/users/${id}`).pipe(
          map(() => true),
          catchError(this.handleError)
        )
      )
    ); */

    return this.http.delete<void>(`${this.userBaseUrl()}/api/users/${id}`).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  resetPassword(id: number, newPassword: string): Observable<boolean> {
    /*    return this.apiBaseUrl$.pipe(
         switchMap(baseUrl =>
           this.http.post<void>(`${baseUrl}/api/users/${id}/reset-password`, { newPassword }).pipe(
             map(() => true),
             catchError(this.handleError)
           )
         )
       ); */

    return this.http.post<void>(`${this.userBaseUrl()}/api/users/${id}/reset-password`, { newPassword }).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  assignGroupsToUser(userId: number, groupIds: number[]): Observable<boolean> {
    /*    return this.apiBaseUrl$.pipe(
         switchMap(baseUrl =>
           this.http.put<void>(`${baseUrl}/api/users/${userId}/security-groups`, { securityGroupIds: groupIds }).pipe(
             map(() => true),
             catchError(this.handleError)
           )
         )
       ); */

    return this.http.put<void>(`${this.userBaseUrl()}/api/users/${userId}/security-groups`, { securityGroupIds: groupIds }).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('UserService error:', error);
    return throwError(() => error);
  }

}