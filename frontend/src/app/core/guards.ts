import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

/** Protège une route : il faut être connecté ET avoir l'un des rôles demandés. */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.estConnecte()) {
      return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
    }
    return roles.includes(auth.role()!) ? true : router.createUrlTree([auth.espace()]);
  };
}
