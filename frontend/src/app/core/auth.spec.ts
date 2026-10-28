import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { roleGuard } from './guards';
import { motDePasseFort } from '../pages/connexion/connexion.component';
import { environment } from '../../environments/environment';

const UTILISATEUR = { id: 7, email: 'tom@fitbook.be', nom: 'Vermeulen', prenom: 'Tom', telephone: null, role: 'SPORTIF' as const, estVerifie: true, dateInscription: '', coachId: null };

describe('Authentification (frontend)', () => {
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => http.verify());

  it('connexion : enregistre le jeton et l\'utilisateur', () => {
    auth.connexion('tom@fitbook.be', 'FitBook2026!').subscribe();
    const req = http.expectOne(environment.apiUrl + '/auth/connexion');
    expect(req.request.body).toEqual({ email: 'tom@fitbook.be', motDePasse: 'FitBook2026!' });
    req.flush({ token: 'abc.def', expireDans: 3600, utilisateur: UTILISATEUR });

    expect(auth.estConnecte()).toBe(true);
    expect(auth.role()).toBe('SPORTIF');
    expect(auth.initiales()).toBe('TV');
    expect(auth.espace()).toBe('/espace-sportif');
    expect(JSON.parse(localStorage.getItem('fitbook.session')!).token).toBe('abc.def');
  });

  it('l\'intercepteur ajoute « Authorization: Bearer » et déconnecte sur 401', () => {
    auth.connexion('tom@fitbook.be', 'x').subscribe();
    http.expectOne(environment.apiUrl + '/auth/connexion').flush({ token: 'jeton-123', expireDans: 3600, utilisateur: UTILISATEUR });

    let erreurRecue = false;
    TestBed.inject(HttpClient).get(environment.apiUrl + '/me').subscribe({ error: () => (erreurRecue = true) });
    const req = http.expectOne(environment.apiUrl + '/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jeton-123');
    req.flush({ message: 'expiré' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.estConnecte()).toBe(false);
    expect(erreurRecue).toBe(false); // pas de message d'erreur en double : on est simplement renvoyé à la connexion
  });

  it('n\'envoie jamais un ancien jeton pendant la connexion', () => {
    localStorage.setItem('fitbook.session', JSON.stringify({ token: 'ancien.jeton', utilisateur: UTILISATEUR, expireLe: Date.now() + 3600_000 }));
    TestBed.inject(AuthService).connexion('tom@fitbook.be', 'FitBook2026!').subscribe();
    const req = http.expectOne(environment.apiUrl + '/auth/connexion');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'nouveau', expireDans: 3600, utilisateur: UTILISATEUR });
  });

  it('roleGuard : visiteur → connexion, mauvais rôle → son espace, bon rôle → accès', () => {
    const router = TestBed.inject(Router);
    const garde = (role: 'COACH' | 'SPORTIF') => TestBed.runInInjectionContext(() => roleGuard(role)({} as never, { url: '/x' } as never));

    expect(router.serializeUrl(garde('COACH') as UrlTree)).toBe('/connexion?retour=%2Fx');

    auth.connexion('tom@fitbook.be', 'x').subscribe();
    http.expectOne(environment.apiUrl + '/auth/connexion').flush({ token: 't', expireDans: 3600, utilisateur: UTILISATEUR });
    expect(router.serializeUrl(garde('COACH') as UrlTree)).toBe('/espace-sportif');
    expect(garde('SPORTIF')).toBe(true);
  });

  it('valide la robustesse du mot de passe comme le backend', () => {
    expect(motDePasseFort(new FormControl('faible'))).toEqual({ motDePasse: true });
    expect(motDePasseFort(new FormControl('sansmajuscule1'))).toEqual({ motDePasse: true });
    expect(motDePasseFort(new FormControl('FitBook2026!'))).toBeNull();
  });
});
