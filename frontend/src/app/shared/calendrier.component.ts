import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { IconComponent } from './icon.component';

export interface EvenementCalendrier {
  id: number;
  titre: string;
  debut: string; // ISO
  fin: string;
  sousTitre?: string;
  etat?: 'ok' | 'complet' | 'annule' | 'dispo';
}

const H_DEBUT = 7;
const H_FIN = 22;
const PX_HEURE = 46;
const NOMS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * Calendrier hebdomadaire (fonctionnalité obligatoire) : vue semaine sur grand écran,
 * vue « agenda » en liste sur mobile. Navigation semaine précédente / suivante.
 */
@Component({
  selector: 'app-calendrier',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cal">
      <div class="cal-barre">
        <button type="button" class="btn btn-contour btn-petit" (click)="decaler(-7)" aria-label="Semaine précédente"><app-icon nom="chevronLeft" /></button>
        <strong>{{ titreSemaine() }}</strong>
        <button type="button" class="btn btn-contour btn-petit" (click)="decaler(7)" aria-label="Semaine suivante"><app-icon nom="chevron" /></button>
        <button type="button" class="btn btn-doux btn-petit" (click)="aujourdhui()">Aujourd'hui</button>
      </div>

      <div class="cal-grille" [style.--h]="hauteur + 'px'">
        <div class="cal-heures">
          @for (h of heures; track h) { <span [style.top.px]="(h - hDebut) * pxHeure">{{ h }}h</span> }
        </div>
        @for (j of jours(); track j.cle) {
          <div class="cal-jour" [class.aujourdhui]="j.estAujourdhui">
            <div class="cal-entete">{{ j.nom }} <b>{{ j.date.getDate() }}</b></div>
            <div class="cal-colonne">
              @for (e of j.evenements; track e.id) {
                <button type="button" class="cal-evt etat-{{ e.etat ?? 'ok' }}" [style.top.px]="e.top" [style.height.px]="e.hauteur"
                  (click)="selection.emit(e.source)" [title]="e.source.titre + ' — ' + e.horaire">
                  <strong>{{ e.source.titre }}</strong>
                  <span>{{ e.horaire }}</span>
                  @if (e.source.sousTitre) { <span>{{ e.source.sousTitre }}</span> }
                </button>
              }
            </div>
          </div>
        }
      </div>

      <ul class="cal-agenda">
        @for (j of jours(); track j.cle) {
          @if (j.evenements.length) {
            <li>
              <h4>{{ j.nom }} {{ j.date.getDate() }}/{{ j.date.getMonth() + 1 }}</h4>
              @for (e of j.evenements; track e.id) {
                <button type="button" class="cal-ligne etat-{{ e.etat ?? 'ok' }}" (click)="selection.emit(e.source)">
                  <span>{{ e.horaire }}</span> <strong>{{ e.source.titre }}</strong> <small>{{ e.source.sousTitre }}</small>
                </button>
              }
            </li>
          }
        }
        @if (totalSemaine() === 0) { <li class="vide">Aucun évènement cette semaine.</li> }
      </ul>
    </div>`,
})
export class CalendrierComponent {
  readonly evenements = input<EvenementCalendrier[]>([]);
  readonly selection = output<EvenementCalendrier>();

  protected readonly hDebut = H_DEBUT;
  protected readonly pxHeure = PX_HEURE;
  protected readonly hauteur = (H_FIN - H_DEBUT) * PX_HEURE;
  protected readonly heures = Array.from({ length: H_FIN - H_DEBUT }, (_, i) => H_DEBUT + i);
  protected readonly lundi = signal(CalendrierComponent.lundiDe(new Date()));

  protected readonly jours = computed(() => {
    const evts = this.evenements();
    const auj = new Date().toDateString();
    return NOMS.map((nom, i) => {
      const date = new Date(this.lundi());
      date.setDate(date.getDate() + i);
      const liste = evts
        .filter((e) => new Date(e.debut).toDateString() === date.toDateString())
        .sort((a, b) => a.debut.localeCompare(b.debut))
        .map((e) => {
          const d = new Date(e.debut);
          const f = new Date(e.fin);
          const debutH = Math.max(H_DEBUT, d.getHours() + d.getMinutes() / 60);
          const finH = Math.min(H_FIN, f.getHours() + f.getMinutes() / 60);
          return {
            id: e.id, source: e, etat: e.etat,
            top: (debutH - H_DEBUT) * PX_HEURE,
            hauteur: Math.max(22, (finH - debutH) * PX_HEURE - 2),
            horaire: `${CalendrierComponent.hm(d)} – ${CalendrierComponent.hm(f)}`,
          };
        });
      return { cle: date.toISOString(), nom, date, estAujourdhui: date.toDateString() === auj, evenements: liste };
    });
  });

  private dejaPositionne = false;

  constructor() {
    // au premier chargement : si la semaine en cours est vide, on se place sur la semaine du prochain évènement
    effect(() => {
      const evts = this.evenements();
      if (this.dejaPositionne || evts.length === 0) return;
      this.dejaPositionne = true;
      untracked(() => {
        if (this.totalSemaine() > 0) return;
        const prochain = evts.map((e) => new Date(e.debut)).filter((d) => d >= new Date()).sort((a, b) => +a - +b)[0];
        if (prochain) this.lundi.set(CalendrierComponent.lundiDe(prochain));
      });
    });
  }

  protected readonly totalSemaine = computed(() => this.jours().reduce((n, j) => n + j.evenements.length, 0));

  protected readonly titreSemaine = computed(() => {
    const fin = new Date(this.lundi());
    fin.setDate(fin.getDate() + 6);
    const f = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    return `Semaine du ${f(this.lundi())} au ${f(fin)}/${fin.getFullYear()}`;
  });

  protected decaler(jours: number): void {
    const d = new Date(this.lundi());
    d.setDate(d.getDate() + jours);
    this.lundi.set(d);
  }

  protected aujourdhui(): void { this.lundi.set(CalendrierComponent.lundiDe(new Date())); }

  static lundiDe(d: Date): Date {
    const l = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    l.setDate(l.getDate() - ((l.getDay() + 6) % 7));
    return l;
  }

  static hm(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
