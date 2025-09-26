// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    // Public routes
    {
        path: 'login',
        loadComponent: () => import('./core/auth/login/login.component')
    },

    // Protected routes
    {
        path: 'config',
        loadComponent: () => import('./core/config/config.component'),
        canActivate: [AuthGuard]
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component'),
        canActivate: [AuthGuard]
    },

    // Admin routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        children: [
            {
                path: 'users',
                loadComponent: () => import('./core/management/users/users.component'),
                data: { permissions: ['User:Read'] }
            },
            {
                path: 'users/create',
                loadComponent: () => import('./core/management/users/users.component'),
                data: { permissions: ['User:Create'] }
            },
            {
                path: 'users/:id',
                loadComponent: () => import('./core/management/users/users.component'),
                data: { permissions: ['User:Update'] }
            },
            {
                path: 'groups',
                loadComponent: () => import('./core/management/groups/groups.component'),
                data: { permissions: ['SecurityGroup:Manage'] }
            },
            {
                path: 'menu',
                loadComponent: () => import('./core/management/menu/menu.component'),
                data: { permissions: ['Menu:Manage'] }
            }
        ]
    },

    // Error routes
    {
        path: 'unauthorized',
        loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
    },
    {
        path: 'not-found',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
    },

    // Default redirects
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/not-found' }
];