import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Affichage (ou saisie si editable) d'une note sur 5 étoiles. */
@Component({
  selector: 'app-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="etoiles" [class.editable]="editable()" role="img" [attr.aria-label]="'Note : ' + (note() ?? 0) + ' sur 5'">
      @for (i of [1, 2, 3, 4, 5]; track i) {
        <button type="button" class="etoile" [class.pleine]="i <= arrondi()" [disabled]="!editable()" (click)="note.set(i)"
          [attr.aria-label]="i + ' étoile(s)'">★</button>
      }
    </span>`,
  styles: `
    .etoiles { display: inline-flex; gap: 2px; }
    .etoile { background: none; border: 0; padding: 0; font-size: var(--taille, 14px); color: #E2E8F0; cursor: default; line-height: 1; }
    .etoile.pleine { color: #F59E0B; }
    .editable .etoile { cursor: pointer; font-size: 24px; transition: transform .15s; }
    .editable .etoile:hover { transform: scale(1.25); }
  `,
})
export class StarsComponent {
  readonly note = model<number | null>(0);
  readonly editable = input(false);
  protected arrondi(): number { return Math.round(this.note() ?? 0); }
}
