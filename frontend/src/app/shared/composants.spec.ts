import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CalendrierComponent } from './calendrier.component';
import { SeanceCardComponent } from './seance-card.component';
import { StarsComponent } from './stars.component';
import { Seance } from '../core/models';

const SEANCE: Seance = {
  id: 1, titre: 'Vinyasa Flow', dateDebut: '2030-01-07T18:30:00', dateFin: '2030-01-07T19:30:00', capaciteMax: 15, inscrits: 15,
  placesRestantes: 0, prix: 15, niveau: 'TOUS', statut: 'PLANIFIEE', activite: { id: 1, nom: 'Yoga', categorie: 'Bien-être' },
  salle: { id: 1, nom: 'Zen Studio', ville: 'Ixelles' }, coach: { id: 1, nom: 'Yasmina Benali' },
};

describe('Composants partagés', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('CalendrierComponent.lundiDe renvoie le lundi de la semaine', () => {
    expect(CalendrierComponent.lundiDe(new Date(2026, 9, 10)).getDate()).toBe(5); // samedi 10/10 → lundi 5/10
    expect(CalendrierComponent.lundiDe(new Date(2026, 9, 11)).getDate()).toBe(5); // dimanche
    expect(CalendrierComponent.lundiDe(new Date(2026, 9, 12)).getDate()).toBe(12); // lundi
  });

  it('le calendrier affiche un évènement dans la bonne colonne', async () => {
    const f = TestBed.createComponent(CalendrierComponent);
    f.componentRef.setInput('evenements', [{ id: 9, titre: 'Pilates Core', debut: '2030-01-09T12:15:00', fin: '2030-01-09T13:00:00' }]);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.textContent).toContain('Pilates Core');
    expect(el.textContent).toContain('12:15 – 13:00');
  });

  it('StarsComponent colore autant d\'étoiles que la note', () => {
    const f = TestBed.createComponent(StarsComponent);
    f.componentRef.setInput('note', 3.6);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.pleine').length).toBe(4);
  });

  it('une séance complète affiche « Complet » et désactive le bouton', () => {
    const f = TestBed.createComponent(SeanceCardComponent);
    f.componentRef.setInput('seance', SEANCE);
    f.detectChanges();
    const bouton: HTMLButtonElement = f.nativeElement.querySelector('button');
    expect(bouton.disabled).toBe(true);
    expect(f.nativeElement.textContent).toContain('Complet');
  });
});
