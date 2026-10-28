import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Seance } from './models';
import { ToastService } from './toast.service';

/** Bouton « Réserver » partagé : redirige vers la connexion si besoin, appelle l'API, affiche le résultat. */
@Injectable({ providedIn: 'root' })
export class ReservationAction {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly enCours = signal<number | null>(null);

  reserver(s: Seance, apres?: () => void): void {
    if (!this.auth.estConnecte()) {
      this.toast.info('Connectez-vous pour réserver.');
      this.router.navigate(['/connexion'], { queryParams: { retour: this.router.url } });
      return;
    }
    if (this.auth.role() !== 'SPORTIF') {
      this.toast.info('La réservation est réservée aux comptes sportifs.');
      return;
    }
    this.enCours.set(s.id);
    this.api.post<{ message: string }>('/sportif/reservations', { seanceId: s.id }).subscribe({
      next: (r) => { this.toast.succes(r.message); this.enCours.set(null); apres?.(); },
      error: (e) => { this.toast.erreur(e); this.enCours.set(null); apres?.(); },
    });
  }
}
