import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
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

import { Subject, takeUntil, finalize, switchMap, of } from 'rxjs';

import { Group } from '../../auth/models/group.model';
import { User } from '../../auth/models/user.model';
import { UsersService } from './users.service';
import { AuthService } from '../../auth/auth.service';
import { GroupsService } from '../groups/groups.service';

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
export default class UsersComponent implements OnInit, OnDestroy {

  private readonly usersService = inject(UsersService);
  private readonly groupsService = inject(GroupsService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly destroy$ = new Subject<void>();

  // Signals
  protected users = signal<User[]>([]);
  protected loading = signal(true);
  protected securityGroups = signal<Group[]>([]);

  // Use RxJS streams for permission checking
  protected readonly canManageUsers$ = this.authService.hasPermission('User', 'Create');
  protected readonly canDeleteUsers$ = this.authService.hasPermission('User', 'Delete');

  displayedColumns: string[] = ['avatar', 'fullName', 'email', 'Groups', 'status', 'lastLogin', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.loading.set(true);

    this.usersService.getUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (users) => this.users.set(users || []),
        error: (error) => {
          console.error('Errore durante il caricamento degli utenti:', error);
          this.snackBar.open('Errore durante il caricamento degli utenti', 'Chiudi', { duration: 3000 });
        }
      });
  }

  private loadGroups(): void {
    this.groupsService.getGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groups) => this.securityGroups.set(groups || []),
        error: (error) => {
          console.error('Errore durante il caricamento dei gruppi di sicurezza:', error);
        }
      });
  }

  openUserDialog(user?: User): void {
    // Check permissions first
    const permissionCheck$ = user ?
      this.authService.hasPermission('User', 'Update') :
      this.authService.hasPermission('User', 'Create');

    permissionCheck$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(hasPermission => {
          if (!hasPermission) {
            this.snackBar.open('Permessi insufficienti', 'Chiudi', { duration: 3000 });
            return of(null);
          }

          // Importa il dialog component dinamicamente
          return import('./dialog/user-dialog/user-dialog.component').then(({ UserDialogComponent }) => {
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

            return dialogRef;
          });
        })
      )
      .subscribe();
  }

  resetPassword(user: User): void {
    this.authService.hasPermission('User', 'Update')
      .pipe(
        takeUntil(this.destroy$),
        switchMap(hasPermission => {
          if (!hasPermission) {
            this.snackBar.open('Permessi insufficienti', 'Chiudi', { duration: 3000 });
            return of(null);
          }

          const confirmed = confirm(`Vuoi resettare la password per l'utente ${user.fullName}?`);
          if (!confirmed) {
            return of(null);
          }

          const newPassword = this.generateTemporaryPassword();
          return this.usersService.resetPassword(user.id, newPassword);
        })
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.snackBar.open(
              `Password resettata. Nuova password: ${this.generateTemporaryPassword()}`,
              'Chiudi',
              { duration: 10000 }
            );
          }
        },
        error: (error) => {
          console.error('Errore durante il reset della password:', error);
          this.snackBar.open('Errore durante il reset della password', 'Chiudi', { duration: 3000 });
        }
      });
  }

  deleteUser(user: User): void {
    this.authService.hasPermission('User', 'Delete')
      .pipe(
        takeUntil(this.destroy$),
        switchMap(hasPermission => {
          if (!hasPermission) {
            this.snackBar.open('Permessi insufficienti', 'Chiudi', { duration: 3000 });
            return of(null);
          }

          if (user.id === 1) {
            this.snackBar.open('Non è possibile eliminare l\'amministratore di sistema', 'Chiudi', { duration: 3000 });
            return of(null);
          }

          const confirmed = confirm(`Sei sicuro di voler eliminare l'utente ${user.fullName}?`);
          if (!confirmed) {
            return of(null);
          }

          return this.usersService.deleteUser(user.id);
        })
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.snackBar.open('Utente eliminato con successo', 'Chiudi', { duration: 3000 });
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione dell\'utente:', error);
          const message = error?.error?.message || 'Errore durante l\'eliminazione dell\'utente';
          this.snackBar.open(message, 'Chiudi', { duration: 3000 });
        }
      });
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