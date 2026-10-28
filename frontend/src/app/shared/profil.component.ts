import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { LIBELLES_ROLE, Utilisateur } from '../core/models';
import { ToastService } from '../core/toast.service';
import { motDePasseFort } from '../pages/connexion/connexion.component';
import { ErreurChampComponent } from './erreur-champ.component';

/** Modification du profil et du mot de passe (tous les rôles). */
@Component({
  selector: 'app-profil',
  imports: [ReactiveFormsModule, ErreurChampComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="deux-colonnes">
      <form class="panneau anim-apparition" [formGroup]="profil" (ngSubmit)="enregistrer()">
        <h3>Informations personnelles</h3>
        <p class="texte-gris">{{ auth.utilisateur()?.email }} · {{ libelles[auth.role() ?? 'SPORTIF'] }}</p>
        <div class="grille-form deux">
          <div class="champ"><label>Prénom</label><input class="input" formControlName="prenom" /><app-erreur-champ [controle]="profil.controls.prenom" [serveur]="erreurs()['prenom']" /></div>
          <div class="champ"><label>Nom</label><input class="input" formControlName="nom" /><app-erreur-champ [controle]="profil.controls.nom" [serveur]="erreurs()['nom']" /></div>
        </div>
        <div class="champ"><label>Téléphone</label><input class="input" formControlName="telephone" /><app-erreur-champ [controle]="profil.controls.telephone" [serveur]="erreurs()['telephone']" /></div>
        <button class="btn btn-primaire" type="submit">Enregistrer</button>
      </form>
      <form class="panneau anim-apparition" [formGroup]="mdp" (ngSubmit)="changerMotDePasse()">
        <h3>Mot de passe</h3>
        <div class="champ"><label>Mot de passe actuel</label><input class="input" type="password" formControlName="actuel" autocomplete="current-password" />
          <app-erreur-champ [controle]="mdp.controls.actuel" [serveur]="erreursMdp()['actuel']" /></div>
        <div class="champ"><label>Nouveau mot de passe</label><input class="input" type="password" formControlName="nouveau" autocomplete="new-password" />
          <app-erreur-champ [controle]="mdp.controls.nouveau" [serveur]="erreursMdp()['nouveau']" /></div>
        <button class="btn btn-encre" type="submit">Modifier le mot de passe</button>
      </form>
    </div>`,
})
export class ProfilComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly libelles = LIBELLES_ROLE;
  protected readonly erreurs = signal<Record<string, string>>({});
  protected readonly erreursMdp = signal<Record<string, string>>({});
  private readonly u = this.auth.utilisateur();
  protected readonly profil = new FormGroup({
    prenom: new FormControl(this.u?.prenom ?? '', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    nom: new FormControl(this.u?.nom ?? '', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    telephone: new FormControl(this.u?.telephone ?? '', { nonNullable: true, validators: [Validators.pattern(/^[0-9 +().-]{6,20}$/)] }),
  });
  protected readonly mdp = new FormGroup({
    actuel: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nouveau: new FormControl('', { nonNullable: true, validators: [Validators.required, motDePasseFort] }),
  });

  protected enregistrer(): void {
    this.profil.markAllAsTouched();
    if (this.profil.invalid) return;
    this.api.put<Utilisateur>('/me', this.profil.getRawValue()).subscribe({
      next: (u) => { this.auth.mettreAJourUtilisateur(u); this.erreurs.set({}); this.toast.succes('Profil enregistré.'); },
      error: (e) => { this.erreurs.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }

  protected changerMotDePasse(): void {
    this.mdp.markAllAsTouched();
    if (this.mdp.invalid) return;
    this.api.put<{ message: string; token: string }>('/me/mot-de-passe', this.mdp.getRawValue()).subscribe({
      next: (r) => { this.auth.mettreAJourUtilisateur(this.auth.utilisateur()!, r.token); this.mdp.reset(); this.erreursMdp.set({}); this.toast.succes(r.message); },
      error: (e) => { this.erreursMdp.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }
}
