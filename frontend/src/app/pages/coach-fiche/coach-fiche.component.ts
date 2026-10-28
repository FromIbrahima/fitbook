import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { dateCourte, dateHeure, initiales, prix, teinte } from '../../core/format';
import { Coach, Seance } from '../../core/models';
import { ReservationAction } from '../../core/reservation-action.service';
import { ToastService } from '../../core/toast.service';
import { AvisFormComponent } from '../../shared/avis-form.component';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';

@Component({
  selector: 'app-coach-fiche',
  imports: [RouterLink, IconComponent, StarsComponent, AvisFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (coach(); as c) {
      <div class="conteneur" style="padding-top:28px">
        <div class="fiche-grille">
          <div>
            <section class="panneau anim-apparition" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
              <span class="avatar-grand anim-pop" style="width:90px;height:90px;font-size:28px" [style.background]="teinte(c.nom)">{{ initiales(c.nom) }}</span>
              <div>
                <span class="badge badge-doux">Coach</span>
                <h1 style="font-size:32px;margin-top:6px">{{ c.nom }}</h1>
                <p class="meta"><app-icon nom="pin" [taille]="14" /> {{ c.ville }} · {{ c.specialite }} · {{ c.tarifHoraire }} €/h</p>
                <p class="meta"><app-stars [note]="c.noteMoyenne" /> <strong>{{ c.noteMoyenne ?? '–' }}</strong> ({{ c.nbAvis }} avis)</p>
              </div>
            </section>
            <section class="panneau"><h3>Biographie</h3><p class="texte-gris">{{ c.biographie }}</p></section>
            <section class="panneau">
              <h3>Prochaines séances</h3>
              @for (s of c.seances ?? []; track s.id) {
                <div class="ligne-seance">
                  <span class="meta"><app-icon nom="cal" [taille]="14" /> {{ dateHeure(s.dateDebut) }}</span>
                  <span><strong>{{ s.titre }}</strong><br /><small><a [routerLink]="['/salles', s.salle.id]">{{ s.salle.nom }}</a></small></span>
                  @if (s.placesRestantes > 0) { <span class="badge badge-succes">{{ s.placesRestantes }} places</span> } @else { <span class="badge badge-danger">Complet</span> }
                  <strong>{{ prix(s.prix) }}</strong>
                  <button type="button" class="btn btn-primaire btn-petit" [disabled]="s.placesRestantes === 0" (click)="reserver(s)">Réserver</button>
                </div>
              } @empty { <p class="vide">Aucune séance à venir.</p> }
            </section>
            <section class="panneau">
              <h3>Avis</h3>
              @if (auth.role() === 'SPORTIF') { <app-avis-form [coachId]="c.id" /> }
              @for (a of c.avis ?? []; track a.id) {
                <div class="avis"><span class="avatar" [style.background]="teinte(a.auteur)">{{ initiales(a.auteur) }}</span>
                  <div><strong>{{ a.auteur }}</strong> <small class="texte-gris">{{ dateCourte(a.dateAvis) }}</small><br /><app-stars [note]="a.note" /><p>{{ a.commentaire }}</p></div></div>
              } @empty { <p class="texte-gris">Pas encore d'avis.</p> }
            </section>
          </div>
          <aside class="panneau">
            <h3>Disponibilités</h3>
            @for (d of c.disponibilites ?? []; track d.id) {
              <div class="creneau"><strong>{{ d.jour }}</strong><span class="meta"><app-icon nom="clock" [taille]="14" /> {{ d.heureDebut }} – {{ d.heureFin }}</span></div>
            } @empty { <p class="texte-gris">Non renseignées.</p> }
          </aside>
        </div>
      </div>
    } @else { <div class="conteneur" style="padding-top:24px"><div class="squelette"></div></div> }`,
})
export class CoachFicheComponent {
  readonly id = input.required<string>();
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  private readonly resa = inject(ReservationAction);
  protected readonly coach = signal<Coach | null>(null);
  protected readonly teinte = teinte;
  protected readonly initiales = initiales;
  protected readonly dateHeure = dateHeure;
  protected readonly dateCourte = dateCourte;
  protected readonly prix = prix;

  ngOnInit(): void { this.charger(); }
  private charger(): void { this.api.get<Coach>(`/coachs/${this.id()}`).subscribe({ next: (c) => this.coach.set(c), error: (e) => this.toast.erreur(e) }); }
  protected reserver(s: Seance): void { this.resa.reserver(s, () => this.charger()); }
}
