import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IconComponent } from '../shared/icon.component';

export interface ElementMenu { id: string; libelle: string; icone: string; }

/** Mise en page des espaces (sportif, coach, salle, admin) : menu latéral + contenu. */
@Component({
  selector: 'app-espace-layout',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="espace">
      <aside class="espace-menu">
        <a routerLink="/" class="logo"><span class="logo-icone"><app-icon nom="bolt" [taille]="18" /></span> FitBook</a>
        <span class="espace-libelle">{{ libelle() }}</span>
        <nav>
          @for (m of menu(); track m.id) {
            <button type="button" [class.actif]="actif() === m.id" (click)="actif.set(m.id)"><app-icon [nom]="m.icone" /> {{ m.libelle }}</button>
          }
          <a routerLink="/recherche" class="lien-menu"><app-icon nom="search" /> Rechercher</a>
        </nav>
        @if (auth.utilisateur(); as u) {
          <div class="espace-user">
            <span class="avatar">{{ auth.initiales() }}</span>
            <span><strong>{{ u.prenom }} {{ u.nom }}</strong><small>{{ u.email }}</small></span>
            <button type="button" class="btn-icone" (click)="auth.deconnexion()" aria-label="Déconnexion" title="Déconnexion"><app-icon nom="logout" /></button>
          </div>
        }
      </aside>
      <main class="espace-contenu">
        <ng-content />
      </main>
    </div>`,
})
export class EspaceLayoutComponent {
  readonly libelle = input.required<string>();
  readonly menu = input.required<ElementMenu[]>();
  readonly actif = model.required<string>();
  protected readonly auth = inject(AuthService);
}
