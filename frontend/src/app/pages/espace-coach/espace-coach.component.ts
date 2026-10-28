import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { dateHeure, prix } from '../../core/format';
import { Avis, Coach, Disponibilite, JOURS, Reservation, Seance } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { EspaceLayoutComponent, ElementMenu } from '../../layout/espace-layout.component';
import { CalendrierComponent, EvenementCalendrier } from '../../shared/calendrier.component';
import { ErreurChampComponent } from '../../shared/erreur-champ.component';
import { IconComponent } from '../../shared/icon.component';
import { ProfilComponent } from '../../shared/profil.component';
import { SeanceFormComponent } from '../../shared/seance-form.component';
import { StarsComponent } from '../../shared/stars.component';

interface StatsCoach { seancesAVenir: number; participants: number; tauxRemplissage: number; noteMoyenne: number | null; }

/** Espace coach : séances (CRUD), disponibilités, calendrier, réservations et avis, profil professionnel. */
@Component({
  selector: 'app-espace-coach',
  imports: [ReactiveFormsModule, EspaceLayoutComponent, CalendrierComponent, IconComponent, SeanceFormComponent, StarsComponent, ProfilComponent, ErreurChampComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-espace-layout libelle="Espace coach" [menu]="menu" [(actif)]="onglet">
      @switch (onglet()) {
        @case ('seances') {
          <div class="panneau-titre"><div><h1>Mes séances</h1><p class="texte-gris">Créez, modifiez et suivez le remplissage de vos séances.</p></div>
            <button type="button" class="btn btn-primaire" (click)="ouvrirFormulaire(null)"><app-icon nom="plus" [taille]="16" /> Nouvelle séance</button></div>
          <div class="grille-stats">
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="cal" /></span><span><small>Séances à venir</small><strong>{{ stats()?.seancesAVenir ?? 0 }}</strong></span></div>
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="user" /></span><span><small>Participants</small><strong>{{ stats()?.participants ?? 0 }}</strong></span></div>
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="chart" /></span><span><small>Taux de remplissage</small><strong>{{ stats()?.tauxRemplissage ?? 0 }} %</strong></span></div>
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="star" /></span><span><small>Note moyenne</small><strong>{{ stats()?.noteMoyenne ?? '–' }}</strong></span></div>
          </div>
          <section class="panneau">
            <h3>Séances programmées</h3>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Titre</th><th>Lieu</th><th>Date</th><th>Inscrits</th><th>Remplissage</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                @for (s of seancesAVenir(); track s.id) {
                  <tr>
                    <td><strong>{{ s.titre }}</strong></td><td>{{ s.salle.nom }}</td><td>{{ dateHeure(s.dateDebut) }}</td>
                    <td>{{ s.inscrits }} / {{ s.capaciteMax }}</td>
                    <td><div class="barre"><span [style.width.%]="(100 * s.inscrits) / s.capaciteMax"></span></div></td>
                    <td>{{ prix(s.prix) }}</td>
                    <td>@if (s.statut === 'ANNULEE') { <span class="badge badge-danger">Annulée</span> } @else if (s.placesRestantes === 0) { <span class="badge badge-danger">Complet</span> } @else { <span class="badge badge-succes">Actif</span> }</td>
                    <td class="actions">@if (s.statut !== 'ANNULEE') {
                      <button type="button" class="btn-icone" (click)="ouvrirFormulaire(s)" aria-label="Modifier"><app-icon nom="edit" [taille]="16" /></button>
                      <button type="button" class="btn-icone danger" (click)="supprimer(s)" aria-label="Supprimer"><app-icon nom="trash" [taille]="16" /></button> }</td>
                  </tr>
                } @empty { <tr><td colspan="8" class="vide">Aucune séance à venir.</td></tr> }
              </tbody>
            </table></div>
          </section>
          <div class="deux-colonnes">
            <section class="panneau">
              <h3>Mes disponibilités</h3>
              @for (d of disponibilites(); track d.id) {
                <div class="creneau anim-apparition"><strong>{{ d.jour }}</strong><span class="meta"><app-icon nom="clock" [taille]="14" /> {{ d.heureDebut }} – {{ d.heureFin }}</span>
                  <button type="button" class="btn-icone danger" (click)="supprimerDispo(d)" aria-label="Supprimer"><app-icon nom="trash" [taille]="15" /></button></div>
              } @empty { <p class="texte-gris">Aucune disponibilité.</p> }
              <form [formGroup]="dispo" (ngSubmit)="ajouterDispo()" class="grille-form trois" style="margin-top:12px">
                <div class="champ"><label>Jour</label><select class="input" formControlName="jourSemaine">
                  @for (j of [1, 2, 3, 4, 5, 6, 7]; track j) { <option [ngValue]="j">{{ jours[j] }}</option> }</select></div>
                <div class="champ"><label>De</label><input class="input" type="time" formControlName="heureDebut" /><app-erreur-champ [serveur]="erreursDispo()['heureDebut']" /></div>
                <div class="champ"><label>À</label><input class="input" type="time" formControlName="heureFin" /><app-erreur-champ [serveur]="erreursDispo()['heureFin']" /></div>
                <button class="btn btn-doux" type="submit"><app-icon nom="plus" [taille]="14" /> Ajouter</button>
              </form>
            </section>
            <section class="panneau">
              <h3>Nouvelle séance</h3>
              <app-seance-form (enregistre)="charger()" />
            </section>
          </div>
        }
        @case ('calendrier') {
          <h1>Calendrier</h1>
          <section class="panneau"><app-calendrier [evenements]="evenements()" (selection)="selection($event)" /></section>
        }
        @case ('reservations') {
          <h1>Réservations et avis</h1>
          <section class="panneau">
            <h3>Participants ({{ reservations().length }})</h3>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Sportif</th><th>Séance</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>@for (r of reservations(); track r.id) {
                <tr><td>{{ r.sportif.nom }}<br /><small class="texte-gris">{{ r.sportif.email }}</small></td><td>{{ r.seance.titre }}</td><td>{{ dateHeure(r.seance.dateDebut) }}</td>
                  <td>@if (r.statut === 'CONFIRMEE') { <span class="badge badge-succes">Confirmée</span> } @else { <span class="badge badge-danger">Annulée</span> }</td></tr>
              } @empty { <tr><td colspan="4" class="vide">Aucune réservation.</td></tr> }</tbody>
            </table></div>
          </section>
          <section class="panneau">
            <h3>Avis reçus</h3>
            @for (a of avis(); track a.id) {
              <div class="avis"><div style="flex:1"><strong>{{ a.auteur }}</strong> <app-stars [note]="a.note" /><p>{{ a.commentaire }}</p></div>
                <span class="badge" [class.badge-succes]="a.statutModeration === 'VALIDE'" [class.badge-gris]="a.statutModeration !== 'VALIDE'">{{ a.statutModeration === 'VALIDE' ? 'Publié' : 'En modération' }}</span></div>
            } @empty { <p class="texte-gris">Aucun avis.</p> }
          </section>
        }
        @case ('profil') {
          <h1>Profil professionnel</h1>
          <form class="panneau" [formGroup]="profilPro" (ngSubmit)="enregistrerProfil()">
            <div class="grille-form trois">
              <div class="champ"><label>Spécialité</label><input class="input" formControlName="specialite" /><app-erreur-champ [controle]="profilPro.controls.specialite" [serveur]="erreursProfil()['specialite']" /></div>
              <div class="champ"><label>Ville</label><input class="input" formControlName="ville" /><app-erreur-champ [controle]="profilPro.controls.ville" /></div>
              <div class="champ"><label>Tarif horaire (€)</label><input class="input" type="number" formControlName="tarifHoraire" min="0" /><app-erreur-champ [controle]="profilPro.controls.tarifHoraire" [serveur]="erreursProfil()['tarifHoraire']" /></div>
            </div>
            <div class="champ"><label>Biographie</label><textarea class="input" formControlName="biographie" rows="5"></textarea></div>
            <button class="btn btn-primaire" type="submit">Enregistrer</button>
          </form>
        }
        @case ('compte') { <h1>Mon compte</h1><app-profil /> }
      }

      @if (formulaireOuvert()) {
        <div class="modale-fond" (click)="formulaireOuvert.set(false)">
          <div class="modale" (click)="$event.stopPropagation()">
            <div class="panneau-titre"><h3>{{ edition() ? 'Modifier la séance' : 'Nouvelle séance' }}</h3>
              <button type="button" class="btn-icone" (click)="formulaireOuvert.set(false)" aria-label="Fermer"><app-icon nom="x" /></button></div>
            <app-seance-form [seance]="edition()" (enregistre)="formulaireOuvert.set(false); charger()" />
          </div>
        </div>
      }
    </app-espace-layout>`,
})
export class EspaceCoachComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly dateHeure = dateHeure;
  protected readonly prix = prix;
  protected readonly jours = JOURS;
  protected readonly menu: ElementMenu[] = [
    { id: 'seances', libelle: 'Mes séances', icone: 'list' },
    { id: 'calendrier', libelle: 'Calendrier', icone: 'cal' },
    { id: 'reservations', libelle: 'Réservations et avis', icone: 'user' },
    { id: 'profil', libelle: 'Profil pro', icone: 'edit' },
    { id: 'compte', libelle: 'Mon compte', icone: 'shield' },
  ];
  protected readonly onglet = signal('seances');
  protected readonly seances = signal<Seance[]>([]);
  protected readonly stats = signal<StatsCoach | null>(null);
  protected readonly disponibilites = signal<Disponibilite[]>([]);
  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly avis = signal<Avis[]>([]);
  protected readonly formulaireOuvert = signal(false);
  protected readonly edition = signal<Seance | null>(null);
  protected readonly erreursDispo = signal<Record<string, string>>({});
  protected readonly erreursProfil = signal<Record<string, string>>({});

  protected readonly seancesAVenir = computed(() => this.seances().filter((s) => new Date(s.dateDebut) > new Date()));
  protected readonly evenements = computed<EvenementCalendrier[]>(() => [
    ...this.seances().map((s) => ({ id: s.id, titre: s.titre, debut: s.dateDebut, fin: s.dateFin, sousTitre: `${s.salle.nom} · ${s.inscrits}/${s.capaciteMax}`,
      etat: (s.statut === 'ANNULEE' ? 'annule' : s.placesRestantes === 0 ? 'complet' : 'ok') as EvenementCalendrier['etat'] })),
  ]);

  protected readonly dispo = new FormGroup({
    jourSemaine: new FormControl(1, { nonNullable: true }),
    heureDebut: new FormControl('09:00', { nonNullable: true, validators: [Validators.required] }),
    heureFin: new FormControl('12:00', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly profilPro = new FormGroup({
    specialite: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    ville: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tarifHoraire: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    biographie: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
  });

  constructor() {
    this.charger();
    this.api.get<Coach>('/coach/profil').subscribe((c) => this.profilPro.patchValue({ specialite: c.specialite, ville: c.ville, tarifHoraire: c.tarifHoraire, biographie: c.biographie ?? '' }));
  }

  charger(): void {
    this.api.get<Seance[]>('/coach/seances').subscribe({ next: (s) => this.seances.set(s), error: (e) => this.toast.erreur(e) });
    this.api.get<StatsCoach>('/coach/stats').subscribe((s) => this.stats.set(s));
    this.api.get<Disponibilite[]>('/coach/disponibilites').subscribe((d) => this.disponibilites.set(d));
    this.api.get<Reservation[]>('/coach/reservations').subscribe((r) => this.reservations.set(r));
    this.api.get<Avis[]>('/coach/avis').subscribe((a) => this.avis.set(a));
  }

  protected ouvrirFormulaire(s: Seance | null): void { this.edition.set(s); this.formulaireOuvert.set(true); }

  protected selection(e: EvenementCalendrier): void {
    const s = this.seances().find((x) => x.id === e.id);
    if (s && s.statut !== 'ANNULEE' && new Date(s.dateDebut) > new Date()) this.ouvrirFormulaire(s);
  }

  protected supprimer(s: Seance): void {
    const msg = s.inscrits > 0 ? `${s.inscrits} sportif(s) inscrit(s) : la séance sera ANNULÉE et ils seront prévenus par email. Continuer ?` : `Supprimer « ${s.titre} » ?`;
    if (!confirm(msg)) return;
    this.api.delete<{ message: string }>(`/coach/seances/${s.id}`).subscribe({ next: (r) => { this.toast.succes(r.message); this.charger(); }, error: (e) => this.toast.erreur(e) });
  }

  protected ajouterDispo(): void {
    this.api.post<Disponibilite>('/coach/disponibilites', this.dispo.getRawValue()).subscribe({
      next: () => { this.erreursDispo.set({}); this.toast.succes('Disponibilité ajoutée.'); this.charger(); },
      error: (e) => { this.erreursDispo.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }

  protected supprimerDispo(d: Disponibilite): void {
    this.api.delete<{ message: string }>(`/coach/disponibilites/${d.id}`).subscribe({ next: (r) => { this.toast.succes(r.message); this.charger(); }, error: (e) => this.toast.erreur(e) });
  }

  protected enregistrerProfil(): void {
    this.profilPro.markAllAsTouched();
    if (this.profilPro.invalid) return;
    this.api.put<Coach>('/coach/profil', this.profilPro.getRawValue()).subscribe({
      next: () => { this.erreursProfil.set({}); this.toast.succes('Profil professionnel enregistré.'); },
      error: (e) => { this.erreursProfil.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }
}
