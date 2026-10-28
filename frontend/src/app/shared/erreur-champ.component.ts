import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Message d'erreur sous un champ : validation Angular (frontend) OU erreur renvoyée par l'API (backend). */
@Component({
  selector: 'app-erreur-champ',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `@if (message()) { <small class="erreur-champ anim-secousse">{{ message() }}</small> }`,
})
export class ErreurChampComponent {
  readonly controle = input<AbstractControl | null>(null);
  readonly serveur = input<string | undefined>(undefined);

  message(): string | null {
    const c = this.controle();
    if (c && c.invalid && (c.touched || c.dirty)) {
      const e = c.errors ?? {};
      if (e['required']) return 'Ce champ est obligatoire.';
      if (e['email']) return 'Adresse email invalide.';
      if (e['minlength']) return `Au moins ${e['minlength'].requiredLength} caractères.`;
      if (e['maxlength']) return `Au plus ${e['maxlength'].requiredLength} caractères.`;
      if (e['min']) return `Valeur minimale : ${e['min'].min}.`;
      if (e['max']) return `Valeur maximale : ${e['max'].max}.`;
      if (e['pattern']) return 'Format invalide.';
      if (e['motDePasse']) return '8 caractères minimum, avec majuscule, minuscule et chiffre.';
      if (e['ordreDates']) return 'La fin doit être après le début.';
    }
    return this.serveur() ?? null;
  }
}
