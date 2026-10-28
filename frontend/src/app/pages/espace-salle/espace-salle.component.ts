import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { dateHeure, prix, teinte } from '../../core/format';
import { Avis, JOURS, Reservation, Salle, Seance } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { EspaceLayoutComponent, ElementMenu } from '../../layout/espace-layout.component';
import { CalendrierComponent, EvenementCalendrier } from '../../shared/calendrier.component';
import { ErreurChampComponent } from '../../shared/erreur-champ.component';
import { IconComponent } from '../../shared/icon.component';
import { ProfilComponent } from '../../shared/profil.component';
import { SeanceFormComponent } from '../../shared/seance-form.component';
import { StarsComponent } from '../../shared/stars.component';

interface StatsSalle { seancesAVenir: number; reservationsConfirmees: number; reservationsCeMois: number; tauxRemplissage: number; noteMoyenne: number | null; nbAvis: number; }
interface LigneHoraire { jourSemaine: number; heureDebut: string; heureFin: string; ouvert: boolean; }

/** Espace salle / gestionnaire : informations, horaires, cours et capacités, calendrier, réservations, avis, statistiques. */
@Component({
  selector: 'app-espace-salle',
  imports: [FormsModule, ReactiveFormsModule, EspaceLayoutComponent, CalendrierComponent, IconComponent, SeanceFormComponent, StarsComponent, ProfilComponent, ErreurChampComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-espace-layout libelle="Espace salle" [menu]="menu" [(actif)]="onglet">
      @if (salles().length > 1) {
        <div class="onglets">
          @for (s of salles(); track s.id) { <button type="button" class="chip" [class.actif]="s.id === salleId()" (click)="choisir(s.id)">{{ s.nom }}</button> }
          <button type="button" class="chip" (click)="nouvelleSalle()"><app-icon nom="plus" [taille]="14" /> Nouvelle salle</button>
        </div>
      }
      @switch (onglet()) {
        @case ('salle') {
          <h1>{{ creation() ? 'Nouvelle salle' : 'Ma salle' }}</h1>
          <p class="texte-gris">Informations publiques, équipements et capacités.</p>
          <div class="fiche-grille">
            <form class="panneau anim-apparition" [formGroup]="form" (ngSubmit)="enregistrer()">
              <h3>Informations de la salle</h3>
              <div class="champ"><label>Nom de la salle</label><input class="input" formControlName="nom" /><app-erreur-champ [controle]="form.controls.nom" [serveur]="erreurs()['nom']" /></div>
              <div class="grille-form deux">
                <div class="champ"><label>Adresse</label><input class="input" formControlName="adresse" /><app-erreur-champ [controle]="form.controls.adresse" [serveur]="erreurs()['adresse']" /></div>
                <div class="champ"><label>Code postal</label><input class="input" formControlName="codePostal" /><app-erreur-champ [controle]="form.controls.codePostal" [serveur]="erreurs()['codePostal']" /></div>
                <div class="champ"><label>Ville</label><input class="input" formControlName="ville" /><app-erreur-champ [controle]="form.controls.ville" [serveur]="erreurs()['ville']" /></div>
                <div class="champ"><label>Téléphone</label><input class="input" formControlName="telephone" /><app-erreur-champ [controle]="form.controls.telephone" [serveur]="erreurs()['telephone']" /></div>
                <div class="champ"><label>Latitude</label><input class="input" type="number" step="0.0001" formControlName="latitude" /><app-erreur-champ [serveur]="erreurs()['latitude']" /></div>
                <div class="champ"><label>Longitude</label><input class="input" type="number" step="0.0001" formControlName="longitude" /><app-erreur-champ [serveur]="erreurs()['longitude']" /></div>
              </div>
              <div class="champ"><label>Description</label><textarea class="input" formControlName="description"></textarea></div>
              <div class="champ"><label>Équipements</label>
                <div class="onglets">
                  @for (e of equipements(); track e) { <button type="button" class="chip chip-plein" (click)="retirerEquipement(e)">{{ e }} ×</button> }
                  <input class="input" style="width:180px" [(ngModel)]="nouvelEquipement" [ngModelOptions]="{ standalone: true }" placeholder="+ ajouter (Entrée)" (keydown.enter)="$event.preventDefault(); ajouterEquipement()" />
                </div></div>
              <button class="btn btn-primaire" type="submit">{{ creation() ? 'Créer la salle' : 'Enregistrer' }}</button>
            </form>
            @if (!creation()) {
              <aside>
                <div class="panneau"><h3>Aperçu public</h3><div class="visuel" style="margin:0 0 10px" [style.background]="teinte(form.controls.nom.value)"><span class="vague"></span></div>
                  <p class="meta"><app-stars [note]="stats()?.noteMoyenne ?? 0" /> {{ stats()?.noteMoyenne ?? '–' }} ({{ stats()?.nbAvis ?? 0 }} avis)</p></div>
                <div class="stat" style="margin-bottom:14px"><span class="stat-icone"><app-icon nom="user" /></span><span><small>Réservations ce mois</small><strong>{{ stats()?.reservationsCeMois ?? 0 }}</strong></span></div>
                <div class="stat" style="margin-bottom:14px"><span class="stat-icone"><app-icon nom="chart" /></span><span><small>Taux de remplissage</small><strong>{{ stats()?.tauxRemplissage ?? 0 }} %</strong></span></div>
                <div class="stat"><span class="stat-icone"><app-icon nom="cal" /></span><span><small>Cours à venir</small><strong>{{ stats()?.seancesAVenir ?? 0 }}</strong></span></div>
                <p class="texte-gris" style="font-size:12px;margin-top:8px">Statistiques calculées avec les procédures stockées <code>getAvisSalle</code> et <code>getNombreReservationsSalle</code>.</p>
              </aside>
            }
          </div>
        }
        @case ('cours') {
          <h1>Cours et horaires</h1>
          <section class="panneau">
            <h3>Cours de la salle</h3>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Cours</th><th>Activité</th><th>Coach</th><th>Créneau</th><th>Capacité</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>@for (s of coursAVenir(); track s.id) {
                <tr><td><strong>{{ s.titre }}</strong></td><td>{{ s.activite.nom }}</td><td>{{ s.coach.nom }}</td><td>{{ dateHeure(s.dateDebut) }}</td>
                  <td>{{ s.inscrits }} / {{ s.capaciteMax }}</td><td>{{ prix(s.prix) }}</td>
                  <td>@if (s.statut === 'ANNULEE') { <span class="badge badge-gris">Annulé</span> } @else if (s.placesRestantes === 0) { <span class="badge badge-danger">Complet</span> } @else { <span class="badge badge-succes">Actif</span> }</td>
                  <td class="actions">@if (s.statut !== 'ANNULEE') {
                    <button type="button" class="btn-icone" (click)="edition.set(s)" aria-label="Modifier"><app-icon nom="edit" [taille]="16" /></button>
                    <button type="button" class="btn-icone danger" (click)="supprimerCours(s)" aria-label="Supprimer"><app-icon nom="trash" [taille]="16" /></button> }</td></tr>
              } @empty { <tr><td colspan="8" class="vide">Aucun cours programmé.</td></tr> }</tbody>
            </table></div>
          </section>
          <div class="deux-colonnes">
            <section class="panneau">
              <h3>Programmer un cours</h3>
              @if (salleCourante(); as sc) { <app-seance-form [modeGestion]="true" [sallesImposees]="[sc]" (enregistre)="chargerSalle()" /> }
            </section>
            <section class="panneau">
              <h3>Horaires d'ouverture</h3>
              @for (h of horaires(); track h.jourSemaine) {
                <div class="creneau">
                  <label class="case" style="width:120px"><input type="checkbox" [(ngModel)]="h.ouvert" /> {{ jours[h.jourSemaine] }}</label>
                  <input class="input" type="time" style="width:auto" [(ngModel)]="h.heureDebut" [disabled]="!h.ouvert" aria-label="Ouverture" />
                  <input class="input" type="time" style="width:auto" [(ngModel)]="h.heureFin" [disabled]="!h.ouvert" aria-label="Fermeture" />
                </div>
              }
              <button type="button" class="btn btn-primaire" (click)="enregistrerHoraires()">Enregistrer les horaires</button>
            </section>
          </div>
        }
        @case ('calendrier') {
          <h1>Calendrier de la salle</h1>
          <section class="panneau"><app-calendrier [evenements]="evenements()" (selection)="ouvrirDepuisCalendrier($event)" /></section>
        }
        @case ('reservations') {
          <h1>Réservations et avis</h1>
          <section class="panneau">
            <h3>Réservations ({{ reservations().length }})</h3>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Sportif</th><th>Cours</th><th>Date</th><th>Code</th><th>Statut</th></tr></thead>
              <tbody>@for (r of reservations(); track r.id) {
                <tr><td>{{ r.sportif.nom }}</td><td>{{ r.seance.titre }}</td><td>{{ dateHeure(r.seance.dateDebut) }}</td><td><code>{{ r.codeConfirmation }}</code></td>
                  <td>@if (r.statut === 'CONFIRMEE') { <span class="badge badge-succes">Confirmée</span> } @else { <span class="badge badge-danger">Annulée</span> }</td></tr>
              } @empty { <tr><td colspan="5" class="vide">Aucune réservation.</td></tr> }</tbody>
            </table></div>
          </section>
          <section class="panneau">
            <h3>Avis sur la salle</h3>
            @for (a of avis(); track a.id) {
              <div class="avis"><div style="flex:1"><strong>{{ a.auteur }}</strong> <app-stars [note]="a.note" /><p>{{ a.commentaire }}</p></div>
                <span class="badge" [class.badge-succes]="a.statutModeration === 'VALIDE'" [class.badge-gris]="a.statutModeration !== 'VALIDE'">{{ a.statutModeration === 'VALIDE' ? 'Publié' : 'En modération' }}</span></div>
            } @empty { <p class="texte-gris">Aucun avis.</p> }
          </section>
        }
        @case ('compte') { <h1>Mon compte</h1><app-profil /> }
      }

      @if (edition(); as e) {
        <div class="modale-fond" (click)="edition.set(null)">
          <div class="modale" (click)="$event.stopPropagation()">
            <div class="panneau-titre"><h3>Modifier le cours</h3><button type="button" class="btn-icone" (click)="edition.set(null)" aria-label="Fermer"><app-icon nom="x" /></button></div>
            <app-seance-form [seance]="e" [modeGestion]="true" [sallesImposees]="salles()" (enregistre)="edition.set(null); chargerSalle()" />
          </div>
        </div>
      }
    </app-espace-layout>`,
})
export class EspaceSalleComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly dateHeure = dateHeure;
  protected readonly prix = prix;
  protected readonly teinte = teinte;
  protected readonly jours = JOURS;
  protected readonly menu: ElementMenu[] = [
    { id: 'salle', libelle: 'Ma salle', icone: 'home' },
    { id: 'cours', libelle: 'Cours et horaires', icone: 'list' },
    { id: 'calendrier', libelle: 'Calendrier', icone: 'cal' },
    { id: 'reservations', libelle: 'Réservations et avis', icone: 'user' },
    { id: 'compte', libelle: 'Mon compte', icone: 'shield' },
  ];
  protected readonly onglet = signal('salle');
  protected readonly salles = signal<Salle[]>([]);
  protected readonly salleId = signal<number | null>(null);
  protected readonly creation = signal(false);
  protected readonly cours = signal<Seance[]>([]);
  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly avis = signal<Avis[]>([]);
  protected readonly stats = signal<StatsSalle | null>(null);
  protected readonly equipements = signal<string[]>([]);
  protected readonly horaires = signal<LigneHoraire[]>([]);
  protected readonly erreurs = signal<Record<string, string>>({});
  protected readonly edition = signal<Seance | null>(null);
  protected nouvelEquipement = '';

  protected readonly salleCourante = computed(() => this.salles().find((s) => s.id === this.salleId()) ?? null);
  protected readonly coursAVenir = computed(() => this.cours().filter((s) => new Date(s.dateDebut) > new Date()));
  protected readonly evenements = computed<EvenementCalendrier[]>(() => this.cours().map((s) => ({
    id: s.id, titre: s.titre, debut: s.dateDebut, fin: s.dateFin, sousTitre: `${s.coach.nom} · ${s.inscrits}/${s.capaciteMax}`,
    etat: (s.statut === 'ANNULEE' ? 'annule' : s.placesRestantes === 0 ? 'complet' : 'ok') as EvenementCalendrier['etat'],
  })));

  protected readonly form = new FormGroup({
    nom: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)] }),
    adresse: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    codePostal: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{4,5}$/)] }),
    ville: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telephone: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[0-9 +().-]{6,20}$/)] }),
    description: new FormControl('', { nonNullable: true }),
    latitude: new FormControl<number | null>(null, [Validators.min(-90), Validators.max(90)]),
    longitude: new FormControl<number | null>(null, [Validators.min(-180), Validators.max(180)]),
  });

  constructor() {
    this.api.get<Salle[]>('/gestion/salles').subscribe({
      next: (s) => { this.salles.set(s); if (s.length) this.choisir(s[0].id); else this.nouvelleSalle(); },
      error: (e) => this.toast.erreur(e),
    });
  }

  protected choisir(id: number): void {
    this.creation.set(false);
    this.salleId.set(id);
    this.chargerSalle();
  }

  protected nouvelleSalle(): void {
    this.creation.set(true);
    this.salleId.set(null);
    this.form.reset({ ville: 'Bruxelles' } as never);
    this.equipements.set([]);
    this.onglet.set('salle');
  }

  chargerSalle(): void {
    const s = this.salleCourante();
    if (!s) return;
    this.form.patchValue({ ...s, telephone: s.telephone ?? '', description: s.description ?? '' });
    this.equipements.set([...s.equipements]);
    this.horaires.set([1, 2, 3, 4, 5, 6, 7].map((j) => {
      const h = s.horaires?.find((x) => x.jourSemaine === j);
      return { jourSemaine: j, heureDebut: h?.heureDebut ?? '09:00', heureFin: h?.heureFin ?? '18:00', ouvert: !!h };
    }));
    this.api.get<Seance[]>(`/gestion/salles/${s.id}/seances`).subscribe((c) => this.cours.set(c));
    this.api.get<Reservation[]>(`/gestion/salles/${s.id}/reservations`).subscribe((r) => this.reservations.set(r));
    this.api.get<Avis[]>(`/gestion/salles/${s.id}/avis`).subscribe((a) => this.avis.set(a));
    this.api.get<StatsSalle>(`/gestion/salles/${s.id}/stats`).subscribe((st) => this.stats.set(st));
  }

  protected ajouterEquipement(): void {
    const e = this.nouvelEquipement.trim();
    if (e && !this.equipements().includes(e)) this.equipements.update((l) => [...l, e]);
    this.nouvelEquipement = '';
  }
  protected retirerEquipement(e: string): void { this.equipements.update((l) => l.filter((x) => x !== e)); }

  protected enregistrer(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const corps = { ...this.form.getRawValue(), equipements: this.equipements() };
    const req = this.creation() ? this.api.post<Salle>('/gestion/salles', corps) : this.api.put<Salle>(`/gestion/salles/${this.salleId()}`, corps);
    req.subscribe({
      next: (s) => {
        this.erreurs.set({});
        this.toast.succes(this.creation() ? 'Salle créée.' : 'Salle enregistrée.');
        this.salles.update((l) => [...l.filter((x) => x.id !== s.id), s]);
        this.choisir(s.id);
      },
      error: (e) => { this.erreurs.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }

  protected enregistrerHoraires(): void {
    const horaires = this.horaires().filter((h) => h.ouvert).map(({ jourSemaine, heureDebut, heureFin }) => ({ jourSemaine, heureDebut, heureFin }));
    this.api.put(`/gestion/salles/${this.salleId()}/horaires`, { horaires }).subscribe({
      next: () => { this.toast.succes('Horaires enregistrés.'); this.api.get<Salle[]>('/gestion/salles').subscribe((s) => { this.salles.set(s); this.chargerSalle(); }); },
      error: (e) => this.toast.erreur(e),
    });
  }

  protected supprimerCours(s: Seance): void {
    const msg = s.inscrits > 0 ? `${s.inscrits} inscrit(s) : le cours sera annulé et ils seront prévenus par email. Continuer ?` : `Supprimer « ${s.titre} » ?`;
    if (!confirm(msg)) return;
    this.api.delete<{ message: string }>(`/gestion/seances/${s.id}`).subscribe({ next: (r) => { this.toast.succes(r.message); this.chargerSalle(); }, error: (e) => this.toast.erreur(e) });
  }

  protected ouvrirDepuisCalendrier(e: EvenementCalendrier): void {
    const s = this.cours().find((x) => x.id === e.id);
    if (s && s.statut !== 'ANNULEE' && new Date(s.dateDebut) > new Date()) this.edition.set(s);
  }
}
