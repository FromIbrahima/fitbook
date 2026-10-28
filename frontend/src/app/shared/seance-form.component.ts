import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { versInputDate } from '../core/format';
import { Activite, Coach, LIBELLES_NIVEAU, Niveau, Salle, Seance } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ErreurChampComponent } from './erreur-champ.component';

function ordreDates(g: AbstractControl): ValidationErrors | null {
  const d = g.get('dateDebut')?.value;
  const f = g.get('dateFin')?.value;
  return d && f && f <= d ? { ordreDates: true } : null;
}

/**
 * Formulaire de séance (coach) / de cours (gestionnaire).
 * Les données envoyées sont validées côté serveur par le JSON Schema config/json_schema/seance.schema.json.
 */
@Component({
  selector: 'app-seance-form',
  imports: [ReactiveFormsModule, ErreurChampComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <form [formGroup]="form" (ngSubmit)="envoyer()" novalidate>
      <div class="champ"><label>Titre</label><input class="input" formControlName="titre" placeholder="ex : Vinyasa Flow" />
        <app-erreur-champ [controle]="form.controls.titre" [serveur]="erreurs()['titre']" /></div>
      <div class="grille-form deux">
        <div class="champ"><label>Activité</label>
          <select class="input" formControlName="activiteId">
            @for (a of activites(); track a.id) { <option [ngValue]="a.id">{{ a.nom }}</option> }
          </select><app-erreur-champ [controle]="form.controls.activiteId" [serveur]="erreurs()['activiteId']" /></div>
        <div class="champ"><label>Niveau</label>
          <select class="input" formControlName="niveau">
            @for (n of niveaux; track n) { <option [value]="n">{{ libelles[n] }}</option> }
          </select><app-erreur-champ [serveur]="erreurs()['niveau']" /></div>
      </div>
      <div class="grille-form deux">
        <div class="champ"><label>Salle</label>
          <select class="input" formControlName="salleId">
            @for (s of salles(); track s.id) { <option [ngValue]="s.id">{{ s.nom }} ({{ s.ville }})</option> }
          </select><app-erreur-champ [controle]="form.controls.salleId" [serveur]="erreurs()['salleId']" /></div>
        @if (modeGestion()) {
          <div class="champ"><label>Coach</label>
            <select class="input" formControlName="coachId">
              @for (c of coachs(); track c.id) { <option [ngValue]="c.id">{{ c.nom }} — {{ c.specialite }}</option> }
            </select><app-erreur-champ [serveur]="erreurs()['coachId']" /></div>
        }
      </div>
      <div class="grille-form deux">
        <div class="champ"><label>Début</label><input class="input" type="datetime-local" formControlName="dateDebut" />
          <app-erreur-champ [controle]="form.controls.dateDebut" [serveur]="erreurs()['dateDebut']" /></div>
        <div class="champ"><label>Fin</label><input class="input" type="datetime-local" formControlName="dateFin" />
          <app-erreur-champ [controle]="form.controls.dateFin" [serveur]="erreurs()['dateFin']" />
          @if (form.errors?.['ordreDates'] && form.controls.dateFin.touched) { <small class="erreur-champ">La fin doit être après le début.</small> }</div>
      </div>
      <div class="grille-form trois">
        <div class="champ"><label>Capacité</label><input class="input" type="number" formControlName="capaciteMax" min="1" max="500" />
          <app-erreur-champ [controle]="form.controls.capaciteMax" [serveur]="erreurs()['capaciteMax']" /></div>
        <div class="champ"><label>Prix (€)</label><input class="input" type="number" formControlName="prix" min="0" step="0.5" />
          <app-erreur-champ [controle]="form.controls.prix" [serveur]="erreurs()['prix']" /></div>
        <div class="champ"><label>&nbsp;</label><button class="btn btn-primaire" type="submit" [disabled]="envoi()">{{ seance() ? 'Modifier' : 'Enregistrer' }}</button></div>
      </div>
      @if (erreurs()['global']) { <p class="alerte alerte-erreur">{{ erreurs()['global'] }}</p> }
    </form>`,
})
export class SeanceFormComponent implements OnInit {
  /** null = création */
  readonly seance = input<Seance | null>(null);
  readonly modeGestion = input(false);
  readonly sallesImposees = input<Salle[] | null>(null);
  readonly enregistre = output<Seance>();

  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly activites = signal<Activite[]>([]);
  protected readonly salles = signal<Salle[]>([]);
  protected readonly coachs = signal<Coach[]>([]);
  protected readonly envoi = signal(false);
  protected readonly erreurs = signal<Record<string, string>>({});
  protected readonly niveaux: Niveau[] = ['TOUS', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  protected readonly libelles = LIBELLES_NIVEAU;

  protected readonly form = new FormGroup({
    titre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)] }),
    activiteId: new FormControl<number | null>(null, [Validators.required]),
    salleId: new FormControl<number | null>(null, [Validators.required]),
    coachId: new FormControl<number | null>(null),
    niveau: new FormControl<Niveau>('TOUS', { nonNullable: true }),
    dateDebut: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateFin: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    capaciteMax: new FormControl(15, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(500)] }),
    prix: new FormControl(15, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(1000)] }),
  }, { validators: ordreDates });

  ngOnInit(): void {
    this.api.get<Activite[]>('/activites').subscribe((a) => { this.activites.set(a); if (!this.form.value.activiteId) this.form.controls.activiteId.setValue(a[0]?.id ?? null); });
    const imposees = this.sallesImposees();
    if (imposees) this.definirSalles(imposees);
    else this.api.get<Salle[]>('/salles').subscribe((s) => this.definirSalles(s));
    if (this.modeGestion()) {
      this.api.get<Coach[]>('/gestion/coachs').subscribe((c) => { this.coachs.set(c); if (!this.form.value.coachId) this.form.controls.coachId.setValue(c[0]?.id ?? null); });
    }
    const s = this.seance();
    if (s) {
      this.form.patchValue({ titre: s.titre, activiteId: s.activite.id, salleId: s.salle.id, coachId: s.coach.id, niveau: s.niveau,
        dateDebut: s.dateDebut.slice(0, 16), dateFin: s.dateFin.slice(0, 16), capaciteMax: s.capaciteMax, prix: s.prix });
    } else {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(18, 0, 0, 0);
      const f = new Date(d); f.setHours(19);
      this.form.patchValue({ dateDebut: versInputDate(d), dateFin: versInputDate(f) });
    }
  }

  private definirSalles(s: Salle[]): void {
    this.salles.set(s);
    if (!this.form.value.salleId) this.form.controls.salleId.setValue(s[0]?.id ?? null);
  }

  protected envoyer(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const corps: Record<string, unknown> = { ...v, prix: Number(v.prix), capaciteMax: Number(v.capaciteMax) };
    if (!this.modeGestion()) delete corps['coachId'];
    const s = this.seance();
    const url = (this.modeGestion() ? '/gestion/seances' : '/coach/seances') + (s ? `/${s.id}` : '');
    this.envoi.set(true);
    (s ? this.api.put<{ message: string; seance: Seance }>(url, corps) : this.api.post<{ message: string; seance: Seance }>(url, corps)).subscribe({
      next: (r) => { this.envoi.set(false); this.erreurs.set({}); this.toast.succes(r.message); this.enregistre.emit(r.seance); },
      error: (e) => { this.envoi.set(false); this.erreurs.set(ToastService.erreursChamps(e)); this.toast.erreur(e); },
    });
  }
}
