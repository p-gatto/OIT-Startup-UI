import { Component, EventEmitter, inject, OnInit, Output, signal, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatNavList } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { Subject, takeUntil } from 'rxjs';

import { ConfigService } from '../../config/config.service';
import { MenuSection } from './menu-section.model';
import { MenuService } from '../../management/menu/menu.service';
import { MenuGroupDto } from '../../management/menu/menu.model';

@Component({
  selector: 'app-sidenav',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatNavList,
    MatListModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private menuService = inject(MenuService);
  private configService = inject(ConfigService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Output() navigationClick = new EventEmitter<string>();

  // Signals per gestire lo stato
  protected menu = signal<MenuGroupDto[]>([]);
  protected loading = signal(false);

  expandedGroups: Set<string> = new Set();
  private expandedSections = new Set<string>();

  constructor() {

    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        console.log('Config Da *** Sidenav ***: ', config);
        this.loadMenu();
      }
    });

    // Espandi automaticamente alcune sezioni all'inizializzazione
    this.expandedSections.add('Gestione'); // Espandi la sezione Gestione di default
  }

  ngOnInit(): void {
    this.initializeMenu();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMenu(): void {
    // Prima inizializza con un array vuoto
    this.menu.set([]);

    // Poi sottoscriviti ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(config => {
      if (config) {
        console.log('Config received in Sidenav:', config);
        // Usa setTimeout per evitare l'errore ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loadMenu();
        });
      }
    });
  }

  private loadMenu(): void {
    this.loading.set(true);

    this.menuService.getMenuStructure().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (menuResult) => {
        // Usa setTimeout per assicurarsi che l'aggiornamento avvenga nel prossimo ciclo di change detection
        setTimeout(() => {
          this.menu.set(menuResult);
          this.loading.set(false);
          console.log('Menu loaded in Sidenav:', menuResult);
          this.cdr.detectChanges(); // Forza la detection delle modifiche
        });
      },
      error: (error) => {
        console.error('Error loading Menu in Sidenav:', error);
        setTimeout(() => {
          this.loading.set(false);
          this.cdr.detectChanges();
        });
      }
    });
  }

  toggleGroup(groupTitle: string): void {
    if (this.expandedGroups.has(groupTitle)) {
      this.expandedGroups.delete(groupTitle);
    } else {
      this.expandedGroups.add(groupTitle);
    }
  }

  isGroupExpanded(groupTitle: string): boolean {
    return this.expandedGroups.has(groupTitle);
  }

  navigate(route: string): void {
    this.navigationClick.emit(route);
  }

  navigateTo(route: string, queryParams: any): void {
    this.router.navigate([route], { queryParams });
    this.navigationClick.emit(route);
  }

  // Metodo per espandere/collassare una sezione
  toggleSection(sectionTitle: string): void {
    if (this.expandedSections.has(sectionTitle)) {
      this.expandedSections.delete(sectionTitle);
    } else {
      this.expandedSections.add(sectionTitle);
    }
  }

  // Metodo per verificare se una sezione è espansa
  isSectionExpanded(sectionTitle: string): boolean {
    return this.expandedSections.has(sectionTitle);
  }

  // Metodo per verificare se è l'ultima sezione (per il divider)
  isLastSection(menuItem: MenuGroupDto): boolean {
    const currentMenu = this.menu();
    return currentMenu.indexOf(menuItem) === currentMenu.length - 1;
  }
}