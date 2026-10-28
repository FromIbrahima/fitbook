import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Role, Utilisateur } from './models';

const CLE = 'fitbook.session';

interface Session { token: string; utilisateur: Utilisateur; expireLe: number; }

/** Session de l'utilisateur (jeton signé par l'API), gardée dans le localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(this.lire());

  readonly utilisateur = computed(() => this.session()?.utilisateur ?? null);
  readonly estConnecte = computed(() => this.session() !== null);
  readonly role = computed<Role | null>(() => this.utilisateur()?.role ?? null);
  readonly initiales = computed(() => {
    const u = this.utilisateur();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : '';
  });

  get token(): string | null { return this.session()?.token ?? null; }

  connexion(email: string, motDePasse: string): Observable<{ token: string; expireDans: number; utilisateur: Utilisateur }> {
    return this.api.post<{ token: string; expireDans: number; utilisateur: Utilisateur }>('/auth/connexion', { email, motDePasse }).pipe(
      tap((r) => this.enregistrer({ token: r.token, utilisateur: r.utilisateur, expireLe: Date.now() + r.expireDans * 1000 })),
    );
  }

  inscription(data: Record<string, unknown>): Observable<{ message: string }> {
    return this.api.post('/auth/inscription', data);
  }

  confirmerEmail(token: string): Observable<{ message: string }> {
    return this.api.post('/auth/confirmer', { token });
  }

  mettreAJourUtilisateur(u: Utilisateur, token?: string): void {
    const s = this.session();
    if (s) this.enregistrer({ ...s, utilisateur: u, token: token ?? s.token });
  }

  deconnexion(redirection = true): void {
    this.session.set(null);
    try { localStorage.removeItem(CLE); } catch { /* stockage indisponible */ }
    if (redirection) this.router.navigateByUrl('/');
  }

  /** Page d'accueil de l'espace correspondant au rôle */
  espace(role: Role | null = this.role()): string {
    return { SPORTIF: '/espace-sportif', COACH: '/espace-coach', GESTIONNAIRE: '/espace-salle', ADMIN: '/administration' }[role ?? 'SPORTIF'];
  }

  private enregistrer(s: Session): void {
    this.session.set(s);
    try { localStorage.setItem(CLE, JSON.stringify(s)); } catch { /* navigation privée */ }
  }

  private lire(): Session | null {
    try {
      const s = JSON.parse(localStorage.getItem(CLE) ?? 'null') as Session | null;
      return s && s.expireLe > Date.now() ? s : null;
    } catch {
      return null;
    }
  }
}
