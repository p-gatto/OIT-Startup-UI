import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';

import { NavbarComponent } from './core/frame/navbar/navbar.component';
import { FooterComponent } from "./core/frame/footer/footer.component";
import { SidenavComponent } from './core/frame/sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    NavbarComponent,
    FooterComponent,
    SidenavComponent
  ],
  template: `
    <div class="app-container">

      <!-- Header Component -->
      <app-navbar (menuToggle)="toggleSidebar()"></app-navbar>

      <!-- Main Content Area with Sidebar -->
      <mat-sidenav-container class="app-sidenav-container">

          <!-- Sidebar Component -->
          <mat-sidenav #sidenav mode="side" class="app-sidenav" [opened]="sidebarOpen" (closed)="sidebarOpen = false">
              <app-sidenav (navigationClick)="onNavigation($event)"></app-sidenav>
          </mat-sidenav>

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
        padding: 1rem;
        overflow-y: auto;
        min-width: 100%;
    }

    @media (max-width: 768px) {
        .app-sidenav {
            width: 100%;
        }
    }
  `
})
export class App {
  protected readonly title = signal('OIT Startup');

  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onNavigation(route: string) {
    console.log('Navigating to:', route);
    // Implementa la navigazione qui
    // this.router.navigate([route]);
    this.sidebarOpen = false;
  }
}
