import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas según el rol del usuario.
 * Uso: canActivate: [roleGuard(['ADMIN'])] o roleGuard(['ADMIN', 'MANAGER'])
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Si no tiene permiso, redirigir al dashboard
    router.navigate(['/dashboard']);
    return false;
  };
}

/**
 * Guard específico para Admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  return roleGuard(['ADMIN'])(route, state);
};

/**
 * Guard específico para Employee
 */
export const employeeGuard: CanActivateFn = (route, state) => {
  return roleGuard(['EMPLOYEE'])(route, state);
};
