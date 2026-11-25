import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Rutas de login/registro (Nunca llevan token)
  const isAuthRoute = 
    req.url.includes('/api/auth/login') || 
    req.url.includes('/api/auth/registro');

  // 2. Rutas públicas de lectura (Solo GET, no llevan token)
  const isPublicGetRoute = 
    req.method === 'GET' && (
      req.url.includes('/api/productos') || 
      req.url.includes('/api/categorias') ||
      req.url.includes('/api/inventario')
    );

  // 3. Inyectamos el token si existe y la ruta no es pública
  if (token && !isAuthRoute && !isPublicGetRoute && req.url.includes('/api/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
