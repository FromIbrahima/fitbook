import { Routes } from '@angular/router';
import { roleGuard } from './core/guards';

/** Chaque page est chargée à la demande (lazy loading) : le premier chargement reste léger. */
export const routes: Routes = [
  { path: '', title: 'FitBook — Réservez votre sport', loadComponent: () => import('./pages/accueil/accueil.component').then((m) => m.AccueilComponent) },
  { path: 'recherche', title: 'Rechercher — FitBook', loadComponent: () => import('./pages/recherche/recherche.component').then((m) => m.RechercheComponent) },
  { path: 'salles/:id', title: 'Salle — FitBook', loadComponent: () => import('./pages/salle/salle.component').then((m) => m.SalleComponent) },
  { path: 'coachs/:id', title: 'Coach — FitBook', loadComponent: () => import('./pages/coach-fiche/coach-fiche.component').then((m) => m.CoachFicheComponent) },
  { path: 'connexion', title: 'Connexion — FitBook', loadComponent: () => import('./pages/connexion/connexion.component').then((m) => m.ConnexionComponent) },
  { path: 'confirmer-email', title: 'Confirmation — FitBook', loadComponent: () => import('./pages/connexion/confirmer-email.component').then((m) => m.ConfirmerEmailComponent) },
  { path: 'espace-sportif', title: 'Espace sportif — FitBook', canActivate: [roleGuard('SPORTIF')], loadComponent: () => import('./pages/espace-sportif/espace-sportif.component').then((m) => m.EspaceSportifComponent) },
  { path: 'espace-coach', title: 'Espace coach — FitBook', canActivate: [roleGuard('COACH')], loadComponent: () => import('./pages/espace-coach/espace-coach.component').then((m) => m.EspaceCoachComponent) },
  { path: 'espace-salle', title: 'Espace salle — FitBook', canActivate: [roleGuard('GESTIONNAIRE')], loadComponent: () => import('./pages/espace-salle/espace-salle.component').then((m) => m.EspaceSalleComponent) },
  { path: 'administration', title: 'Administration — FitBook', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./pages/administration/administration.component').then((m) => m.AdministrationComponent) },
  { path: '**', title: 'Page introuvable — FitBook', loadComponent: () => import('./pages/introuvable.component').then((m) => m.IntrouvableComponent) },
];
