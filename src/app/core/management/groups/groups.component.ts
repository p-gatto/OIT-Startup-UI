import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Group } from '../../auth/models/group.model';
import { Permission } from '../../auth/models/permission.model';
import { UserService } from '../users/user.service';
import { SecurityGroupDialog } from './dialog/security-group-dialog/security-group-dialog.component';
import { GroupPermissionsDialog } from './dialog/group-permissions-dialog/group-permissions-dialog.component';

@Component({
  selector: 'app-groups',
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
    MatExpansionModule,
    MatCheckboxModule
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export default class GroupsComponent implements OnInit {

  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Signals
  protected securityGroups = signal<Group[]>([]);
  protected loading = signal(true);
  protected permissions = signal<Permission[]>([]);

  ngOnInit(): void {
    this.loadSecurityGroups();
    this.loadPermissions();
  }

  private async loadSecurityGroups(): Promise<void> {
    try {
      this.loading.set(true);
      const groups = await this.userService.getGroups().toPromise();
      this.securityGroups.set(groups || []);
    } catch (error) {
      console.error('Errore durante il caricamento dei gruppi di sicurezza:', error);
      this.snackBar.open('Errore durante il caricamento dei gruppi', 'Chiudi', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPermissions(): Promise<void> {
    try {
      const permissions = await this.userService.getPermissions().toPromise();
      this.permissions.set(permissions || []);
    } catch (error) {
      console.error('Errore durante il caricamento dei permessi:', error);
    }
  }

  openGroupDialog(group?: Group): void {
    const dialogRef = this.dialog.open(SecurityGroupDialog, {
      width: '500px',
      data: { group }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSecurityGroups();
      }
    });
  }

  openPermissionsDialog(group: Group): void {
    const dialogRef = this.dialog.open(GroupPermissionsDialog, {
      width: '700px',
      data: { group, permissions: this.permissions() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSecurityGroups();
      }
    });
  }

  async deleteGroup(group: Group): Promise<void> {
    if (group.isSystemGroup) {
      this.snackBar.open('Non è possibile eliminare un gruppo di sistema', 'Chiudi', { duration: 3000 });
      return;
    }

    if (group.userCount > 0) {
      this.snackBar.open('Non è possibile eliminare un gruppo con utenti assegnati', 'Chiudi', { duration: 3000 });
      return;
    }

    const confirmed = confirm(`Sei sicuro di voler eliminare il gruppo "${group.name}"?`);
    if (confirmed) {
      try {
        await this.userService.deleteGroup(group.id).toPromise();
        this.snackBar.open('Gruppo eliminato con successo', 'Chiudi', { duration: 3000 });
        this.loadSecurityGroups();
      } catch (error: any) {
        console.error('Errore durante l\'eliminazione del gruppo:', error);
        const message = error?.error?.message || 'Errore durante l\'eliminazione del gruppo';
        this.snackBar.open(message, 'Chiudi', { duration: 3000 });
      }
    }
  }

  getPermissionIcon(resource: string): string {
    const icons: { [key: string]: string } = {
      'Menu': 'menu',
      'User': 'people',
      'SecurityGroup': 'security',
      'Report': 'assessment',
      'System': 'settings'
    };
    return icons[resource] || 'lock';
  }
}