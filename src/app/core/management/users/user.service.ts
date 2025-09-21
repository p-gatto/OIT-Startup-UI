import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ConfigService } from '../../config/config.service';

import { Permission } from '../../auth/models/permission.model';
import { CreatePermission } from '../../auth/models/create-permission.model';

import { Group } from '../../auth/models/group.model';
import { CreateGroup } from '../../auth/models/create-group.model';
import { UpdateGroup } from '../../auth/models/update-group.model';

import { User } from '../../auth/models/user.model';
import { CreateUser } from '../../auth/models/create-user.model';
import { UpdateUser } from '../../auth/models/update-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private apiBaseUrl = computed(() => this.configService.config()?.apiBaseUrl ?? 'http://localhost:5000');

  // User management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiBaseUrl()}/api/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiBaseUrl()}/api/users/${id}`);
  }

  createUser(user: CreateUser): Observable<User> {
    return this.http.post<User>(`${this.apiBaseUrl()}/api/users`, user);
  }

  updateUser(id: number, user: UpdateUser): Observable<User> {
    return this.http.put<User>(`${this.apiBaseUrl()}/api/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl()}/api/users/${id}`);
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl()}/api/users/${id}/reset-password`, { newPassword });
  }

  assignSecurityGroups(id: number, securityGroupIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiBaseUrl()}/api/users/${id}/security-groups`, { securityGroupIds });
  }

  // Security Groups management
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiBaseUrl()}/api/security-groups`);
  }

  getGroup(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiBaseUrl()}/api/security-groups/${id}`);
  }

  createGroup(group: CreateGroup): Observable<Group> {
    return this.http.post<Group>(`${this.apiBaseUrl()}/api/security-groups`, group);
  }

  updateGroup(id: number, group: UpdateGroup): Observable<Group> {
    return this.http.put<Group>(`${this.apiBaseUrl()}/api/security-groups/${id}`, group);
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl()}/api/security-groups/${id}`);
  }

  assignPermissionsToGroup(id: number, permissionIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiBaseUrl()}/api/security-groups/${id}/permissions`, { permissionIds });
  }

  // Permissions management
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiBaseUrl()}/api/security-groups/permissions`);
  }

  createPermission(permission: CreatePermission): Observable<Permission> {
    return this.http.post<Permission>(`${this.apiBaseUrl()}/api/security-groups/permissions`, permission);
  }

  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl()}/api/security-groups/permissions/${id}`);
  }

}