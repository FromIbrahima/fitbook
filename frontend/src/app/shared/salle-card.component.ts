import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Salle } from '../core/models';
import { teinte } from '../core/format';
import { IconComponent } from './icon.component';
import { StarsComponent } from './stars.component';

@Component({
  selector: 'app-salle-card',
  imports: [RouterLink, IconComponent, StarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = salle();
    <article class="carte carte-salle anim-apparition" [style.animation-delay.ms]="delai()">
      <div class="visuel" [style.background]="teinte(s.nom)">
        @if (favoriVisible()) {
          <button type="button" class="btn-coeur" [class.actif]="s.estFavori" (click)="favori.emit(s)"
            [attr.aria-label]="s.estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'"><app-icon nom="heart" [taille]="16" /></button>
        }
        <span class="vague"></span>
      </div>
      <div class="corps">
        <h3>{{ s.nom }}</h3>
        <p class="meta"><app-icon nom="pin" [taille]="14" /> {{ s.ville }}</p>
        <p class="meta"><app-stars [note]="s.noteMoyenne" /> <strong>{{ s.noteMoyenne ?? '–' }}</strong> ({{ s.nbAvis }} avis)</p>
        <a class="lien" [routerLink]="['/salles', s.id]">Voir la salle <app-icon nom="chevron" [taille]="14" /></a>
      </div>
    </article>`,
})
export class SalleCardComponent {
  readonly salle = input.required<Salle>();
  readonly delai = input(0);
  readonly favoriVisible = input(false);
  readonly favori = output<Salle>();
  protected readonly teinte = teinte;
}
