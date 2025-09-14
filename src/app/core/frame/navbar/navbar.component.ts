import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  imports: [
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
export class NavbarComponent {

  @Output() menuToggle = new EventEmitter<void>();

  onMenuToggle() {
    this.menuToggle.emit();
  }

  onProfileClick() {
    console.log('Profile clicked');
  }

  onLogoutClick() {
    console.log('Logout clicked');
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
    console.log('Notifications clicked');
  }

  onInfoClick() {
    const appInfo = `
      🚀 La Mia Webapp v1.0.0
      
      📋 Caratteristiche:
      • Angular 19 + Material Design
      • Architettura modulare
      • Menu a 2 livelli
      • Design responsivo
      
      👨‍💻 Sviluppata con ❤️
    `;
    alert(appInfo);
  }
}