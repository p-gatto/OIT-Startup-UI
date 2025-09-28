import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Permission } from '../../../../auth/models/permission.model';
import { Group } from '../../../../auth/models/group.model';
import { PermissionGroup } from '../../../../auth/models/permission-group.model';
import { GroupsService } from '../../groups.service';


interface DialogData {
  group: Group;
  permissions: Permission[];
}

@Component({
  selector: 'app-group-permissions-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './group-permissions-dialog.component.html',
  styleUrl: './group-permissions-dialog.component.scss'
})
export class GroupPermissionsDialog implements OnInit {

  private groupsService = inject(GroupsService);
  private snackBar = inject(MatSnackBar);

  // Form controls
  searchControl = new FormControl('');

  // Signals
  private allPermissions = signal<Permission[]>([]);
  private selectedPermissionIds = signal<Set<number>>(new Set());
  protected isLoading = false;

  // Computed signals
  protected filteredPermissions = signal<Permission[]>([]);
  protected selectedPermissions = signal<Permission[]>([]);
  protected groupedPermissions = signal<PermissionGroup[]>([]);

  constructor(
    private dialogRef: MatDialogRef<GroupPermissionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.initializePermissions();
    this.setupSearch();
  }

  private initializePermissions(): void {
    this.allPermissions.set(this.data.permissions);

    // Inizializza le selezioni con i permessi attuali del gruppo
    const currentPermissionIds = new Set(
      this.data.group.permissions?.map(p => p.id) || []
    );
    this.selectedPermissionIds.set(currentPermissionIds);

    this.updateComputedValues();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterPermissions(searchTerm || '');
    });

    // Inizializza con tutti i permessi
    this.filterPermissions('');
  }

  private filterPermissions(searchTerm: string): void {
    const filtered = this.allPermissions().filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.filteredPermissions.set(filtered);
    this.updateComputedValues();
  }

  private updateComputedValues(): void {
    // Aggiorna permessi selezionati
    const selected = this.filteredPermissions().filter(p =>
      this.selectedPermissionIds().has(p.id)
    );
    this.selectedPermissions.set(selected);

    // Raggruppa per risorsa
    const grouped = this.groupPermissionsByResource(this.filteredPermissions());
    this.groupedPermissions.set(grouped);
  }

  private groupPermissionsByResource(permissions: Permission[]): PermissionGroup[] {
    const groups = new Map<string, Permission[]>();

    permissions.forEach(permission => {
      if (!groups.has(permission.resource)) {
        groups.set(permission.resource, []);
      }
      groups.get(permission.resource)!.push(permission);
    });

    return Array.from(groups.entries()).map(([resource, perms]) => ({
      resource,
      permissions: perms.sort((a, b) => a.action.localeCompare(b.action)),
      icon: this.getResourceIcon(resource)
    })).sort((a, b) => a.resource.localeCompare(b.resource));
  }

  private getResourceIcon(resource: string): string {
    const icons: { [key: string]: string } = {
      'Menu': 'menu',
      'User': 'people',
      'SecurityGroup': 'security',
      'Report': 'assessment',
      'System': 'settings'
    };
    return icons[resource] || 'lock';
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionIds().has(permissionId);
  }

  togglePermission(permissionId: number, isSelected: boolean): void {
    const currentIds = new Set(this.selectedPermissionIds());

    if (isSelected) {
      currentIds.add(permissionId);
    } else {
      currentIds.delete(permissionId);
    }

    this.selectedPermissionIds.set(currentIds);
    this.updateComputedValues();
  }

  selectAll(): void {
    const allIds = new Set(this.filteredPermissions().map(p => p.id));
    this.selectedPermissionIds.set(allIds);
    this.updateComputedValues();
  }

  selectNone(): void {
    this.selectedPermissionIds.set(new Set());
    this.updateComputedValues();
  }

  getSelectedCountForResource(resource: string): number {
    const resourcePermissions = this.filteredPermissions().filter(p => p.resource === resource);
    return resourcePermissions.filter(p => this.selectedPermissionIds().has(p.id)).length;
  }

  async onSave(): Promise<void> {
    this.isLoading = true;

    try {
      const selectedIds = Array.from(this.selectedPermissionIds());
      await this.groupsService.assignPermissionsToGroup(this.data.group.id, selectedIds).toPromise();

      this.snackBar.open('Permessi aggiornati con successo', 'Chiudi', { duration: 3000 });
      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Errore durante l\'aggiornamento dei permessi:', error);
      const message = error?.error?.message || 'Errore durante l\'aggiornamento dei permessi';
      this.snackBar.open(message, 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}