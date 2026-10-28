import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';
import { ToastsComponent } from './shared/toasts.component';
import { activerTableauxResponsives } from './core/tableaux-responsives';

const ESPACES = ['/espace-sportif', '/espace-coach', '/espace-salle', '/administration'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!estEspace()) { <app-header /> }
    <router-outlet />
    @if (!estEspace()) { <app-footer /> }
    <app-toasts />`,
})
export class App {
  private readonly router = inject(Router);
  /** Les espaces ont leur propre menu latéral : pas d'en-tête ni de pied de page */
  protected readonly estEspace = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map((e) => ESPACES.some((p) => (e as NavigationEnd).urlAfterRedirects.startsWith(p)))),
    { initialValue: false },
  );

  constructor() {
    activerTableauxResponsives();
  }
}
