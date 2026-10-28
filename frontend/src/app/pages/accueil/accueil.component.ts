import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { dateHeure, initiales } from '../../core/format';
import { ApiService } from '../../core/api.service';
import { Accueil, Seance } from '../../core/models';
import { ReservationAction } from '../../core/reservation-action.service';
import { IconComponent } from '../../shared/icon.component';
import { SalleCardComponent } from '../../shared/salle-card.component';
import { SeanceCardComponent } from '../../shared/seance-card.component';

@Component({
  selector: 'app-accueil',
  imports: [FormsModule, RouterLink, IconComponent, SeanceCardComponent, SalleCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero fond-aurore">
      <div class="conteneur hero-grille">
        <div class="anim-apparition">
          <span class="badge badge-doux">{{ donnees()?.stats?.salles ?? '…' }} salles partenaires à Bruxelles</span>
          <h1 style="margin-top:18px">Trouvez votre salle,<br /><span>votre cours, votre coach.</span></h1>
          <p class="lead">Recherchez, comparez et réservez une séance de sport en quelques clics.</p>
          <!-- Formulaire de recherche : pas de cadre blanc, des champs transparents sur le fond aurore -->
          <form class="hero-recherche" (ngSubmit)="rechercher()">
            <label class="champ-verre"><span class="sr-only">Recherche</span><app-icon nom="search" />
              <input name="q" [(ngModel)]="q" placeholder="Salle, coach, activité…" /></label>
            <label class="champ-verre"><span class="sr-only">Ville</span><app-icon nom="pin" />
              <select name="ville" [(ngModel)]="ville">
                <option value="">Toutes les villes</option>
                @for (v of villes(); track v) { <option [value]="v">{{ v }}</option> }
              </select></label>
            <button class="btn btn-primaire btn-envoi" type="submit">Rechercher <app-icon nom="chevron" [taille]="16" /></button>
          </form>
          <div class="onglets" style="margin-top:18px">
            @for (a of (donnees()?.activites ?? []).slice(0, 5); track a.id) {
              <a class="chip" [routerLink]="['/recherche']" [queryParams]="{ activites: a.id }">{{ a.nom }}</a>
            }
          </div>
          <div class="hero-chiffres">
            <div><strong>{{ donnees()?.stats?.salles ?? 0 }}</strong><span>salles</span></div>
            <div><strong>{{ donnees()?.stats?.coachs ?? 0 }}</strong><span>coachs</span></div>
            <div><strong>{{ donnees()?.stats?.seances ?? 0 }}</strong><span>séances à venir</span></div>
          </div>
        </div>
        <!-- À droite : scène décorative, cartes « verre dépoli » remplies avec les vraies données de l'API -->
        <div class="hero-scene" aria-hidden="true">
          @if (vedette(); as s) {
            <div class="verre scene-carte">
              <div class="scene-image">
                <svg viewBox="0 0 400 170" preserveAspectRatio="none">
                  <circle cx="330" cy="40" r="70" fill="rgba(255,255,255,.18)" />
                  <circle cx="60" cy="150" r="90" fill="rgba(255,255,255,.10)" />
                  <path d="M0 120 C 80 80, 150 150, 230 105 S 360 70, 400 95 L400 170 L0 170 Z" fill="rgba(15,23,42,.18)" />
                  <path d="M0 140 C 90 110, 170 170, 260 130 S 370 110, 400 125" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none" />
                </svg>
                <span class="chip">{{ s.activite.nom }}</span>
              </div>
              <h3>{{ s.titre }}</h3>
              <p>{{ s.salle.nom }} · {{ dateHeure(s.dateDebut) }}</p>
              <div class="scene-jauge"><span [style.width.%]="(s.inscrits / s.capaciteMax) * 100"></span></div>
              <div class="scene-bas"><span>{{ s.placesRestantes }} place{{ s.placesRestantes > 1 ? 's' : '' }} restante{{ s.placesRestantes > 1 ? 's' : '' }}</span>
                <span class="btn btn-primaire">Réserver</span></div>
            </div>
          }
          @if (donnees()?.meilleuresSalles?.[0]; as m) {
            <div class="verre scene-flottant scene-note"><span class="pastille"><app-icon nom="star" [taille]="18" /></span>
              <span><strong>{{ m.noteMoyenne ?? '–' }} / 5</strong><small>{{ m.nom }} · {{ m.nbAvis }} avis</small></span></div>
          }
          <div class="verre scene-flottant scene-ok"><span class="pastille"><app-icon nom="check" [taille]="18" /></span>
            <span><strong>Réservation confirmée</strong><small>QR code envoyé par email</small></span></div>
          @if (coachs().length) {
            <div class="verre scene-flottant scene-coachs">
              <span class="avatars">@for (c of coachs(); track c; let i = $index) { <span [style.background]="couleurs[i]">{{ initiales(c) }}</span> }</span>
              <span><strong>{{ donnees()?.stats?.coachs }} coachs</strong><small>à Bruxelles</small></span>
            </div>
          }
        </div>
      </div>
    </section>

    <div class="conteneur">
      <section class="section">
        <div class="section-titre"><h2>Activités populaires</h2><a class="lien" routerLink="/recherche">Tout voir</a></div>
        <div class="grille-activites">
          @for (a of donnees()?.activites ?? []; track a.id; let i = $index) {
            <a class="carte carte-activite anim-apparition" [style.animation-delay.ms]="i * 60" [routerLink]="['/recherche']" [queryParams]="{ activites: a.id }">
              <span class="stat-icone"><app-icon nom="bolt" /></span>
              <strong>{{ a.nom }}</strong><small>{{ a.total }} séance{{ a.total! > 1 ? 's' : '' }}</small>
            </a>
          }
        </div>
      </section>

      <section class="section">
        <div class="section-titre"><h2>Séances à venir</h2><a class="lien" routerLink="/recherche">Voir toutes les séances</a></div>
        @if (donnees(); as d) {
          <div class="grille-cartes quatre">
            @for (s of d.prochainesSeances.slice(0, 4); track s.id; let i = $index) {
              <app-seance-card [seance]="s" [delai]="i * 80" [enCours]="resa.enCours() === s.id" (reserver)="reserver($event)" />
            }
          </div>
        } @else {
          <div class="grille-cartes quatre">@for (i of [1, 2, 3, 4]; track i) { <div class="squelette"></div> }</div>
        }
      </section>

      <section class="section">
        <div class="section-titre"><h2>Salles les mieux notées</h2></div>
        <div class="grille-cartes quatre">
          @for (s of donnees()?.meilleuresSalles ?? []; track s.id; let i = $index) {
            <app-salle-card [salle]="s" [delai]="i * 80" />
          }
        </div>
      </section>
    </div>`,
})
export class AccueilComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly resa = inject(ReservationAction);
  protected readonly donnees = signal<Accueil | null>(null);
  protected readonly villes = signal<string[]>([]);
  protected readonly dateHeure = dateHeure;
  protected readonly initiales = initiales;
  /** séance mise en avant dans la scène du hero : la première qui a encore des places */
  protected readonly vedette = computed(() => {
    const l = this.donnees()?.prochainesSeances ?? [];
    return l.find((s) => s.placesRestantes > 0) ?? l[0] ?? null;
  });
  protected readonly couleurs = ['#FF5A1F', '#8B5CF6', '#0EA5E9', '#22C55E'];
  /** 3 coachs différents (pour les pastilles d'avatars) */
  protected readonly coachs = computed(() => [...new Set((this.donnees()?.prochainesSeances ?? []).map((s) => s.coach.nom))].slice(0, 3));
  protected q = '';
  protected ville = '';

  constructor() {
    this.charger();
    this.api.get<string[]>('/villes').subscribe((v) => this.villes.set(v));
  }

  private charger(): void {
    this.api.get<Accueil>('/accueil').subscribe({ next: (d) => this.donnees.set(d), error: () => this.donnees.set({ stats: { salles: 0, coachs: 0, seances: 0 }, activites: [], prochainesSeances: [], meilleuresSalles: [] }) });
  }

  protected rechercher(): void {
    this.router.navigate(['/recherche'], { queryParams: { q: this.q || null, ville: this.ville || null } });
  }

  protected reserver(s: Seance): void {
    this.resa.reserver(s, () => this.charger());
  }
}
