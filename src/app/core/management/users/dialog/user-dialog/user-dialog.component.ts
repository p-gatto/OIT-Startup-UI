import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Group } from '../../../../auth/models/group.model';
import { User } from '../../../../auth/models/user.model';
import { CreateUser } from '../../../../auth/models/create-user.model';
import { UpdateUser } from '../../../../auth/models/update-user.model';

import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface DialogData {
  user?: User;
  securityGroups: Group[];
}

@Component({
  selector: 'app-user-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent implements OnInit {

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form: FormGroup;
  isEdit = false;
  isLoading = false;
  hidePassword = true;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEdit = !!data.user;
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      username: ['', [Validators.required, Validators.maxLength(20)]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      securityGroupIds: [[]],
      isActive: [true],
      emailConfirmed: [false]
    });
  }

  ngOnInit(): void {
    if (this.data.user) {
      this.form.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        email: this.data.user.email,
        username: this.data.user.username,
        securityGroupIds: this.data.user.groups.map(g => g.id),
        isActive: this.data.user.isActive,
        emailConfirmed: this.data.user.emailConfirmed
      });
    }
  }

  get selectedGroups(): Group[] {
    const selectedIds = this.form.get('securityGroupIds')?.value || [];
    return this.data.securityGroups.filter(group => selectedIds.includes(group.id));
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
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

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.isLoading = true;

      try {
        const formValue = this.form.value;

        if (this.isEdit && this.data.user) {
          const updateData: UpdateUser = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            username: formValue.username,
            groupIds: formValue.securityGroupIds,
            isActive: formValue.isActive,
            emailConfirmed: formValue.emailConfirmed
          };

          await this.userService.updateUser(this.data.user.id, updateData).toPromise();
          this.snackBar.open('Utente aggiornato con successo', 'Chiudi', { duration: 3000 });
        } else {
          const createData: CreateUser = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            username: formValue.username,
            password: formValue.password,
            groupIds: formValue.securityGroupIds,
            isActive: formValue.isActive,
            emailConfirmed: formValue.emailConfirmed
          };

          await this.userService.createUser(createData).toPromise();
          this.snackBar.open('Utente creato con successo', 'Chiudi', { duration: 3000 });
        }

        this.dialogRef.close(true);
      } catch (error: any) {
        console.error('Errore durante il salvataggio dell\'utente:', error);
        const message = error?.error?.message ||
          (this.isEdit ? 'Errore durante l\'aggiornamento dell\'utente' : 'Errore durante la creazione dell\'utente');
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