import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { environment } from "../../../../environments/environment";

import { ConfigService } from '../../config/config.service';

import { CreateMenuGroupDto, CreateMenuItemDto, MenuGroupDto, MenuItemDto, UpdateMenuItemDto } from './menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  http = inject(HttpClient);
  configService = inject(ConfigService);

  menuBaseUrl = signal(environment.apiBaseUrl);

  private menuStructureSubject = new BehaviorSubject<MenuGroupDto[]>([]);
  public menuStructure$ = this.menuStructureSubject.asObservable();

  constructor() {
    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        this.menuBaseUrl.set(config.apiBaseUrl);
        console.log('Get menuBaseUrl da *** menu Service ***: ', this.menuBaseUrl());
      }
    });
  }

  getMenuStructure(): Observable<MenuGroupDto[]> {
    return this.http.get<MenuGroupDto[]>(`${this.menuBaseUrl()}/api/menu`).pipe(
      tap(data => this.menuStructureSubject.next(data))
    );
  }

  getMenuGroup(id: number): Observable<MenuGroupDto> {
    return this.http.get<MenuGroupDto>(`${this.menuBaseUrl()}/api/menu/groups/${id}`);
  }

  getMenuItem(id: number): Observable<MenuItemDto> {
    return this.http.get<MenuItemDto>(`${this.menuBaseUrl()}/api/menu/items/${id}`);
  }

  createMenuGroup(dto: CreateMenuGroupDto): Observable<MenuGroupDto> {
    return this.http.post<MenuGroupDto>(`${this.menuBaseUrl()}/api/menu/groups`, dto).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  createMenuItem(dto: CreateMenuItemDto): Observable<MenuItemDto> {
    return this.http.post<MenuItemDto>(`${this.menuBaseUrl()}/api/menu/items`, dto).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  updateMenuGroup(id: number, dto: CreateMenuGroupDto): Observable<MenuGroupDto> {
    return this.http.put<MenuGroupDto>(`${this.menuBaseUrl()}/api/menu/groups/${id}`, dto).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  updateMenuItem(id: number, dto: UpdateMenuItemDto): Observable<MenuItemDto> {
    return this.http.put<MenuItemDto>(`${this.menuBaseUrl()}/api/menu/items/${id}`, dto).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  deleteMenuGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.menuBaseUrl()}/api/menu/groups/${id}`).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.menuBaseUrl()}/api/menu/items/${id}`).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  reorderMenuGroups(orderMap: { [key: number]: number }): Observable<void> {
    return this.http.put<void>(`${this.menuBaseUrl()}/api/menu/groups/reorder`, orderMap).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  reorderMenuItems(orderMap: { [key: number]: number }): Observable<void> {
    return this.http.put<void>(`${this.menuBaseUrl()}/api/menu/items/reorder`, orderMap).pipe(
      tap(() => this.refreshMenuStructure())
    );
  }

  private refreshMenuStructure(): void {
    this.getMenuStructure().subscribe();
  }

}