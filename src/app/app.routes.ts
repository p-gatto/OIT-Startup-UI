import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'config',
        loadComponent: () => import('./core/config/config.component')
    },
    /* {
        path: 'menu',
        loadComponent: () => import('./core/management/menu/menu.component')
    }, */
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' }
];
