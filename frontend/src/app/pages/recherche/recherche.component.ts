import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { initiales, teinte } from '../../core/format';
import { Activite, LIBELLES_NIVEAU, Niveau, ResultatRecherche, Salle, Seance } from '../../core/models';
import { ReservationAction } from '../../core/reservation-action.service';
import { ToastService } from '../../core/toast.service';
import { CarteComponent, PointCarte } from '../../shared/carte.component';
import { IconComponent } from '../../shared/icon.component';
import { SalleCardComponent } from '../../shared/salle-card.component';
import { SeanceCardComponent } from '../../shared/seance-card.component';
import { StarsComponent } from '../../shared/stars.component';

type Onglet = 'seances' | 'salles' | 'coachs';
const PAR_PAGE = 9;

/** Barre de recherche + filtres avancés (obligatoire) + carte et recherche par distance (bonus). */
@Component({
  selector: 'app-recherche',
  imports: [FormsModule, RouterLink, IconComponent, SeanceCardComponent, SalleCardComponent, StarsComponent, CarteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-titre">
      <div class="conteneur">
        <h1 style="font-size:32px">Rechercher une séance</h1>
        <form class="barre-recherche" style="box-shadow:none;padding:0" (ngSubmit)="appliquer()">
          <label class="input-icone"><span class="sr-only">Recherche</span><app-icon nom="search" />
            <input class="input" name="q" [(ngModel)]="f.q" placeholder="yoga, boxe, Zen Studio, Yasmina…" /></label>
          <label class="input-icone"><span class="sr-only">Ville</span><app-icon nom="pin" />
            <select class="input" name="ville" [(ngModel)]="f.ville">
              <option value="">Toutes les villes</option>
              @for (v of villes(); track v) { <option [value]="v">{{ v }}</option> }
            </select></label>
          <button class="btn btn-primaire" type="submit">Rechercher</button>
        </form>
      </div>
    </section>

    <div class="conteneur recherche-grille">
      <aside class="panneau filtres">
        <h3><app-icon nom="filter" /> Filtres</h3>
        <h4>Activité</h4>
        @for (a of activites(); track a.id) {
          <label class="case"><input type="checkbox" [checked]="f.activites.includes(a.id)" (change)="basculerActivite(a.id)" /> {{ a.nom }}</label>
        }
        <h4>Niveau</h4>
        <div class="onglets">
          @for (n of niveaux; track n) {
            <button type="button" class="chip" [class.actif]="(f.niveau || 'TOUS') === n" (click)="f.niveau = n">{{ libellesNiveau[n] }}</button>
          }
        </div>
        <h4>Prix maximum <span style="float:right">{{ f.prixMax }} €</span></h4>
        <input type="range" min="5" max="60" step="1" [(ngModel)]="f.prixMax" name="prixMax" aria-label="Prix maximum" />
        <h4>Note minimale</h4>
        <select class="input" [(ngModel)]="f.noteMin" name="noteMin">
          <option [ngValue]="0">Toutes</option><option [ngValue]="3">3 ★ et plus</option><option [ngValue]="4">4 ★ et plus</option><option [ngValue]="4.5">4,5 ★ et plus</option>
        </select>
        <h4>Date</h4>
        <input class="input" type="date" [(ngModel)]="f.date" name="date" />
        <label class="case" style="margin-top:12px"><input type="checkbox" [(ngModel)]="f.disponible" name="disponible" /> Places disponibles uniquement</label>
        <button class="btn btn-primaire btn-bloc" type="button" style="margin-top:16px" (click)="appliquer()">Appliquer les filtres</button>
        <button class="btn btn-bloc" type="button" style="background:none" (click)="reinitialiser()">Réinitialiser</button>
      </aside>

      <section>
        <div class="onglets">
          <button type="button" class="chip" [class.actif]="onglet() === 'seances'" (click)="changerOnglet('seances')">Séances ({{ resultats()?.seances?.length ?? 0 }})</button>
          <button type="button" class="chip" [class.actif]="onglet() === 'salles'" (click)="changerOnglet('salles')">Salles ({{ resultats()?.salles?.length ?? 0 }})</button>
          <button type="button" class="chip" [class.actif]="onglet() === 'coachs'" (click)="changerOnglet('coachs')">Coachs ({{ resultats()?.coachs?.length ?? 0 }})</button>
        </div>
        <div class="resume">
          <span>{{ resume() }}</span>
          <span style="display:flex;gap:8px">
            @if (onglet() === 'salles') {
              <button type="button" class="btn btn-contour btn-petit" (click)="autourDeMoi()"><app-icon nom="map" [taille]="15" /> Autour de moi (5 km)</button>
            }
            @if (onglet() === 'seances') {
              <select class="input" style="width:auto" [(ngModel)]="f.tri" (ngModelChange)="appliquer()" aria-label="Trier">
                <option value="date">Trier : date</option><option value="prix">Trier : prix croissant</option><option value="prix_desc">Trier : prix décroissant</option>
              </select>
            }
          </span>
        </div>

        @if (chargement()) {
          <div class="grille-cartes">@for (i of [1, 2, 3]; track i) { <div class="squelette"></div> }</div>
        } @else {
          @switch (onglet()) {
            @case ('seances') {
              <div class="grille-cartes">
                @for (s of pageSeances(); track s.id; let i = $index) {
                  <app-seance-card [seance]="s" [delai]="i * 50" [enCours]="resa.enCours() === s.id" (reserver)="reserver($event)" />
                } @empty { <p class="vide">Aucune séance ne correspond à vos critères.</p> }
              </div>
            }
            @case ('salles') {
              <div class="panneau" style="padding:10px"><app-carte [points]="points()" /></div>
              <div class="grille-cartes">
                @for (s of resultats()?.salles ?? []; track s.id; let i = $index) {
                  <app-salle-card [salle]="s" [delai]="i * 50" [favoriVisible]="auth.role() === 'SPORTIF'" (favori)="basculerFavori($event)" />
                } @empty { <p class="vide">Aucune salle trouvée.</p> }
              </div>
            }
            @case ('coachs') {
              <div class="grille-cartes">
                @for (c of resultats()?.coachs ?? []; track c.id; let i = $index) {
                  <a class="carte carte-coach anim-apparition" [style.animation-delay.ms]="i * 50" [routerLink]="['/coachs', c.id]">
                    <span class="avatar-grand" [style.background]="teinte(c.nom)">{{ initiales(c.nom) }}</span>
                    <span><strong>{{ c.nom }}</strong><br /><small class="texte-gris">{{ c.specialite }} · {{ c.ville }}</small><br />
                      <app-stars [note]="c.noteMoyenne" /> <small>{{ c.noteMoyenne ?? '–' }} · {{ c.tarifHoraire }} €/h</small></span>
                  </a>
                } @empty { <p class="vide">Aucun coach trouvé.</p> }
              </div>
            }
          }
          @if (onglet() === 'seances' && nbPages() > 1) {
            <div class="onglets" style="justify-content:center;margin-top:24px">
              @for (p of pages(); track p) {
                <button type="button" class="btn btn-petit" [class.btn-primaire]="p === page()" [class.btn-contour]="p !== page()" (click)="page.set(p)">{{ p }}</button>
              }
            </div>
          }
        }
      </section>
    </div>`,
})
export class RechercheComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly resa = inject(ReservationAction);

  protected readonly niveaux: Niveau[] = ['TOUS', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  protected readonly libellesNiveau = LIBELLES_NIVEAU;
  protected readonly teinte = teinte;
  protected readonly initiales = initiales;

  protected readonly activites = signal<Activite[]>([]);
  protected readonly villes = signal<string[]>([]);
  protected readonly resultats = signal<ResultatRecherche | null>(null);
  protected readonly chargement = signal(true);
  protected readonly onglet = signal<Onglet>('seances');
  protected readonly page = signal(1);
  private position: { lat: number; lng: number } | null = null;

  protected f = this.filtresVides();

  protected readonly nbPages = computed(() => Math.ceil((this.resultats()?.seances.length ?? 0) / PAR_PAGE));
  protected readonly pages = computed(() => Array.from({ length: this.nbPages() }, (_, i) => i + 1));
  protected readonly pageSeances = computed(() => (this.resultats()?.seances ?? []).slice((this.page() - 1) * PAR_PAGE, this.page() * PAR_PAGE));
  protected readonly points = computed<PointCarte[]>(() =>
    (this.resultats()?.salles ?? []).map((s: Salle) => ({ id: s.id, nom: s.nom, lat: s.latitude, lng: s.longitude, texte: `${s.adresse}, ${s.ville}`, lien: `/salles/${s.id}` })),
  );
  protected readonly resume = computed(() => {
    const r = this.resultats();
    if (!r) return '';
    const n = { seances: r.seances.length, salles: r.salles.length, coachs: r.coachs.length }[this.onglet()];
    const quoi = { seances: 'séance', salles: 'salle', coachs: 'coach' }[this.onglet()];
    return `${n} ${quoi}${n > 1 ? 's' : ''} trouvée${n > 1 ? 's' : ''}${this.f.q ? ` pour « ${this.f.q} »` : ''}${this.f.ville ? ` à ${this.f.ville}` : ''}`;
  });

  constructor() {
    this.api.get<Activite[]>('/activites').subscribe((a) => this.activites.set(a));
    this.api.get<string[]>('/villes').subscribe((v) => this.villes.set(v));
    // l'URL est la source de vérité : les filtres sont partageables par lien
    this.route.queryParamMap.subscribe((p) => {
      this.f = {
        ...this.filtresVides(),
        q: p.get('q') ?? '',
        ville: p.get('ville') ?? '',
        activites: (p.get('activites') ?? '').split(',').filter(Boolean).map(Number),
        niveau: (p.get('niveau') as Niveau) ?? 'TOUS',
        prixMax: Number(p.get('prixMax') ?? 60),
        noteMin: Number(p.get('noteMin') ?? 0),
        date: p.get('date') ?? '',
        disponible: p.get('disponible') === '1',
        tri: p.get('tri') ?? 'date',
      };
      const o = p.get('onglet') as Onglet | null;
      if (o) this.onglet.set(o);
      this.charger();
    });
  }

  private filtresVides() {
    return { q: '', ville: '', activites: [] as number[], niveau: 'TOUS' as Niveau, prixMax: 60, noteMin: 0, date: '', disponible: false, tri: 'date' };
  }

  private charger(): void {
    this.chargement.set(true);
    this.page.set(1);
    this.api.get<ResultatRecherche>('/recherche', {
      ...this.f,
      prixMax: this.f.prixMax < 60 ? this.f.prixMax : null,
      niveau: this.f.niveau === 'TOUS' ? null : this.f.niveau,
      disponible: this.f.disponible ? 1 : null,
      lat: this.position?.lat, lng: this.position?.lng, rayon: this.position ? 5 : null,
    }).subscribe({
      next: (r) => { this.resultats.set(r); this.chargement.set(false); },
      error: (e) => { this.toast.erreur(e); this.chargement.set(false); },
    });
  }

  protected appliquer(): void {
    this.router.navigate(['/recherche'], {
      queryParams: {
        q: this.f.q || null, ville: this.f.ville || null, activites: this.f.activites.join(',') || null,
        niveau: this.f.niveau !== 'TOUS' ? this.f.niveau : null, prixMax: this.f.prixMax < 60 ? this.f.prixMax : null,
        noteMin: this.f.noteMin || null, date: this.f.date || null, disponible: this.f.disponible ? 1 : null,
        tri: this.f.tri !== 'date' ? this.f.tri : null, onglet: this.onglet() !== 'seances' ? this.onglet() : null,
      },
    });
  }

  protected reinitialiser(): void {
    this.position = null;
    this.router.navigate(['/recherche']);
  }

  protected changerOnglet(o: Onglet): void { this.onglet.set(o); }

  protected basculerActivite(id: number): void {
    this.f.activites = this.f.activites.includes(id) ? this.f.activites.filter((a) => a !== id) : [...this.f.activites, id];
  }

  protected reserver(s: Seance): void { this.resa.reserver(s, () => this.charger()); }

  protected basculerFavori(s: Salle): void {
    const req = s.estFavori ? this.api.delete<{ message: string }>(`/sportif/favoris/${s.id}`) : this.api.post<{ message: string }>(`/sportif/favoris/${s.id}`);
    req.subscribe({ next: (r) => { this.toast.succes(r.message); this.charger(); }, error: (e) => this.toast.erreur(e) });
  }

  /** Bonus « recherche par distance » : géolocalisation du navigateur, salles à 5 km */
  protected autourDeMoi(): void {
    if (!navigator.geolocation) { this.toast.info('Géolocalisation indisponible.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { this.position = { lat: p.coords.latitude, lng: p.coords.longitude }; this.charger(); this.toast.info('Salles à moins de 5 km de vous.'); },
      () => this.toast.info('Position refusée : autorisez la géolocalisation.'),
    );
  }
}
