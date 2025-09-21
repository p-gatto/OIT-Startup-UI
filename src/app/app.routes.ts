import { Routes } from '@angular/router';

import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    /* {
       path: 'config',
       loadComponent: () => import('./core/config/config.component')
   },
  {
       path: 'menu',
       loadComponent: () => import('./core/management/menu/menu.component')
   }, */


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
    {
        path: 'dashboard',
        loadComponent: () => import('./features/home/home.component'),
        canActivate: [AuthGuard]
    },

    // Admin routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        data: { permissions: ['User:Read'] },
        children: [
            {
                path: 'users',
                loadComponent: () => import('./core/management/users/users.component'),
                data: { permissions: ['User:Read'] }
            },
            {
                path: 'groups',
                loadComponent: () => import('./features/admin/security-groups/security-groups.component'),
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
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/not-found' }
];
