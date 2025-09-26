import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { Subject, takeUntil, filter } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';

import { NavbarComponent } from './core/frame/navbar/navbar.component';
import { FooterComponent } from "./core/frame/footer/footer.component";
import { SidenavComponent } from './core/frame/sidenav/sidenav.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    NavbarComponent,
    FooterComponent,
    SidenavComponent
  ],
  template: `
    <!-- Layout per pagine pubbliche (login, errori) -->
    @if (isPublicPage()) {
      <router-outlet></router-outlet>
    }

    <!-- Layout principale per pagine autenticate -->
    @if (!isPublicPage()) {
      <div class="app-container">

        <!-- Header Component -->
        <app-navbar (menuToggle)="toggleSidebar()" (logout)="onLogout()"></app-navbar>

        <!-- Main Content Area with Sidebar -->
        <mat-sidenav-container class="app-sidenav-container">

            <!-- Sidebar Component - Solo se autenticato -->
            @if (isAuthenticated()) {
              <mat-sidenav #sidenav mode="side" class="app-sidenav" [opened]="sidebarOpen()" (closed)="sidebarOpen.set(false)">
                  <app-sidenav (navigationClick)="onNavigation($event)"></app-sidenav>
              </mat-sidenav>
            }

            <!-- Main Content -->
            <mat-sidenav-content class="app-content">
                <div class="content-wrapper">
                    <router-outlet></router-outlet>
                </div>
            </mat-sidenav-content>
        </mat-sidenav-container>

        <!-- Footer Component -->
        <app-footer></app-footer>

      </div>
    }
  `,
  styles: `
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    .app-sidenav-container {
        flex: 1;
        display: flex;
    }

    .app-sidenav {
        width: 300px;
        box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    }

    .app-content {
        display: flex;
        flex-direction: column;
        min-width: 100%;
    }

    .content-wrapper {
        flex: 1;
        overflow-y: auto;
        min-width: 100%;
    }

    .public-route .content-wrapper {
        padding: 0;
    }

    @media (max-width: 768px) {
        .app-sidenav {
            width: 100%;
        }
        
        .content-wrapper {
            padding: 0.5rem;
        }
    }
  `
})
export class App implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  protected readonly title = signal('OIT Startup');
  protected readonly sidebarOpen = signal(false);

  // Use RxJS streams instead of computed signals for auth
  protected readonly isAuthenticated = signal(false);
  protected readonly currentUser = signal(null);

  // Signals per la gestione delle pagine pubbliche
  private currentRoute = signal('');

  protected readonly isPublicPage = computed(() => {
    const route = this.currentRoute();
    const publicRoutes = ['/login', '/unauthorized', '/not-found'];
    return publicRoutes.some(publicRoute => route.startsWith(publicRoute));
  });

  constructor() {
    // Subscribe to auth changes
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => this.isAuthenticated.set(isAuth));

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => this.currentUser.set(user));

    // Traccia i cambiamenti di rotta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);

      // Chiudi la sidebar su mobile quando cambia rotta
      if (window.innerWidth <= 768) {
        this.sidebarOpen.set(false);
      }
    });

    // Imposta la rotta iniziale
    this.currentRoute.set(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  onNavigation(route: string): void {
    console.log('Navigating to:', route);
    this.router.navigate([route]);

    // Chiudi la sidebar su mobile dopo la navigazione
    if (window.innerWidth <= 768) {
      this.sidebarOpen.set(false);
    }
  }

  onLogout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}