import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LIBELLES_ROLE } from '../core/models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="entete">
      <div class="conteneur entete-inner">
        <a routerLink="/" class="logo" aria-label="FitBook, accueil"><span class="logo-icone"><app-icon nom="bolt" [taille]="18" /></span> FitBook</a>
        <button type="button" class="btn-menu" (click)="ouvert.set(!ouvert())" [attr.aria-expanded]="ouvert()" aria-label="Menu"><app-icon nom="menu" /></button>
        <nav class="nav" [class.ouvert]="ouvert()" (click)="ouvert.set(false)">
          <a routerLink="/recherche" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: false }" [queryParams]="{}">Rechercher</a>
          <a routerLink="/recherche" [queryParams]="{ onglet: 'salles' }">Salles</a>
          <a routerLink="/recherche" [queryParams]="{ onglet: 'coachs' }">Coachs</a>
          <a routerLink="/recherche" [queryParams]="{ onglet: 'seances' }">Séances</a>
          <span class="nav-droite">
            @if (auth.utilisateur(); as u) {
              @if (u.role === 'SPORTIF') {
                <a routerLink="/espace-sportif" [queryParams]="{ onglet: 'favoris' }" class="nav-icone"><app-icon nom="heart" [taille]="16" /> Favoris</a>
              }
              <a [routerLink]="auth.espace()" class="profil">
                <span class="avatar">{{ auth.initiales() }}</span>
                <span><strong>{{ u.prenom }} {{ u.nom }}</strong><small>{{ libelles[u.role] }}</small></span>
              </a>
              <button type="button" class="btn btn-contour btn-petit" (click)="auth.deconnexion()">Déconnexion</button>
            } @else {
              <a routerLink="/connexion" class="lien-fort">Connexion</a>
              <a routerLink="/connexion" [queryParams]="{ mode: 'inscription' }" class="btn btn-primaire">S'inscrire</a>
            }
          </span>
        </nav>
      </div>
    </header>`,
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly ouvert = signal(false);
  protected readonly libelles = LIBELLES_ROLE;
}
