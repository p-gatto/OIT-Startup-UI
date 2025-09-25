import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Non aggiungere il token alle richieste di login/refresh
  const skipUrls = ['/auth/login', '/auth/refresh', '/auth/logout'];
  if (skipUrls.some(skipUrl => req.url.includes(skipUrl))) {
    return next(req);
  }

  // Aggiungi il token all'header Authorization
  const token = authService.getAccessToken();
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
