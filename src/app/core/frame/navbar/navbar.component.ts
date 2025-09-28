import { Component, EventEmitter, inject, Output, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: [`./navbar.component.css`]
})
export class NavbarComponent implements OnDestroy {

  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  // Use RxJS streams instead of signals
  protected readonly isAuthenticated$ = this.authService.isAuthenticated$;
  protected readonly currentUser$ = this.authService.currentUser$;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuToggle() {
    this.menuToggle.emit();
  }

  onProfileClick() {
    console.log('Profile clicked');
  }

  onLogoutClick() {
    this.logout.emit();
  }

  onThemeClick() {
    console.log('Theme clicked');
  }

  onLanguageClick() {
    console.log('Language clicked');
  }

  onNotificationsClick() {
    console.log('Notifications clicked');
  }

  onConfigClick() {
    console.log('Config clicked');
  }

  onInfoClick() {
    const appInfo = `
      🚀 La Mia Webapp v1.0.0
      
      📋 Caratteristiche:
      • Angular 20 + Material Design
      • Architettura modulare
      • Menu a 2 livelli
      • Design responsivo
      • Sistema di autenticazione JWT
      • Gestione utenti e gruppi
      
      👨‍💻 Sviluppata con ❤️
    `;
    alert(appInfo);
  }
}