import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface Toast { id: number; texte: string; type: 'succes' | 'erreur' | 'info'; }

/** Petites notifications animées en bas de l'écran. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private compteur = 0;

  succes(texte: string): void { this.ajouter(texte, 'succes'); }
  info(texte: string): void { this.ajouter(texte, 'info'); }
  erreur(e: unknown): void { this.ajouter(ToastService.message(e), 'erreur'); }

  fermer(id: number): void { this.toasts.update((l) => l.filter((t) => t.id !== id)); }

  static message(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      // 0 = aucune réponse ; 502/504 sans message = le proxy d'Angular n'a pas pu joindre Symfony
      if (e.status === 0 || ((e.status === 502 || e.status === 504) && !e.error?.message)) {
        return 'API injoignable : lancez le backend (dossier backend) avec « php -S 127.0.0.1:8000 -t public ».';
      }
      return e.error?.message ?? `Erreur ${e.status}`;
    }
    return String(e);
  }

  /** Erreurs par champ renvoyées par la validation backend (422) */
  static erreursChamps(e: unknown): Record<string, string> {
    return e instanceof HttpErrorResponse && e.error?.erreurs && !Array.isArray(e.error.erreurs) ? e.error.erreurs : {};
  }

  private ajouter(texte: string, type: Toast['type']): void {
    const id = ++this.compteur;
    this.toasts.update((l) => [...l, { id, texte, type }]);
    setTimeout(() => this.fermer(id), 4500);
  }
}
