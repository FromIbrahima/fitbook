import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="pied-page">
      <div class="conteneur pied-grille">
        <div>
          <a routerLink="/" class="logo logo-clair"><span class="logo-icone"><app-icon nom="bolt" [taille]="18" /></span> FitBook</a>
          <p>Réservez votre sport, simplement.</p>
          <small>© {{ annee }} FitBook — Projet de fin de formation</small>
        </div>
        <div><h4>Plateforme</h4><a routerLink="/recherche">Rechercher</a><a routerLink="/recherche" [queryParams]="{ onglet: 'salles' }">Salles</a><a routerLink="/recherche" [queryParams]="{ onglet: 'coachs' }">Coachs</a><a routerLink="/recherche">Séances</a></div>
        <div><h4>Professionnels</h4><a routerLink="/connexion" [queryParams]="{ mode: 'inscription', role: 'COACH' }">Devenir coach</a><a routerLink="/connexion" [queryParams]="{ mode: 'inscription', role: 'GESTIONNAIRE' }">Inscrire ma salle</a></div>
        <div><h4>Aide</h4><a routerLink="/">FAQ</a><a routerLink="/">Contact</a><a routerLink="/">Conditions</a><a routerLink="/">Confidentialité</a></div>
      </div>
    </footer>`,
})
export class FooterComponent {
  protected readonly annee = new Date().getFullYear();
}
