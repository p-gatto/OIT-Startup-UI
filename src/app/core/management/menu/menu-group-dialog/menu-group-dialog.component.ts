import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MenuService } from '../menu.service';

import { CreateMenuGroupDto, MenuGroupDto } from '../menu.model';

@Component({
    selector: 'app-menu-group-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatSnackBarModule
    ],
    templateUrl: `./menu-group-dialog.component.html`,
    styles: ``
})
export class MenuGroupDialogComponent implements OnInit {
    form: FormGroup;
    isEdit = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private menuService: MenuService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<MenuGroupDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: MenuGroupDto
    ) {
        this.isEdit = !!data;
        this.form = this.fb.group({
            title: ['', Validators.required],
            order: [1, Validators.required],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.form.patchValue({
                title: this.data.title,
                order: this.data.order,
                isActive: this.data.isActive
            });
        }
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.isLoading = true;
            const formValue: CreateMenuGroupDto = this.form.value;

            const operation = this.isEdit && this.data
                ? this.menuService.updateMenuGroup(this.data.id, formValue)
                : this.menuService.createMenuGroup(formValue);

            operation.subscribe({
                next: () => {
                    const message = this.isEdit ? 'Gruppo aggiornato con successo' : 'Gruppo creato con successo';
                    this.snackBar.open(message, 'Chiudi', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    const message = this.isEdit ? 'Errore nell\'aggiornamento del gruppo' : 'Errore nella creazione del gruppo';
                    this.snackBar.open(message, 'Chiudi', { duration: 3000 });
                    console.error('Error saving group:', error);
                    this.isLoading = false;
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

}