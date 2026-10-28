import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AccueilComponent } from './accueil.component';
import { authInterceptor } from '../../core/auth.interceptor';
import { ToastService } from '../../core/toast.service';
import { environment } from '../../../environments/environment';

/**
 * Tests d'INTÉGRATION : la page d'accueil + le service API + l'intercepteur + HttpClient,
 * avec une API simulée (HttpTestingController) à la place du serveur Symfony.
 */
describe('Page d\'accueil (intégration avec l\'API simulée)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('affiche les chiffres, les villes et les séances renvoyés par l\'API', async () => {
    const f = TestBed.createComponent(AccueilComponent);
    f.detectChanges();
    http.expectOne(environment.apiUrl + '/villes').flush(['Ixelles', 'Uccle']);
    http.expectOne(environment.apiUrl + '/accueil').flush({
      stats: { salles: 5, coachs: 4, seances: 34 },
      activites: [{ id: 1, nom: 'Yoga', categorie: 'Bien-être', nbSeances: 12 }],
      prochainesSeances: [{
        id: 3, titre: 'Pilates Core', dateDebut: '2030-01-07T12:15:00', dateFin: '2030-01-07T13:00:00', capaciteMax: 12, inscrits: 4,
        placesRestantes: 8, prix: 16, niveau: 'TOUS', statut: 'PLANIFIEE', activite: { id: 2, nom: 'Pilates', categorie: 'Bien-être' },
        salle: { id: 2, nom: 'Move Center', ville: 'Uccle' }, coach: { id: 3, nom: 'Ngozi Okafor' },
      }],
      meilleuresSalles: [],
    });
    f.detectChanges();
    await f.whenStable();
    const texte = (f.nativeElement as HTMLElement).textContent ?? '';
    expect(texte).toContain('34');
    expect(texte).toContain('Pilates Core');
    expect(texte).toContain('8 places restantes');
    expect((f.nativeElement as HTMLElement).querySelectorAll('select option').length).toBe(3); // « Toutes les villes » + 2 villes
  });

  it('si l\'API ne répond pas, la page reste utilisable (chiffres à 0)', async () => {
    const f = TestBed.createComponent(AccueilComponent);
    f.detectChanges();
    http.expectOne(environment.apiUrl + '/villes').flush([]);
    http.expectOne(environment.apiUrl + '/accueil').error(new ProgressEvent('error'), { status: 0 });
    f.detectChanges();
    await f.whenStable();
    expect((f.nativeElement as HTMLElement).textContent).toContain('0');
  });

  it('le message d\'erreur explique comment relancer le backend quand l\'API est injoignable', () => {
    expect(ToastService.message(new HttpErrorResponse({ status: 0 }))).toContain('php -S 127.0.0.1:8000');
    expect(ToastService.message(new HttpErrorResponse({ status: 409, error: { message: 'Désolé, cette séance est complète.' } }))).toBe('Désolé, cette séance est complète.');
  });
});
