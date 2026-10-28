import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { ErreurChampComponent } from './erreur-champ.component';
import { StarsComponent } from './stars.component';

/** Formulaire « Votre note + commentaire » (validé côté Angular ET côté Symfony). */
@Component({
  selector: 'app-avis-form',
  imports: [ReactiveFormsModule, StarsComponent, ErreurChampComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (envoye()) {
      <p class="alerte alerte-succes anim-pop">Merci ! Votre avis sera visible après modération.</p>
    } @else {
      <form [formGroup]="form" (ngSubmit)="envoyer()" style="margin-bottom:10px">
        <div class="champ"><label>Votre note</label>
          <app-stars [editable]="true" [note]="form.controls.note.value" (noteChange)="form.controls.note.setValue($event ?? 0)" />
          <app-erreur-champ [controle]="form.controls.note" [serveur]="erreurs()['note']" /></div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start">
          <div><textarea class="input" formControlName="commentaire" placeholder="Partagez votre expérience (10 caractères minimum)…" aria-label="Commentaire"></textarea>
            <app-erreur-champ [controle]="form.controls.commentaire" [serveur]="erreurs()['commentaire']" /></div>
          <button class="btn btn-primaire" type="submit" [disabled]="envoi()">Publier</button>
        </div>
      </form>
    }`,
})
export class AvisFormComponent {
  readonly salleId = input<number | null>(null);
  readonly coachId = input<number | null>(null);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly envoye = signal(false);
  protected readonly envoi = signal(false);
  protected readonly erreurs = signal<Record<string, string>>({});
  protected readonly form = new FormGroup({
    note: new FormControl(0, { nonNullable: true, validators: [Validators.min(1), Validators.max(5)] }),
    commentaire: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(1000)] }),
  });

  protected envoyer(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.envoi.set(true);
    this.api.post('/sportif/avis', { ...this.form.getRawValue(), salleId: this.salleId(), coachId: this.coachId() }).subscribe({
      next: () => { this.envoye.set(true); this.envoi.set(false); },
      error: (e) => { this.erreurs.set(ToastService.erreursChamps(e)); this.toast.erreur(e); this.envoi.set(false); },
    });
  }
}
