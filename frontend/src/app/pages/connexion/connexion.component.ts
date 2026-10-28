import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Accueil, Role } from '../../core/models';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { ErreurChampComponent } from '../../shared/erreur-champ.component';
import { IconComponent } from '../../shared/icon.component';

/** Même règle que le backend : 8 caractères, une majuscule, une minuscule, un chiffre */
export function motDePasseFort(c: AbstractControl): ValidationErrors | null {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(c.value ?? '') ? null : { motDePasse: true };
}

@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, ErreurChampComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="auth-split">
      <!-- À gauche : le formulaire -->
      <main class="auth-zone">
        <div class="auth-carte anim-pop">
          <div class="segment" [class.droite]="mode() === 'inscription'" role="tablist">
            <span class="segment-curseur"></span>
            <button type="button" role="tab" [class.actif]="mode() === 'connexion'" (click)="changer('connexion')">Connexion</button>
            <button type="button" role="tab" [class.actif]="mode() === 'inscription'" (click)="changer('inscription')">Inscription</button>
          </div>

          @if (mode() === 'connexion') {
            <h2>Bon retour</h2>
            <p class="sous-titre">Connectez-vous pour gérer vos réservations.</p>
          } @else {
            <h2>Créer un compte</h2>
            <p class="sous-titre">Gratuit, en moins d'une minute.</p>
          }
          @if (expire()) { <p class="alerte alerte-info">Votre session n'est plus valable (expirée, ou base de données rechargée) : reconnectez-vous.</p> }
          @if (message()) { <p class="alerte alerte-succes">{{ message() }}</p> }
          @if (erreur()) { <p class="alerte alerte-erreur anim-secousse">{{ erreur() }}</p> }

          @if (mode() === 'connexion') {
            <form [formGroup]="connexion" (ngSubmit)="seConnecter()" novalidate>
              <div class="champ"><label for="email">Email</label>
                <div class="champ-icone"><app-icon nom="user" [taille]="18" />
                  <input id="email" class="input" type="email" formControlName="email" autocomplete="email" placeholder="vous@exemple.be" /></div>
                <app-erreur-champ [controle]="connexion.controls.email" /></div>
              <div class="champ"><label for="mdp">Mot de passe</label>
                <div class="champ-icone"><app-icon nom="shield" [taille]="18" />
                  <input id="mdp" class="input" [type]="voirMdp() ? 'text' : 'password'" formControlName="motDePasse" autocomplete="current-password" placeholder="••••••••" />
                  <button type="button" class="voir-mdp" (click)="voirMdp.set(!voirMdp())" [attr.aria-label]="voirMdp() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">{{ voirMdp() ? 'Masquer' : 'Afficher' }}</button></div>
                <app-erreur-champ [controle]="connexion.controls.motDePasse" /></div>
              <button class="btn btn-primaire btn-bloc btn-envoi" type="submit" [disabled]="envoi()">
                @if (envoi()) { <span class="roue"></span> Connexion… } @else { Se connecter <app-icon nom="chevron" [taille]="16" /> }
              </button>
            </form>
          } @else {
            <form [formGroup]="inscription" (ngSubmit)="sInscrire()" novalidate>
              <div class="champ"><label>Je suis</label>
                <div class="roles">
                  @for (r of roles; track r.id) {
                    <button type="button" class="role" [class.actif]="inscription.controls.role.value === r.id" (click)="inscription.controls.role.setValue(r.id)">
                      <span><app-icon [nom]="r.icone" [taille]="18" /></span>{{ r.libelle }}</button>
                  }
                </div></div>
              <div class="grille-form deux">
                <div class="champ"><label for="prenom">Prénom</label><input id="prenom" class="input" formControlName="prenom" />
                  <app-erreur-champ [controle]="inscription.controls.prenom" [serveur]="erreursServeur()['prenom']" /></div>
                <div class="champ"><label for="nom">Nom</label><input id="nom" class="input" formControlName="nom" />
                  <app-erreur-champ [controle]="inscription.controls.nom" [serveur]="erreursServeur()['nom']" /></div>
              </div>
              <div class="champ"><label for="iemail">Email</label>
                <div class="champ-icone"><app-icon nom="user" [taille]="18" /><input id="iemail" class="input" type="email" formControlName="email" autocomplete="email" placeholder="vous@exemple.be" /></div>
                <app-erreur-champ [controle]="inscription.controls.email" [serveur]="erreursServeur()['email']" /></div>
              <div class="champ"><label for="tel">Téléphone <span class="texte-gris">(facultatif)</span></label><input id="tel" class="input" formControlName="telephone" placeholder="+32 4xx xx xx xx" />
                <app-erreur-champ [controle]="inscription.controls.telephone" [serveur]="erreursServeur()['telephone']" /></div>
              @if (inscription.controls.role.value === 'COACH') {
                <div class="grille-form deux">
                  <div class="champ"><label for="spec">Spécialité</label><input id="spec" class="input" formControlName="specialite" placeholder="Yoga, boxe…" /></div>
                  <div class="champ"><label for="ville">Ville</label><input id="ville" class="input" formControlName="ville" /></div>
                </div>
              }
              <div class="champ"><label for="imdp">Mot de passe</label>
                <div class="champ-icone"><app-icon nom="shield" [taille]="18" />
                  <input id="imdp" class="input" [type]="voirMdp() ? 'text' : 'password'" formControlName="motDePasse" autocomplete="new-password" placeholder="8 caractères minimum" />
                  <button type="button" class="voir-mdp" (click)="voirMdp.set(!voirMdp())">{{ voirMdp() ? 'Masquer' : 'Afficher' }}</button></div>
                <app-erreur-champ [controle]="inscription.controls.motDePasse" [serveur]="erreursServeur()['motDePasse']" /></div>
              <button class="btn btn-primaire btn-bloc btn-envoi" type="submit" [disabled]="envoi()">
                @if (envoi()) { <span class="roue"></span> Création… } @else { Créer mon compte <app-icon nom="chevron" [taille]="16" /> }
              </button>
              <p class="demos-aide">Un email de confirmation vous sera envoyé pour activer le compte.</p>
            </form>
          }
        </div>
      </main>

      <!-- À droite : la vitrine (fond « aurore », atouts, cartes qui flottent) -->
      <aside class="auth-vitrine fond-aurore">
        <span class="badge">⚡ La plateforme sportive de Bruxelles</span>
        <div class="anim-apparition">
          <h1>{{ mode() === 'connexion' ? 'Votre prochaine séance' : 'Rejoignez la communauté' }}<br /><span class="titre-degrade">{{ mode() === 'connexion' ? 'commence ici.' : 'FitBook.' }}</span></h1>
          <p class="lead">Salles, cours et coachs de Bruxelles réunis au même endroit. Réservez en quelques secondes, retrouvez tout dans votre espace.</p>
        </div>
        <ul class="atouts">
          <li class="anim-apparition" style="animation-delay:.1s"><span><app-icon nom="search" [taille]="16" /></span><div><strong>Recherche intelligente</strong><small>Filtrez par activité, ville, niveau, prix ou note.</small></div></li>
          <li class="anim-apparition" style="animation-delay:.2s"><span><app-icon nom="cal" [taille]="16" /></span><div><strong>Réservation instantanée</strong><small>Places en temps réel, confirmation par email.</small></div></li>
          <li class="anim-apparition" style="animation-delay:.3s"><span><app-icon nom="qr" [taille]="16" /></span><div><strong>Billet QR code</strong><small>Présentez-le à l'accueil de la salle.</small></div></li>
        </ul>
        <div class="vitrine-scene" aria-hidden="true">
          <div class="verre scene-flottant v1"><span class="pastille" style="background:#22C55E"><app-icon nom="check" [taille]="18" /></span>
            <span><strong>Réservation confirmée</strong><small>Vinyasa Flow · ce soir 18:30</small></span></div>
          <div class="verre scene-flottant v2"><span class="pastille" style="background:#FF5A1F"><app-icon nom="bolt" [taille]="18" /></span>
            <span><strong>Plus que 3 places</strong><small>Boxe débutant · Ring Club</small></span></div>
        </div>
        @if (stats(); as st) {
          <div class="vitrine-chiffres">
            <div><strong>{{ st.salles }}</strong><span>salles</span></div>
            <div><strong>{{ st.coachs }}</strong><span>coachs</span></div>
            <div><strong>{{ st.seances }}</strong><span>séances à venir</span></div>
          </div>
        }
      </aside>
    </div>`,
})
export class ConnexionComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly mode = signal<'connexion' | 'inscription'>('connexion');
  protected readonly envoi = signal(false);
  protected readonly erreur = signal('');
  protected readonly message = signal('');
  protected readonly erreursServeur = signal<Record<string, string>>({});
  /** bandeau « session expirée » : affiché après une redirection ?expire=1, retiré dès qu'on se reconnecte */
  protected readonly expire = signal(this.route.snapshot.queryParamMap.has('expire'));
  protected readonly voirMdp = signal(false);
  /** chiffres affichés dans la vitrine (GET /api/accueil) */
  protected readonly stats = signal<Accueil['stats'] | null>(null);
  protected readonly roles: { id: Role; libelle: string; icone: string }[] = [
    { id: 'SPORTIF', libelle: 'Sportif', icone: 'user' }, { id: 'COACH', libelle: 'Coach', icone: 'bolt' }, { id: 'GESTIONNAIRE', libelle: 'Gérant', icone: 'home' },
  ];

  protected readonly connexion = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    motDePasse: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly inscription = new FormGroup({
    role: new FormControl<Role>('SPORTIF', { nonNullable: true }),
    prenom: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)] }),
    nom: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    telephone: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[0-9 +().-]{6,20}$/)] }),
    specialite: new FormControl('', { nonNullable: true }),
    ville: new FormControl('Bruxelles', { nonNullable: true }),
    motDePasse: new FormControl('', { nonNullable: true, validators: [Validators.required, motDePasseFort] }),
  });

  constructor() {
    const p = this.route.snapshot.queryParamMap;
    if (p.get('mode') === 'inscription') this.mode.set('inscription');
    const r = p.get('role') as Role | null;
    if (r && r !== 'ADMIN') this.inscription.controls.role.setValue(r);
    this.api.get<Accueil>('/accueil').subscribe({ next: (d) => this.stats.set(d.stats), error: () => this.stats.set(null) });
  }

  protected changer(m: 'connexion' | 'inscription'): void { this.mode.set(m); this.erreur.set(''); }

  protected seConnecter(): void {
    this.connexion.markAllAsTouched();
    if (this.connexion.invalid) return;
    this.envoi.set(true);
    this.erreur.set('');
    this.expire.set(false);
    const { email, motDePasse } = this.connexion.getRawValue();
    this.auth.connexion(email, motDePasse).subscribe({
      next: (r) => {
        this.envoi.set(false);
        const retour = this.route.snapshot.queryParamMap.get('retour');
        this.router.navigateByUrl(retour ?? this.auth.espace(r.utilisateur.role));
      },
      error: (e) => {
        this.envoi.set(false);
        // 401 = email inconnu ou mauvais mot de passe. Après « doctrine:fixtures:load », les comptes créés à la main n'existent plus.
        const aide = e?.status === 401 ? ' Si vous aviez créé ce compte avant de recharger les données de démonstration, il a été effacé : réinscrivez-vous.' : '';
        this.erreur.set(ToastService.message(e) + aide);
      },
    });
  }

  protected sInscrire(): void {
    this.inscription.markAllAsTouched();
    if (this.inscription.invalid) return;
    this.envoi.set(true);
    this.erreur.set('');
    this.erreursServeur.set({});
    this.auth.inscription(this.inscription.getRawValue()).subscribe({
      next: (r) => { this.envoi.set(false); this.message.set(r.message); this.mode.set('connexion'); this.connexion.controls.email.setValue(this.inscription.controls.email.value); },
      error: (e) => { this.envoi.set(false); this.erreur.set(ToastService.message(e)); this.erreursServeur.set(ToastService.erreursChamps(e)); },
    });
  }
}
