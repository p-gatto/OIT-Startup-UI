import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { environment } from "../../../../environments/environment";

import { ConfigService } from '../../config/config.service';

import { CreatePermission } from '../../auth/models/create-permission.model';
import { Permission } from '../../auth/models/permission.model';

import { Group } from '../../auth/models/group.model';
import { CreateGroup } from '../../auth/models/create-group.model';
import { UpdateGroup } from '../../auth/models/update-group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  groupsBaseUrl = signal(environment.apiBaseUrl);

  private readonly apiBaseUrl$ = this.configService.config$.pipe(
    map(config => config?.apiBaseUrl ?? environment.apiBaseUrl)
  );

  constructor() {
    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        this.groupsBaseUrl.set(config.apiBaseUrl);
        console.log('Get groupsBaseUrl da *** groupsService ***: ', this.groupsBaseUrl());
      }
    });
  }

  // ========== GROUP METHODS ==========

  getGroups(): Observable<Group[]> {
    /*  return this.apiBaseUrl$.pipe(
       switchMap(baseUrl =>
         this.http.get<Group[]>(`${baseUrl}/api/groups`).pipe(
           catchError(this.handleError)
         )
       )
     ); */

    return this.http.get<Group[]>(`${this.groupsBaseUrl()}/api/groups`).pipe(
      catchError(this.handleError)
    );
  }

  getGroupById(id: number): Observable<Group> {
    /*  return this.apiBaseUrl$.pipe(
       switchMap(baseUrl =>
         this.http.get<Group>(`${baseUrl}/api/groups/${id}`).pipe(
           catchError(this.handleError)
         )
       )
     ); */

    return this.http.get<Group>(`${this.groupsBaseUrl()}/api/groups/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createGroup(group: CreateGroup): Observable<Group> {
    /*    return this.apiBaseUrl$.pipe(
         switchMap(baseUrl =>
           this.http.post<Group>(`${baseUrl}/api/groups`, group).pipe(
             catchError(this.handleError)
           )
         )
       ); */

    return this.http.post<Group>(`${this.groupsBaseUrl()}/api/groups`, group).pipe(
      catchError(this.handleError)
    );
  }

  updateGroup(id: number, group: UpdateGroup): Observable<Group> {
    /*   return this.apiBaseUrl$.pipe(
        switchMap(baseUrl =>
          this.http.put<Group>(`${baseUrl}/api/groups/${id}`, group).pipe(
            catchError(this.handleError)
          )
        )
      ); */

    return this.http.put<Group>(`${this.groupsBaseUrl()}/api/groups/${id}`, group).pipe(
      catchError(this.handleError)
    );
  }

  deleteGroup(id: number): Observable<boolean> {
    /*  return this.apiBaseUrl$.pipe(
       switchMap(baseUrl =>
         this.http.delete<void>(`${baseUrl}/api/groups/${id}`).pipe(
           map(() => true),
           catchError(this.handleError)
         )
       )
     );
  */
    return this.http.delete<void>(`${this.groupsBaseUrl()}/api/groups/${id}`).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  assignPermissionsToGroup(groupId: number, permissionIds: number[]): Observable<boolean> {
    /*  return this.apiBaseUrl$.pipe(
       switchMap(baseUrl =>
         this.http.put<void>(`${baseUrl}/api/groups/${groupId}/permissions`, { PermissionIds: permissionIds }).pipe(
           map(() => true),
           catchError(this.handleError)
         )
       )
     ); */

    return this.http.put<void>(`${this.groupsBaseUrl()}/api/groups/${groupId}/permissions`, { PermissionIds: permissionIds }).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  // ========== PERMISSION METHODS ==========

  getPermissions(): Observable<Permission[]> {
    /*  return this.apiBaseUrl$.pipe(
       switchMap(baseUrl =>
         this.http.get<Permission[]>(`${baseUrl}/api/groups/permissions`).pipe(
           catchError(this.handleError)
         )
       )
     ); */

    return this.http.get<Permission[]>(`${this.groupsBaseUrl()}/api/groups/permissions`).pipe(
      catchError(this.handleError)
    );
  }

  createPermission(permission: CreatePermission): Observable<Permission> {
    /* return this.apiBaseUrl$.pipe(
      switchMap(baseUrl =>
        this.http.post<Permission>(`${baseUrl}/api/groups/permissions`, permission).pipe(
          catchError(this.handleError)
        )
      )
    ); */

    return this.http.post<Permission>(`${this.groupsBaseUrl()}/api/groups/permissions`, permission).pipe(
      catchError(this.handleError)
    );
  }

  deletePermission(id: number): Observable<boolean> {
    /*   return this.apiBaseUrl$.pipe(
        switchMap(baseUrl =>
          this.http.delete<void>(`${baseUrl}/api/groups/permissions/${id}`).pipe(
            map(() => true),
            catchError(this.handleError)
          )
        )
      ); */

    return this.http.delete<void>(`${this.groupsBaseUrl()}/api/groups/permissions/${id}`).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('UserService error:', error);
    return throwError(() => error);
  }

}