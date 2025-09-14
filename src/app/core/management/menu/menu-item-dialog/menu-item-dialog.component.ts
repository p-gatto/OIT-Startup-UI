import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CreateMenuItemDto, MenuGroupDto, MenuItemDto, UpdateMenuItemDto } from '../menu.model';
import { MenuService } from '../menu.service';

interface DialogData {
    group: MenuGroupDto;
    item?: MenuItemDto;
}

@Component({
    selector: 'app-menu-item-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatSelectModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: `./menu-item-dialog.component.html`,
    styles: ``
})
export class MenuItemDialogComponent implements OnInit {

    form: FormGroup;
    isEdit = false;
    isLoading = false;
    availableParents: MenuItemDto[] = [];

    commonIcons = [
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'people', label: 'Persone' },
        { value: 'inventory', label: 'Inventario' },
        { value: 'list', label: 'Lista' },
        { value: 'add', label: 'Aggiungi' },
        { value: 'edit', label: 'Modifica' },
        { value: 'settings', label: 'Impostazioni' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'bar_chart', label: 'Grafici' },
        { value: 'assessment', label: 'Report' },
        { value: 'help', label: 'Aiuto' },
        { value: 'home', label: 'Home' },
        { value: 'account_circle', label: 'Account' },
        { value: 'shopping_cart', label: 'Carrello' },
        { value: 'favorite', label: 'Preferiti' },
        { value: 'star', label: 'Stella' },
        { value: 'info', label: 'Info' },
        { value: 'search', label: 'Cerca' },
        { value: 'folder', label: 'Cartella' },
        { value: 'file_copy', label: 'File' }
    ];

    constructor(
        private fb: FormBuilder,
        private menuService: MenuService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<MenuItemDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.isEdit = !!data.item;
        this.form = this.fb.group({
            title: ['', Validators.required],
            icon: [''],
            route: [''],
            queryParamsJson: ['{}', this.jsonValidator],
            order: [1, Validators.required],
            isActive: [true],
            parentId: ['']
        });
    }

    ngOnInit(): void {
        // Get available parents (items without parentId in the same group)
        this.availableParents = this.data.group.items.filter((item: any) =>
            !item.parentId && (!this.data.item || item.id !== this.data.item.id)
        );

        if (this.data.item) {
            const queryParamsJson = this.data.item.queryParams
                ? JSON.stringify(this.data.item.queryParams, null, 2)
                : '{}';

            this.form.patchValue({
                title: this.data.item.title,
                icon: this.data.item.icon || '',
                route: this.data.item.route || '',
                queryParamsJson,
                order: this.data.item.order,
                isActive: this.data.item.isActive,
                parentId: this.data.item.parentId || ''
            });
        }
    }

    jsonValidator(control: any) {
        if (!control.value) return null;

        try {
            JSON.parse(control.value);
            return null;
        } catch {
            return { invalidJson: true };
        }
    }

    onSubmit(): void {

        if (this.form.valid) {
            this.isLoading = true;

            let queryParams = {};
            try {
                queryParams = JSON.parse(this.form.value.queryParamsJson || '{}');
            } catch {
                queryParams = {};
            }

            if (this.isEdit && this.data.item) {
                const updateDto: UpdateMenuItemDto = {
                    title: this.form.value.title,
                    icon: this.form.value.icon || undefined,
                    route: this.form.value.route || undefined,
                    queryParams,
                    order: this.form.value.order,
                    isActive: this.form.value.isActive,
                    parentId: this.form.value.parentId || undefined
                };

                this.menuService.updateMenuItem(this.data.item.id, updateDto).subscribe({
                    next: () => {
                        this.snackBar.open('Elemento aggiornato con successo', 'Chiudi', { duration: 3000 });
                        this.dialogRef.close(true);
                    },
                    error: (error) => {
                        this.snackBar.open('Errore nell\'aggiornamento dell\'elemento', 'Chiudi', { duration: 3000 });
                        console.error('Error updating item:', error);
                        this.isLoading = false;
                    }
                });
            } else {
                const createDto: CreateMenuItemDto = {
                    title: this.form.value.title,
                    icon: this.form.value.icon || undefined,
                    route: this.form.value.route || undefined,
                    queryParams,
                    order: this.form.value.order,
                    isActive: this.form.value.isActive,
                    parentId: this.form.value.parentId || undefined,
                    menuGroupId: this.data.group.id
                };

                this.menuService.createMenuItem(createDto).subscribe({
                    next: () => {
                        this.snackBar.open('Elemento creato con successo', 'Chiudi', { duration: 3000 });
                        this.dialogRef.close(true);
                    },
                    error: (error) => {
                        this.snackBar.open('Errore nella creazione dell\'elemento', 'Chiudi', { duration: 3000 });
                        console.error('Error creating item:', error);
                        this.isLoading = false;
                    }
                });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

}