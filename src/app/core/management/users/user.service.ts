import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { User } from '../../auth/models/user.model';
import { Group } from '../../auth/models/group.model';
import { Permission } from '../../auth/models/permission.model';
import { CreateUser } from '../../auth/models/create-user.model';
import { UpdateUser } from '../../auth/models/update-user.model';
import { CreateGroup } from '../../auth/models/create-group.model';
import { UpdateGroup } from '../../auth/models/update-group.model';
import { CreatePermission } from '../../auth/models/create-permission.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private readonly apiBaseUrl$ = this.configService.config$.pipe(
    map(config => config?.apiBaseUrl ?? 'http://localhost:5000')
  );

  // ========== USER METHODS ==========

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

  assignSecurityGroupsToUser(userId: number, groupIds: number[]): Observable<boolean> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.put<void>(`${baseUrl}/api/users/${userId}/security-groups`, { securityGroupIds: groupIds }).pipe(
          map(() => true),
          catchError(this.handleError)
        )
      )
    );
  }

  // ========== GROUP METHODS ==========

  getGroups(): Observable<Group[]> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<Group[]>(`${baseUrl}/api/groups`).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  getGroupById(id: number): Observable<Group> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<Group>(`${baseUrl}/api/groups/${id}`).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  createGroup(group: CreateGroup): Observable<Group> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.post<Group>(`${baseUrl}/api/groups`, group).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  updateGroup(id: number, group: UpdateGroup): Observable<Group> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.put<Group>(`${baseUrl}/api/groups/${id}`, group).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  deleteGroup(id: number): Observable<boolean> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.delete<void>(`${baseUrl}/api/groups/${id}`).pipe(
          map(() => true),
          catchError(this.handleError)
        )
      )
    );
  }

  assignPermissionsToGroup(groupId: number, permissionIds: number[]): Observable<boolean> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.put<void>(`${baseUrl}/api/groups/${groupId}/permissions`, { PermissionIds: permissionIds }).pipe(
          map(() => true),
          catchError(this.handleError)
        )
      )
    );
  }

  // ========== PERMISSION METHODS ==========

  getPermissions(): Observable<Permission[]> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.get<Permission[]>(`${baseUrl}/api/groups/permissions`).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  createPermission(permission: CreatePermission): Observable<Permission> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.post<Permission>(`${baseUrl}/api/groups/permissions`, permission).pipe(
          catchError(this.handleError)
        )
      )
    );
  }

  deletePermission(id: number): Observable<boolean> {
    return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.delete<void>(`${baseUrl}/api/groups/permissions/${id}`).pipe(
          map(() => true),
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