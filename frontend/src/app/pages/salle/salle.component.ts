import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { dateCourte, heure, initiales, prix, teinte } from '../../core/format';
import { JOURS, Salle, Seance } from '../../core/models';
import { ReservationAction } from '../../core/reservation-action.service';
import { ToastService } from '../../core/toast.service';
import { CarteComponent } from '../../shared/carte.component';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';
import { AvisFormComponent } from '../../shared/avis-form.component';

/** Fiche salle : infos, séances par jour + réservation, favoris, horaires, coachs, avis et notes. */
@Component({
  selector: 'app-salle',
  imports: [FormsModule, RouterLink, IconComponent, StarsComponent, CarteComponent, AvisFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (salle(); as s) {
      <div class="conteneur">
        <div class="fiche-banniere anim-apparition" [style.background]="teinte(s.nom)"></div>
        <div class="fiche-entete">
          <div>
            <span class="badge badge-doux">{{ s.activites.join(' · ') || 'Salle de sport' }}</span>
            <h1 style="font-size:36px;margin-top:8px">{{ s.nom }}</h1>
            <p class="meta" style="gap:18px"><span><app-icon nom="pin" [taille]="14" /> {{ s.adresse }}, {{ s.codePostal }} {{ s.ville }}</span>
              <span><app-stars [note]="s.noteMoyenne" /> <strong>{{ s.noteMoyenne ?? '–' }}</strong> · {{ s.nbAvis }} avis</span></p>
          </div>
          <div style="display:flex;gap:10px">
            @if (auth.role() === 'SPORTIF') {
              <button type="button" class="btn btn-contour" [class.anim-pop]="s.estFavori" (click)="basculerFavori(s)">
                <app-icon nom="heart" [taille]="16" [style.color]="s.estFavori ? 'var(--primaire)' : ''" /> {{ s.estFavori ? 'Dans mes favoris' : 'Favori' }}</button>
            }
            @if (s.telephone) { <a class="btn btn-encre" [href]="'tel:' + s.telephone">Contacter</a> }
          </div>
        </div>

        <div class="fiche-grille">
          <div>
            <section class="panneau anim-apparition">
              <h3>À propos</h3>
              <p class="texte-gris">{{ s.description }}</p>
              @if (s.equipements.length) {
                <h4 style="font-size:14px;margin-top:14px">Équipements</h4>
                <div class="onglets">@for (e of s.equipements; track e) { <span class="badge badge-doux">{{ e }}</span> }</div>
              }
            </section>

            <section class="panneau anim-apparition">
              <h3>Prochaines séances</h3>
              <div class="onglets">
                @for (j of joursDisponibles(); track j) {
                  <button type="button" class="chip" [class.actif]="jour() === j" (click)="jour.set(j)">{{ dateCourte(j) }}</button>
                }
              </div>
              @for (se of seancesDuJour(); track se.id) {
                <div class="ligne-seance">
                  <span class="meta"><app-icon nom="clock" [taille]="14" /> <strong style="color:var(--encre)">{{ heure(se.dateDebut) }} – {{ heure(se.dateFin) }}</strong></span>
                  <span><strong>{{ se.titre }}</strong><br /><small class="texte-gris">avec <a [routerLink]="['/coachs', se.coach.id]">{{ se.coach.nom }}</a></small></span>
                  @if (se.placesRestantes > 0) { <span class="badge badge-succes">Places : {{ se.placesRestantes }} / {{ se.capaciteMax }}</span> }
                  @else { <span class="badge badge-danger pulse">Complet</span> }
                  <strong>{{ prix(se.prix) }}</strong>
                  <button type="button" class="btn btn-petit" [class.btn-primaire]="se.placesRestantes > 0" [class.btn-contour]="se.placesRestantes === 0"
                    [disabled]="se.placesRestantes === 0 || resa.enCours() === se.id" (click)="reserver(se)">{{ se.placesRestantes === 0 ? 'Complet' : 'Réserver' }}</button>
                </div>
              } @empty { <p class="vide">Aucune séance programmée.</p> }
            </section>

            <section class="panneau anim-apparition">
              <h3>Avis des sportifs</h3>
              @if (auth.role() === 'SPORTIF') { <app-avis-form [salleId]="s.id" /> }
              @for (a of s.avis ?? []; track a.id) {
                <div class="avis">
                  <span class="avatar" [style.background]="teinte(a.auteur)">{{ initiales(a.auteur) }}</span>
                  <div><strong>{{ a.auteur }}</strong> <small class="texte-gris">{{ dateCourte(a.dateAvis) }}</small><br />
                    <app-stars [note]="a.note" /><p>{{ a.commentaire }}</p></div>
                </div>
              } @empty { <p class="texte-gris">Pas encore d'avis.</p> }
            </section>
          </div>

          <aside>
            <section class="panneau">
              <h3>Localisation</h3>
              <app-carte [points]="[{ id: s.id, nom: s.nom, lat: s.latitude, lng: s.longitude, texte: s.adresse }]" style="--hauteur-carte:200px" />
              <p style="margin-top:10px" [style.color]="ouvertAujourdhui() ? 'var(--succes)' : 'var(--danger)'"><strong>{{ ouvertAujourdhui() ? 'Ouvert aujourd\\'hui · ' + ouvertAujourdhui() : 'Fermé aujourd\\'hui' }}</strong></p>
              <small class="texte-gris">{{ s.telephone }}</small>
            </section>
            <section class="panneau">
              <h3>Horaires d'ouverture</h3>
              <ul class="propre horaires">
                @for (h of s.horaires ?? []; track h.id) { <li><span>{{ jours[h.jourSemaine] }}</span><span>{{ h.heureDebut }} – {{ h.heureFin }}</span></li> }
              </ul>
            </section>
            <section class="panneau">
              <h3>Coachs de la salle</h3>
              @for (c of s.coachs ?? []; track c.id) {
                <a class="coach-ligne" [routerLink]="['/coachs', c.id]">
                  <span class="avatar" [style.background]="teinte(c.nom)">{{ initiales(c.nom) }}</span>
                  <span style="flex:1"><strong>{{ c.nom }}</strong><br /><small class="texte-gris">{{ c.specialite }}</small></span>
                  <span>★ {{ c.noteMoyenne ?? '–' }}</span>
                </a>
              }
            </section>
          </aside>
        </div>
      </div>
    } @else {
      <div class="conteneur" style="padding-top:24px"><div class="squelette"></div></div>
    }`,
})
export class SalleComponent {
  readonly id = input.required<string>(); // paramètre de route (withComponentInputBinding)
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly resa = inject(ReservationAction);
  protected readonly salle = signal<Salle | null>(null);
  protected readonly jour = signal<string>('');
  protected readonly jours = JOURS;
  protected readonly teinte = teinte;
  protected readonly initiales = initiales;
  protected readonly dateCourte = dateCourte;
  protected readonly heure = heure;
  protected readonly prix = prix;

  protected readonly joursDisponibles = computed(() => [...new Set((this.salle()?.seances ?? []).map((s) => s.dateDebut.slice(0, 10)))].slice(0, 7));
  protected readonly seancesDuJour = computed(() => (this.salle()?.seances ?? []).filter((s) => s.dateDebut.startsWith(this.jour())));
  protected readonly ouvertAujourdhui = computed(() => {
    const iso = ((new Date().getDay() + 6) % 7) + 1;
    const h = (this.salle()?.horaires ?? []).find((x) => x.jourSemaine === iso);
    return h ? `${h.heureDebut} – ${h.heureFin}` : '';
  });

  ngOnInit(): void { this.charger(); }

  private charger(): void {
    this.api.get<Salle>(`/salles/${this.id()}`).subscribe({
      next: (s) => { this.salle.set(s); if (!this.joursDisponibles().includes(this.jour())) this.jour.set(this.joursDisponibles()[0] ?? ''); },
      error: (e) => this.toast.erreur(e),
    });
  }

  protected reserver(se: Seance): void { this.resa.reserver(se, () => this.charger()); }

  protected basculerFavori(s: Salle): void {
    const req = s.estFavori ? this.api.delete<{ message: string }>(`/sportif/favoris/${s.id}`) : this.api.post<{ message: string }>(`/sportif/favoris/${s.id}`);
    req.subscribe({ next: (r) => { this.toast.succes(r.message); this.salle.set({ ...s, estFavori: !s.estFavori }); }, error: (e) => this.toast.erreur(e) });
  }
}
