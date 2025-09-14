import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuGroupDto, MenuItemDto } from './menu.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { MenuService } from './menu.service';
import { MenuGroupDialogComponent } from './menu-group-dialog/menu-group-dialog.component';
import { MenuItemDialogComponent } from './menu-item-dialog/menu-item-dialog.component';

@Component({
  selector: 'app-menu',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    DragDropModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export default class MenuComponent implements OnInit {

  menuGroups: MenuGroupDto[] = [];

  constructor(
    private menuService: MenuService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadMenuStructure();
  }

  loadMenuStructure(): void {
    this.menuService.getMenuStructure().subscribe({
      next: (groups) => {
        this.menuGroups = groups;
      },
      error: (error) => {
        this.snackBar.open('Errore nel caricamento menu', 'Chiudi', { duration: 3000 });
        console.error('Error loading menu structure:', error);
      }
    });
  }

  openGroupDialog(group?: MenuGroupDto): void {
    const dialogRef = this.dialog.open(MenuGroupDialogComponent, {
      width: '500px',
      data: group
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenuStructure();
      }
    });
  }

  openItemDialog(group: MenuGroupDto, item?: MenuItemDto): void {
    const dialogRef = this.dialog.open(MenuItemDialogComponent, {
      width: '600px',
      data: { group, item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenuStructure();
      }
    });
  }

  deleteGroup(group: MenuGroupDto): void {
    if (confirm(`Sei sicuro di voler eliminare il gruppo "${group.title}"?`)) {
      this.menuService.deleteMenuGroup(group.id).subscribe({
        next: () => {
          this.snackBar.open('Gruppo eliminato con successo', 'Chiudi', { duration: 3000 });
          this.loadMenuStructure();
        },
        error: (error) => {
          this.snackBar.open('Errore nell\'eliminazione del gruppo', 'Chiudi', { duration: 3000 });
          console.error('Error deleting group:', error);
        }
      });
    }
  }

  deleteItem(item: MenuItemDto): void {
    if (confirm(`Sei sicuro di voler eliminare l'elemento "${item.title}"?`)) {
      this.menuService.deleteMenuItem(item.id).subscribe({
        next: () => {
          this.snackBar.open('Elemento eliminato con successo', 'Chiudi', { duration: 3000 });
          this.loadMenuStructure();
        },
        error: (error) => {
          this.snackBar.open('Errore nell\'eliminazione dell\'elemento', 'Chiudi', { duration: 3000 });
          console.error('Error deleting item:', error);
        }
      });
    }
  }

  dropGroup(event: CdkDragDrop<MenuGroupDto[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.menuGroups, event.previousIndex, event.currentIndex);

      const orderMap: { [key: number]: number } = {};
      this.menuGroups.forEach((group, index) => {
        orderMap[group.id] = index + 1;
      });

      this.menuService.reorderMenuGroups(orderMap).subscribe({
        error: (error) => {
          this.snackBar.open('Errore nel riordinamento', 'Chiudi', { duration: 3000 });
          console.error('Error reordering groups:', error);
          this.loadMenuStructure(); // Reload on error
        }
      });
    }
  }

  dropItem(event: CdkDragDrop<MenuItemDto[]>, group: MenuGroupDto): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(group.items, event.previousIndex, event.currentIndex);

      const orderMap: { [key: number]: number } = {};
      group.items.forEach((item, index) => {
        orderMap[item.id] = index + 1;
      });

      this.menuService.reorderMenuItems(orderMap).subscribe({
        error: (error) => {
          this.snackBar.open('Errore nel riordinamento', 'Chiudi', { duration: 3000 });
          console.error('Error reordering items:', error);
          this.loadMenuStructure(); // Reload on error
        }
      });
    }
  }

  trackByGroupId(index: number, group: MenuGroupDto): number {
    return group.id;
  }

  trackByItemId(index: number, item: MenuItemDto): number {
    return item.id;
  }

  toggleGroupExpansion(group: any): void {
    group.expanded = !group.expanded;
  }

  toggleItemExpansion(item: any): void {
    item.expanded = !item.expanded;
  }

  addChildItem(group: any, parentItem: any): void {
    // this.openItemDialog(group, null, parentItem);
  }

}