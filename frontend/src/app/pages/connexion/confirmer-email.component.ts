import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

/** Page ouverte depuis le lien reçu par email : /confirmer-email?token=... */
@Component({
  selector: 'app-confirmer-email',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="carte auth-carte anim-pop" style="text-align:center">
        @switch (etat()) {
          @case ('attente') { <p>Confirmation en cours…</p> }
          @case ('ok') {
            <span class="stat-icone" style="margin:0 auto 12px;background:var(--succes-doux);color:var(--succes)"><app-icon nom="check" /></span>
            <h2>Email confirmé !</h2><p class="texte-gris">{{ message() }}</p>
            <a class="btn btn-primaire" routerLink="/connexion">Se connecter</a>
          }
          @case ('erreur') { <h2>Lien invalide</h2><p class="alerte alerte-erreur">{{ message() }}</p><a class="lien" routerLink="/">Retour à l'accueil</a> }
        }
      </div>
    </div>`,
})
export class ConfirmerEmailComponent {
  protected readonly etat = signal<'attente' | 'ok' | 'erreur'>('attente');
  protected readonly message = signal('');

  constructor() {
    const token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
    inject(AuthService).confirmerEmail(token).subscribe({
      next: (r) => { this.message.set(r.message); this.etat.set('ok'); },
      error: (e) => { this.message.set(ToastService.message(e)); this.etat.set('erreur'); },
    });
  }
}
