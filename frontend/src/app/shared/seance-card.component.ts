import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seance } from '../core/models';
import { dateHeure, prix, teinte } from '../core/format';
import { IconComponent } from './icon.component';

/** Carte « séance » (accueil, recherche) — survol animé (translateY + scale). */
@Component({
  selector: 'app-seance-card',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = seance();
    <article class="carte carte-seance anim-apparition" [style.animation-delay.ms]="delai()">
      <div class="visuel" [style.background]="teinte(s.activite.nom)">
        <span class="chip chip-plein">{{ s.activite.nom }}</span>
        <span class="vague"></span>
      </div>
      <div class="corps">
        <h3>{{ s.titre }}</h3>
        <p class="meta"><app-icon nom="pin" [taille]="14" /> <a [routerLink]="['/salles', s.salle.id]">{{ s.salle.nom }}</a> · {{ s.salle.ville }}</p>
        <p class="meta"><app-icon nom="cal" [taille]="14" /> {{ dateHeure(s.dateDebut) }}</p>
        <p class="meta"><app-icon nom="user" [taille]="14" /> <a [routerLink]="['/coachs', s.coach.id]">{{ s.coach.nom }}</a></p>
        @if (s.placesRestantes > 0) {
          <span class="badge badge-succes">{{ s.placesRestantes }} place{{ s.placesRestantes > 1 ? 's' : '' }} restante{{ s.placesRestantes > 1 ? 's' : '' }}</span>
        } @else {
          <span class="badge badge-danger pulse">Complet</span>
        }
        <div class="pied">
          <strong class="prix">{{ prix(s.prix) }}</strong>
          <button class="btn btn-primaire btn-petit" type="button" [disabled]="s.placesRestantes === 0 || enCours()" (click)="reserver.emit(s)">
            {{ s.placesRestantes === 0 ? 'Complet' : enCours() ? '…' : 'Réserver' }}
          </button>
        </div>
      </div>
    </article>`,
})
export class SeanceCardComponent {
  readonly seance = input.required<Seance>();
  readonly delai = input(0);
  readonly enCours = input(false);
  readonly reserver = output<Seance>();
  protected readonly dateHeure = dateHeure;
  protected readonly prix = prix;
  protected readonly teinte = teinte;
}
