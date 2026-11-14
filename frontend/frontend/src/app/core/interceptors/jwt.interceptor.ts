import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Solo consideramos "pública" la ruta si es un GET (ver catálogo)
  // o si es el login/registro.
  const isPublicGetRoute = 
    (req.method === 'GET' && (req.url.includes('/api/productos') || req.url.includes('/api/categorias'))) ||
    req.url.includes('/api/auth/login') || 
    req.url.includes('/api/auth/registro');

  if (token && !isPublicGetRoute && req.url.includes('/api/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
