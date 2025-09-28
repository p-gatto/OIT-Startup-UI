import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { GroupsService } from '../../groups.service';
import { Group } from '../../../../auth/models/group.model';
import { UpdateGroup } from '../../../../auth/models/update-group.model';
import { CreateGroup } from '../../../../auth/models/create-group.model';

interface DialogData {
  group?: Group;
}

@Component({
  selector: 'app-security-group-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './security-group-dialog.component.html',
  styleUrl: './security-group-dialog.component.scss'
})
export class SecurityGroupDialog {

  private groupsService = inject(GroupsService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form: FormGroup;
  isEdit = false;
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<SecurityGroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEdit = !!data.group;
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.group) {
      this.form.patchValue({
        name: this.data.group.name,
        description: this.data.group.description || '',
        isActive: this.data.group.isActive
      });

      // Disabilita il nome per i gruppi di sistema
      if (this.data.group.isSystemGroup) {
        this.form.get('name')?.disable();
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.isLoading = true;

      try {
        const formValue = this.form.getRawValue(); // getRawValue() include anche i campi disabilitati

        if (this.isEdit && this.data.group) {
          const updateData: UpdateGroup = {
            name: formValue.name,
            description: formValue.description,
            isActive: formValue.isActive
          };

          await this.groupsService.updateGroup(this.data.group.id, updateData).toPromise();
          this.snackBar.open('Gruppo aggiornato con successo', 'Chiudi', { duration: 3000 });
        } else {
          const createData: CreateGroup = {
            name: formValue.name,
            description: formValue.description,
            isActive: formValue.isActive
          };

          await this.groupsService.createGroup(createData).toPromise();
          this.snackBar.open('Gruppo creato con successo', 'Chiudi', { duration: 3000 });
        }

        this.dialogRef.close(true);
      } catch (error: any) {
        console.error('Errore durante il salvataggio del gruppo:', error);
        const message = error?.error?.message ||
          (this.isEdit ? 'Errore durante l\'aggiornamento del gruppo' : 'Errore durante la creazione del gruppo');
        this.snackBar.open(message, 'Chiudi', { duration: 3000 });
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

}