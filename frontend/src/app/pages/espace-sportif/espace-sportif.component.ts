import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { dateHeure } from '../../core/format';
import { Avis, Reservation, Salle } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { EspaceLayoutComponent, ElementMenu } from '../../layout/espace-layout.component';
import { CalendrierComponent, EvenementCalendrier } from '../../shared/calendrier.component';
import { IconComponent } from '../../shared/icon.component';
import { ProfilComponent } from '../../shared/profil.component';
import { QrCodeComponent } from '../../shared/qr-code.component';
import { SalleCardComponent } from '../../shared/salle-card.component';
import { StarsComponent } from '../../shared/stars.component';

type Filtre = 'avenir' | 'passees' | 'annulees';

/** Espace sportif : tableau de bord, calendrier, réservations (annulation, QR code), historique, favoris, avis, profil. */
@Component({
  selector: 'app-espace-sportif',
  imports: [RouterLink, EspaceLayoutComponent, CalendrierComponent, IconComponent, QrCodeComponent, SalleCardComponent, StarsComponent, ProfilComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-espace-layout libelle="Espace sportif" [menu]="menu" [(actif)]="onglet">
      @switch (onglet()) {
        @case ('tableau') {
          <h1 class="anim-apparition">Bonjour {{ auth.utilisateur()?.prenom }}</h1>
          <p class="texte-gris">Voici vos prochaines séances et votre activité.</p>
          <div class="grille-stats">
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="cal" /></span><span><small>Séances à venir</small><strong>{{ aVenir().length }}</strong></span></div>
            <div class="stat anim-apparition" style="animation-delay:.08s"><span class="stat-icone"><app-icon nom="check" /></span><span><small>Séances réalisées</small><strong>{{ realisees() }}</strong></span></div>
            <div class="stat anim-apparition" style="animation-delay:.16s"><span class="stat-icone"><app-icon nom="heart" /></span><span><small>Favoris</small><strong>{{ favoris().length }}</strong></span></div>
            <div class="stat anim-apparition" style="animation-delay:.24s"><span class="stat-icone"><app-icon nom="star" /></span><span><small>Avis publiés</small><strong>{{ avis().length }}</strong></span></div>
          </div>
          <section class="panneau"><h3>Calendrier</h3><app-calendrier [evenements]="evenements()" /></section>

          <div class="onglets">
            <button type="button" class="chip" [class.actif]="filtre() === 'avenir'" (click)="filtre.set('avenir')">À venir ({{ aVenir().length }})</button>
            <button type="button" class="chip" [class.actif]="filtre() === 'passees'" (click)="filtre.set('passees')">Passées ({{ passees().length }})</button>
            <button type="button" class="chip" [class.actif]="filtre() === 'annulees'" (click)="filtre.set('annulees')">Annulées ({{ annulees().length }})</button>
          </div>
          <section class="panneau">
            <div class="panneau-titre"><h3>Mes réservations</h3><a class="btn btn-primaire btn-petit" routerLink="/recherche"><app-icon nom="plus" [taille]="14" /> Réserver une séance</a></div>
            <div class="tableau-conteneur">
              <table>
                <thead><tr><th>Séance</th><th>Lieu</th><th>Date</th><th>Code</th><th>Statut</th><th>QR</th><th>Action</th></tr></thead>
                <tbody>
                  @for (r of listeFiltree(); track r.id) {
                    <tr>
                      <td><strong>{{ r.seance.titre }}</strong><br /><small class="texte-gris">{{ r.seance.coach.nom }}</small></td>
                      <td><a [routerLink]="['/salles', r.seance.salle.id]">{{ r.seance.salle.nom }}</a></td>
                      <td>{{ dateHeure(r.seance.dateDebut) }}</td>
                      <td><code>FB-{{ r.codeConfirmation.slice(0, 6) }}</code></td>
                      <td>@if (r.statut === 'CONFIRMEE') { <span class="badge badge-succes">Confirmée</span> } @else { <span class="badge badge-danger">Annulée</span> }</td>
                      <td>@if (r.statut === 'CONFIRMEE') { <button type="button" class="btn-icone" (click)="qr.set(r)" aria-label="Afficher le QR code"><app-icon nom="qr" /></button> }</td>
                      <td>@if (filtre() === 'avenir') { <button type="button" class="btn btn-danger btn-petit" (click)="annuler(r)">Annuler</button> }</td>
                    </tr>
                  } @empty { <tr><td colspan="7" class="vide">Aucune réservation.</td></tr> }
                </tbody>
              </table>
            </div>
          </section>
        }
        @case ('favoris') {
          <h1>Mes favoris</h1>
          <div class="grille-cartes">
            @for (s of favoris(); track s.id; let i = $index) {
              <app-salle-card [salle]="s" [delai]="i * 60" [favoriVisible]="true" (favori)="retirerFavori($event)" />
            } @empty { <p class="vide">Aucun favori. Ajoutez des salles depuis la recherche ♥</p> }
          </div>
        }
        @case ('avis') {
          <h1>Mes avis</h1>
          <section class="panneau">
            @for (a of avis(); track a.id) {
              <div class="avis">
                <div style="flex:1"><strong>{{ a.salle?.nom ?? a.coach?.nom }}</strong> <app-stars [note]="a.note" /><p>{{ a.commentaire }}</p></div>
                <span class="badge" [class.badge-succes]="a.statutModeration === 'VALIDE'" [class.badge-doux]="a.statutModeration === 'EN_ATTENTE'" [class.badge-danger]="a.statutModeration === 'REJETE'">
                  {{ a.statutModeration === 'VALIDE' ? 'Publié' : a.statutModeration === 'EN_ATTENTE' ? 'En modération' : 'Refusé' }}</span>
              </div>
            } @empty { <p class="vide">Vous n'avez pas encore publié d'avis. Donnez votre avis depuis la fiche d'une salle ou d'un coach.</p> }
          </section>
        }
        @case ('profil') { <h1>Mon profil</h1><app-profil /> }
      }

      @if (qr(); as r) {
        <div class="modale-fond" (click)="qr.set(null)">
          <div class="modale" style="text-align:center" (click)="$event.stopPropagation()">
            <h3>{{ r.seance.titre }}</h3>
            <p class="texte-gris">{{ dateHeure(r.seance.dateDebut) }} — {{ r.seance.salle.nom }}</p>
            <app-qr-code [texte]="'FITBOOK:' + r.codeConfirmation" />
            <p><code>{{ r.codeConfirmation }}</code></p>
            <p class="texte-gris" style="font-size:13px">Présentez ce QR code à l'accueil de la salle.</p>
            <button type="button" class="btn btn-contour" (click)="qr.set(null)">Fermer</button>
          </div>
        </div>
      }
    </app-espace-layout>`,
})
export class EspaceSportifComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly dateHeure = dateHeure;

  protected readonly menu: ElementMenu[] = [
    { id: 'tableau', libelle: 'Tableau de bord', icone: 'home' },
    { id: 'favoris', libelle: 'Mes favoris', icone: 'heart' },
    { id: 'avis', libelle: 'Mes avis', icone: 'star' },
    { id: 'profil', libelle: 'Mon profil', icone: 'user' },
  ];
  protected readonly onglet = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('onglet') ?? 'tableau');
  protected readonly filtre = signal<Filtre>('avenir');
  protected readonly aVenir = signal<Reservation[]>([]);
  protected readonly historique = signal<Reservation[]>([]);
  protected readonly favoris = signal<Salle[]>([]);
  protected readonly avis = signal<Avis[]>([]);
  protected readonly qr = signal<Reservation | null>(null);

  protected readonly passees = computed(() => this.historique().filter((r) => r.statut === 'CONFIRMEE'));
  protected readonly annulees = computed(() => this.historique().filter((r) => r.statut === 'ANNULEE'));
  protected readonly realisees = computed(() => this.passees().length);
  protected readonly listeFiltree = computed(() => ({ avenir: this.aVenir(), passees: this.passees(), annulees: this.annulees() })[this.filtre()]);
  protected readonly evenements = computed<EvenementCalendrier[]>(() =>
    [...this.aVenir(), ...this.passees()].map((r) => ({ id: r.id, titre: r.seance.titre, debut: r.seance.dateDebut, fin: r.seance.dateFin, sousTitre: r.seance.salle.nom })),
  );

  constructor() { this.charger(); }

  private charger(): void {
    this.api.get<{ aVenir: Reservation[]; historique: Reservation[] }>('/sportif/reservations').subscribe({
      next: (r) => { this.aVenir.set(r.aVenir); this.historique.set(r.historique); },
      error: (e) => this.toast.erreur(e),
    });
    this.api.get<Salle[]>('/sportif/favoris').subscribe((f) => this.favoris.set(f));
    this.api.get<Avis[]>('/sportif/avis').subscribe((a) => this.avis.set(a));
  }

  protected annuler(r: Reservation): void {
    if (!confirm(`Annuler votre réservation pour « ${r.seance.titre} » ?`)) return;
    this.api.post<{ message: string }>(`/sportif/reservations/${r.id}/annuler`).subscribe({
      next: (res) => { this.toast.succes(res.message); this.charger(); },
      error: (e) => this.toast.erreur(e),
    });
  }

  protected retirerFavori(s: Salle): void {
    this.api.delete<{ message: string }>(`/sportif/favoris/${s.id}`).subscribe({ next: (r) => { this.toast.succes(r.message); this.charger(); }, error: (e) => this.toast.erreur(e) });
  }
}
