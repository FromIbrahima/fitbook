import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-introuvable',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="auth-page"><div class="carte auth-carte anim-pop" style="text-align:center">
    <h1>404</h1><p class="texte-gris">Cette page n'existe pas.</p><a class="btn btn-primaire" routerLink="/">Retour à l'accueil</a></div></div>`,
})
export class IntrouvableComponent {}
