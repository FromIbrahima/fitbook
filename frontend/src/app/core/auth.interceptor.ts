import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Ajoute « Authorization: Bearer <jeton> » (et la copie « X-Auth-Token », car Apache/WAMP supprime parfois Authorization) ;
 * si l'API refuse le jeton (401), la session est fermée.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // pas de jeton pour la connexion / l'inscription : un ancien jeton ne doit jamais bloquer une nouvelle connexion
  const token = req.url.includes('/auth/') ? null : auth.token;
  const requete = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, 'X-Auth-Token': token, Accept: 'application/json' } }) : req.clone({ setHeaders: { Accept: 'application/json' } });

  return next(requete).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && token) {
        // jeton refusé (expiré, ou compte supprimé quand la base a été rechargée) :
        // on ferme la session une seule fois et on va à la connexion, sans afficher une erreur par requête
        if (auth.token) {
          auth.deconnexion(false);
          router.navigate(['/connexion'], { queryParams: { expire: 1 } });
        }
        return EMPTY;
      }
      return throwError(() => e);
    }),
  );
};
