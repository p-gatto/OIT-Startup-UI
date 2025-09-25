import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Group } from '../../auth/models/group.model';
import { User } from '../../auth/models/user.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export default class UsersComponent implements OnInit {

  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Signals
  protected users = signal<User[]>([]);
  protected loading = signal(true);
  protected securityGroups = signal<Group[]>([]);

  displayedColumns: string[] = ['avatar', 'fullName', 'email', 'securityGroups', 'status', 'lastLogin', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
    this.loadSecurityGroups();
  }

  private async loadUsers(): Promise<void> {
    try {
      this.loading.set(true);
      const users = await this.userService.getUsers().toPromise();
      this.users.set(users || []);
    } catch (error) {
      console.error('Errore durante il caricamento degli utenti:', error);
      this.snackBar.open('Errore durante il caricamento degli utenti', 'Chiudi', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  private async loadSecurityGroups(): Promise<void> {
    try {
      const groups = await this.userService.getGroups().toPromise();
      this.securityGroups.set(groups || []);
    } catch (error) {
      console.error('Errore durante il caricamento dei gruppi di sicurezza:', error);
    }
  }

  openUserDialog(user?: User): void {
    // Importa il dialog component dinamicamente
    import('./dialog/user-dialog/user-dialog.component').then(({ UserDialogComponent }) => {
      const dialogRef = this.dialog.open(UserDialogComponent, {
        width: '600px',
        maxWidth: '90vw',
        data: { user, securityGroups: this.securityGroups() }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadUsers();
        }
      });
    });
  }

  async resetPassword(user: User): Promise<void> {
    const confirmed = confirm(`Vuoi resettare la password per l'utente ${user.fullName}?`);
    if (confirmed) {
      try {
        const newPassword = this.generateTemporaryPassword();
        await this.userService.resetPassword(user.id, newPassword).toPromise();

        this.snackBar.open(
          `Password resettata. Nuova password: ${newPassword}`,
          'Chiudi',
          { duration: 10000 }
        );
      } catch (error) {
        console.error('Errore durante il reset della password:', error);
        this.snackBar.open('Errore durante il reset della password', 'Chiudi', { duration: 3000 });
      }
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = confirm(`Sei sicuro di voler eliminare l'utente ${user.fullName}?`);
    if (confirmed) {
      try {
        await this.userService.deleteUser(user.id).toPromise();
        this.snackBar.open('Utente eliminato con successo', 'Chiudi', { duration: 3000 });
        this.loadUsers();
      } catch (error: any) {
        console.error('Errore durante l\'eliminazione dell\'utente:', error);
        const message = error?.error?.message || 'Errore durante l\'eliminazione dell\'utente';
        this.snackBar.open(message, 'Chiudi', { duration: 3000 });
      }
    }
  }

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getGroupChipClass(group: Group): string {
    switch (group.name) {
      case 'Administrators':
        return 'admin-chip';
      case 'Managers':
        return 'manager-chip';
      default:
        return 'user-chip';
    }
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

}