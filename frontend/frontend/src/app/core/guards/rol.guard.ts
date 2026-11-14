import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const rolGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permitidos: string[] = route.data['roles'] ?? [];
  const rol = auth.getRol() ?? '';

  return permitidos.includes(rol) || router.parseUrl(auth.rutaInicio());
};
