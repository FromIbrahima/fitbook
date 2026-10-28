import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { dateCourte, dateHeure } from '../../core/format';
import { Activite, Avis, Coach, LIBELLES_ROLE, Reservation, Role, Salle, Utilisateur } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { EspaceLayoutComponent, ElementMenu } from '../../layout/espace-layout.component';
import { ErreurChampComponent } from '../../shared/erreur-champ.component';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';

interface StatsAdmin { utilisateurs: number; salles: number; coachs: number; seancesAVenir: number; reservations: number; avisEnAttente: number; }

/** Administration : utilisateurs, salles, coachs, activités, réservations, modération des avis et notes. */
@Component({
  selector: 'app-administration',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, EspaceLayoutComponent, IconComponent, StarsComponent, ErreurChampComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-espace-layout libelle="Espace admin" [menu]="menu" [(actif)]="onglet">
      @switch (onglet()) {
        @case ('tableau') {
          <h1>Administration</h1>
          <p class="texte-gris">Vue d'ensemble de la plateforme et modération des contenus.</p>
          <div class="grille-stats">
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="user" /></span><span><small>Utilisateurs</small><strong>{{ stats()?.utilisateurs }}</strong></span></div>
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="home" /></span><span><small>Salles</small><strong>{{ stats()?.salles }}</strong></span></div>
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="list" /></span><span><small>Réservations actives</small><strong>{{ stats()?.reservations }}</strong></span></div>
            <div class="stat anim-apparition"><span class="stat-icone"><app-icon nom="star" /></span><span><small>Avis à modérer</small><strong>{{ stats()?.avisEnAttente }}</strong></span></div>
          </div>
          <section class="panneau">
            <div class="panneau-titre"><h3>Modération des avis</h3>
              <div class="onglets" style="margin:0">
                @for (f of filtresAvis; track f.id) { <button type="button" class="chip" [class.actif]="filtreAvis() === f.id" (click)="filtreAvis.set(f.id)">{{ f.libelle }}</button> }
              </div></div>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Auteur</th><th>Cible</th><th>Note</th><th>Commentaire</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>@for (a of avisFiltres(); track a.id) {
                <tr><td>{{ a.auteur }}</td><td>{{ a.salle ? a.salle.nom : 'Coach ' + a.coach?.nom }}</td><td><app-stars [note]="a.note" /></td><td>{{ a.commentaire }}</td>
                  <td><span class="badge" [class.badge-succes]="a.statutModeration === 'VALIDE'" [class.badge-doux]="a.statutModeration === 'EN_ATTENTE'" [class.badge-danger]="a.statutModeration === 'REJETE'">
                    {{ a.statutModeration === 'VALIDE' ? 'Publié' : a.statutModeration === 'EN_ATTENTE' ? 'En attente' : 'Masqué' }}</span></td>
                  <td class="actions">
                    @if (a.statutModeration !== 'VALIDE') { <button type="button" class="btn btn-doux btn-petit" (click)="moderer(a, 'valider')">Publier</button> }
                    @if (a.statutModeration !== 'REJETE') { <button type="button" class="btn btn-doux btn-petit" (click)="moderer(a, 'rejeter')">Masquer</button> }
                    <button type="button" class="btn-icone danger" (click)="supprimerAvis(a)" aria-label="Supprimer"><app-icon nom="trash" [taille]="16" /></button>
                  </td></tr>
              } @empty { <tr><td colspan="6" class="vide">Rien à afficher.</td></tr> }</tbody>
            </table></div>
          </section>
        }
        @case ('utilisateurs') {
          <h1>Utilisateurs</h1>
          <section class="panneau">
            <div class="panneau-titre"><input class="input" style="max-width:320px" placeholder="Rechercher un nom ou un email" [(ngModel)]="filtreUtilisateur" /></div>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Inscription</th><th>Actions</th></tr></thead>
              <tbody>@for (u of utilisateursFiltres(); track u.id) {
                <tr><td><strong>{{ u.prenom }} {{ u.nom }}</strong></td><td>{{ u.email }}</td>
                  <td><select class="input" style="width:auto;padding:6px 10px" [ngModel]="u.role" (ngModelChange)="changerRole(u, $event)" [disabled]="u.id === auth.utilisateur()?.id" aria-label="Rôle">
                    @for (r of roles; track r) { <option [value]="r">{{ libellesRole[r] }}</option> }</select></td>
                  <td><button type="button" class="badge" style="border:0;cursor:pointer" [class.badge-succes]="u.estVerifie" [class.badge-danger]="!u.estVerifie" (click)="basculerVerifie(u)"
                    title="Cliquer pour changer">{{ u.estVerifie ? 'Vérifié' : 'En attente' }}</button></td>
                  <td>{{ dateCourte(u.dateInscription) }}</td>
                  <td>@if (u.id !== auth.utilisateur()?.id) { <button type="button" class="btn-icone danger" (click)="supprimerUtilisateur(u)" aria-label="Supprimer"><app-icon nom="trash" [taille]="16" /></button> }</td></tr>
              }</tbody>
            </table></div>
          </section>
        }
        @case ('salles') {
          <h1>Salles, coachs et activités</h1>
          <div class="deux-colonnes">
            <section class="panneau">
              <h3>Activités</h3>
              <form [formGroup]="activite" (ngSubmit)="enregistrerActivite()" class="grille-form trois">
                <div class="champ"><label>Nom</label><input class="input" formControlName="nom" /><app-erreur-champ [controle]="activite.controls.nom" [serveur]="erreursActivite()['nom']" /></div>
                <div class="champ"><label>Catégorie</label><input class="input" formControlName="categorie" /><app-erreur-champ [controle]="activite.controls.categorie" [serveur]="erreursActivite()['categorie']" /></div>
                <div class="champ"><label>&nbsp;</label><button class="btn btn-primaire" type="submit">{{ activiteEditee() ? 'Modifier' : 'Ajouter' }}</button></div>
              </form>
              @for (a of activites(); track a.id) {
                <div class="creneau"><span><strong>{{ a.nom }}</strong> <small class="texte-gris">{{ a.categorie }}</small></span>
                  <span class="actions"><button type="button" class="btn-icone" (click)="editerActivite(a)" aria-label="Modifier"><app-icon nom="edit" [taille]="15" /></button>
                  <button type="button" class="btn-icone danger" (click)="supprimerActivite(a)" aria-label="Supprimer"><app-icon nom="trash" [taille]="15" /></button></span></div>
              }
            </section>
            <section class="panneau">
              <h3>Coachs ({{ coachs().length }})</h3>
              @for (c of coachs(); track c.id) {
                <div class="creneau"><span><a [routerLink]="['/coachs', c.id]"><strong>{{ c.nom }}</strong></a><br /><small class="texte-gris">{{ c.specialite }} · {{ c.email }}</small></span>
                  <span>{{ c.nbSeances }} séances · ★ {{ c.noteMoyenne ?? '–' }}</span></div>
              }
            </section>
          </div>
          <section class="panneau">
            <h3>Salles ({{ salles().length }})</h3>
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Salle</th><th>Ville</th><th>Gestionnaire</th><th>Séances</th><th>Note</th><th>Actions</th></tr></thead>
              <tbody>@for (s of salles(); track s.id) {
                <tr><td><a [routerLink]="['/salles', s.id]"><strong>{{ s.nom }}</strong></a></td><td>{{ s.ville }}</td><td>{{ s.gestionnaire }}</td><td>{{ s.nbSeances }}</td><td>★ {{ s.noteMoyenne ?? '–' }}</td>
                  <td><button type="button" class="btn-icone danger" (click)="supprimerSalle(s)" aria-label="Supprimer"><app-icon nom="trash" [taille]="16" /></button></td></tr>
              }</tbody>
            </table></div>
          </section>
        }
        @case ('reservations') {
          <h1>Réservations</h1>
          <section class="panneau">
            <div class="tableau-conteneur"><table>
              <thead><tr><th>Sportif</th><th>Séance</th><th>Salle</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>
              <tbody>@for (r of reservations(); track r.id) {
                <tr><td>{{ r.sportif.nom }}</td><td>{{ r.seance.titre }}</td><td>{{ r.seance.salle.nom }}</td><td>{{ dateHeure(r.seance.dateDebut) }}</td>
                  <td>@if (r.statut === 'CONFIRMEE') { <span class="badge badge-succes">Confirmée</span> } @else { <span class="badge badge-danger">Annulée</span> }</td>
                  <td>@if (r.statut === 'CONFIRMEE' && futur(r)) { <button type="button" class="btn btn-danger btn-petit" (click)="annulerReservation(r)">Annuler</button> }</td></tr>
              }</tbody>
            </table></div>
          </section>
        }
      }
    </app-espace-layout>`,
})
export class AdministrationComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly dateCourte = dateCourte;
  protected readonly dateHeure = dateHeure;
  protected readonly libellesRole = LIBELLES_ROLE;
  protected readonly roles: Role[] = ['SPORTIF', 'COACH', 'GESTIONNAIRE', 'ADMIN'];
  protected readonly menu: ElementMenu[] = [
    { id: 'tableau', libelle: 'Tableau de bord', icone: 'chart' },
    { id: 'utilisateurs', libelle: 'Utilisateurs', icone: 'user' },
    { id: 'salles', libelle: 'Salles et activités', icone: 'home' },
    { id: 'reservations', libelle: 'Réservations', icone: 'list' },
  ];
  protected readonly filtresAvis = [{ id: 'EN_ATTENTE', libelle: 'À modérer' }, { id: 'VALIDE', libelle: 'Publiés' }, { id: 'REJETE', libelle: 'Masqués' }, { id: '', libelle: 'Tous' }];
  protected readonly onglet = signal('tableau');
  protected readonly stats = signal<StatsAdmin | null>(null);
  protected readonly avis = signal<Avis[]>([]);
  protected readonly filtreAvis = signal('EN_ATTENTE');
  protected readonly utilisateurs = signal<Utilisateur[]>([]);
  protected readonly salles = signal<Salle[]>([]);
  protected readonly coachs = signal<Coach[]>([]);
  protected readonly activites = signal<Activite[]>([]);
  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly activiteEditee = signal<Activite | null>(null);
  protected readonly erreursActivite = signal<Record<string, string>>({});
  protected filtreUtilisateur = '';

  protected readonly avisFiltres = computed(() => this.avis().filter((a) => !this.filtreAvis() || a.statutModeration === this.filtreAvis()));
  protected utilisateursFiltres(): Utilisateur[] {
    const f = this.filtreUtilisateur.toLowerCase();
    return this.utilisateurs().filter((u) => !f || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(f));
  }

  protected readonly activite = new FormGroup({
    nom: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    categorie: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() { this.charger(); }

  private charger(): void {
    this.api.get<StatsAdmin>('/admin/stats').subscribe({ next: (s) => this.stats.set(s), error: (e) => this.toast.erreur(e) });
    this.api.get<Avis[]>('/admin/avis').subscribe((a) => this.avis.set(a));
    this.api.get<Utilisateur[]>('/admin/utilisateurs').subscribe((u) => this.utilisateurs.set(u));
    this.api.get<Salle[]>('/admin/salles').subscribe((s) => this.salles.set(s));
    this.api.get<Coach[]>('/admin/coachs').subscribe((c) => this.coachs.set(c));
    this.api.get<Activite[]>('/admin/activites').subscribe((a) => this.activites.set(a));
    this.api.get<Reservation[]>('/admin/reservations').subscribe((r) => this.reservations.set(r));
  }

  private action(req: ReturnType<ApiService['post']>, ok: string): void {
    req.subscribe({ next: () => { this.toast.succes(ok); this.charger(); }, error: (e) => { this.toast.erreur(e); this.charger(); } });
  }

  protected moderer(a: Avis, action: 'valider' | 'rejeter'): void {
    this.action(this.api.post(`/admin/avis/${a.id}/${action}`), action === 'valider' ? 'Avis publié.' : 'Avis masqué.');
  }
  protected supprimerAvis(a: Avis): void { if (confirm('Supprimer définitivement cet avis ?')) this.action(this.api.delete(`/admin/avis/${a.id}`), 'Avis supprimé.'); }
  protected changerRole(u: Utilisateur, role: Role): void { this.action(this.api.put(`/admin/utilisateurs/${u.id}`, { role }), `Rôle de ${u.prenom} : ${this.libellesRole[role]}.`); }
  protected basculerVerifie(u: Utilisateur): void { this.action(this.api.put(`/admin/utilisateurs/${u.id}`, { estVerifie: !u.estVerifie }), 'Statut modifié.'); }
  protected supprimerUtilisateur(u: Utilisateur): void { if (confirm(`Supprimer le compte de ${u.prenom} ${u.nom} ?`)) this.action(this.api.delete(`/admin/utilisateurs/${u.id}`), 'Utilisateur supprimé.'); }
  protected supprimerSalle(s: Salle): void { if (confirm(`Supprimer la salle ${s.nom} ?`)) this.action(this.api.delete(`/admin/salles/${s.id}`), 'Salle supprimée.'); }
  protected annulerReservation(r: Reservation): void { if (confirm('Annuler cette réservation ?')) this.action(this.api.post(`/admin/reservations/${r.id}/annuler`), 'Réservation annulée.'); }
  protected futur(r: Reservation): boolean { return new Date(r.seance.dateDebut) > new Date(); }

  protected editerActivite(a: Activite): void { this.activiteEditee.set(a); this.activite.setValue({ nom: a.nom, categorie: a.categorie }); }
  protected enregistrerActivite(): void {
    this.activite.markAllAsTouched();
    if (this.activite.invalid) return;
    const a = this.activiteEditee();
    const req = a ? this.api.put(`/admin/activites/${a.id}`, this.activite.getRawValue()) : this.api.post('/admin/activites', this.activite.getRawValue());
    req.subscribe({
      next: () => { this.toast.succes(a ? 'Activité modifiée.' : 'Activité ajoutée.'); this.activite.reset(); this.activiteEditee.set(null); this.erreursActivite.set({}); this.charger(); },
      error: (e) => { this.erreursActivite.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }
  protected supprimerActivite(a: Activite): void { if (confirm(`Supprimer l'activité ${a.nom} ?`)) this.action(this.api.delete(`/admin/activites/${a.id}`), 'Activité supprimée.'); }
}
