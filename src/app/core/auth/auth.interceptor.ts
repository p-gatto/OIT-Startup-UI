import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Non aggiungere il token alle richieste di login/refresh
  const skipUrls = ['/auth/login', '/auth/refresh', '/auth/logout'];
  if (skipUrls.some(skipUrl => req.url.includes(skipUrl))) {
    return next(req);
  }

  // Ottieni il token direttamente dal localStorage invece di usare AuthService
  // per evitare la dipendenza circolare
  const token = localStorage.getItem('accessToken');

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);

};