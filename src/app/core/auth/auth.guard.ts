import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { map, Observable, take } from 'rxjs';

import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      // Se non è autenticato, reindirizza al login
      if (!isAuthenticated) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      // Verifica i permessi se specificati nella route
      const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

      if (requiredPermissions && requiredPermissions.length > 0) {
        const currentUser = authService.currentUser();

        if (!currentUser) {
          router.navigate(['/unauthorized']);
          return false;
        }

        // Verifica se l'utente ha almeno uno dei permessi richiesti
        const hasPermission = requiredPermissions.some(permission =>
          currentUser.permissions.includes(permission)
        );

        if (!hasPermission) {
          router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    })
  );

};