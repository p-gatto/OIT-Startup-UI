import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatNavList } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MenuSection } from './menu-section.model';
import { Router, RouterLink } from '@angular/router';
import { MenuService } from '../../management/menu/menu.service';
import { MenuGroupDto } from '../../management/menu/menu.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from '../../config/config.service';

@Component({
  selector: 'app-sidenav',
  imports: [
    NgIf,
    NgFor,
    MatSidenavModule,
    MatIconModule,
    MatNavList,
    MatListModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  router = inject(Router);
  menuService = inject(MenuService);
  configService = inject(ConfigService);

  @Output() navigationClick = new EventEmitter<string>();

  expandedGroups: Set<string> = new Set();
  loading = false;

  menuSections: MenuSection[] = [
    {
      title: 'Credenziali',
      items: [
        { title: 'Tutte le credenziali', icon: 'list', route: '/credentials', queryParams: {} },
        { title: 'Credenziali attive', icon: 'check_circle', route: '/credentials', queryParams: { active: true } },
        { title: 'Credenziali scadute', icon: 'error', route: '/credentials', queryParams: { expired: true } },
        { title: 'Credenziali recenti', icon: 'update', route: '/credentials', queryParams: { sort: 'created', sortDirection: 'desc' } }
      ]
    },
    {
      title: 'Dashboard',
      items: [
        { title: 'Panoramica', icon: 'dashboard', route: '/dashboard', queryParams: {} },
        { title: 'Statistiche', icon: 'bar_chart', route: '/stats', queryParams: {} }
      ]
    },
    {
      title: 'Gestione',
      items: [
        {
          title: 'Utenti',
          icon: 'people',
          route: '',
          queryParams: {},
          children: [
            { title: 'Lista Utenti', icon: 'list', route: '/users/list', queryParams: {} },
            { title: 'Aggiungi Utente', icon: 'person_add', route: '/users/add', queryParams: {} },
            { title: 'Ruoli & Permessi', icon: 'admin_panel_settings', route: '/users/roles', queryParams: {} }
          ]
        },
        {
          title: 'Prodotti',
          icon: 'inventory',
          route: '',
          queryParams: {},
          children: [
            { title: 'Catalogo', icon: 'catalog', route: '/products/catalog', queryParams: {} },
            { title: 'Categorie', icon: 'category', route: '/products/categories', queryParams: {} },
            { title: 'Inventario', icon: 'warehouse', route: '/products/inventory', queryParams: {} }
          ]
        }
      ]
    },
    {
      title: 'Analisi',
      items: [
        { title: 'Reports', icon: 'assessment', route: '/reports', queryParams: {} },
        {
          title: 'Analytics',
          icon: 'analytics',
          children: [
            { title: 'Panoramica', icon: 'insights', route: '/analytics/overview', queryParams: {} },
            { title: 'Vendite', icon: 'trending_up', route: '/analytics/sales', queryParams: {} },
            { title: 'Traffico', icon: 'traffic', route: '/analytics/traffic', queryParams: {} }
          ]
        }
      ]
    },
    {
      title: 'Sistema',
      items: [
        { title: 'Configurazione', icon: 'tune', route: '/config', queryParams: {} },
        { title: 'Log Sistema', icon: 'list_alt', route: '/logs', queryParams: {} },
        { title: 'Supporto', icon: 'help', route: '/support', queryParams: {} }
      ]
    }
  ];

  menu: MenuGroupDto[] = [];

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

  }

  loadMenu() {
    this.loading = true;
    this.menuService.getMenuStructure().subscribe({
      next: (menuResult) => {
        this.menu = menuResult;
        console.log('this.menu da *** sidenav Component ==> ', this.menu);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Menu!!!', error);
        this.loading = false;
      }
    });
  }

  toggleGroup(groupTitle: string) {

    if (this.expandedGroups.has(groupTitle)) {
      this.expandedGroups.delete(groupTitle);
    } else {
      this.expandedGroups.add(groupTitle);
    }

  }

  isGroupExpanded(groupTitle: string): boolean {
    return this.expandedGroups.has(groupTitle);
  }

  navigate(route: string) {
    this.navigationClick.emit(route);
  }

  navigateTo(route: string, queryParams: any): void {
    this.router.navigate([route], { queryParams });
    this.navigationClick.emit(route);
  }

  /////////////////////////////////////////////////
  // Mappa per tenere traccia delle sezioni espanse
  private expandedSections = new Set<string>();

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
  isLastSection(menuItem: any): boolean {
    return this.menu.indexOf(menuItem) === this.menu.length - 1;
  }

}