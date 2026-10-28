export type Role = 'SPORTIF' | 'COACH' | 'GESTIONNAIRE' | 'ADMIN';
export type Niveau = 'TOUS' | 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';

export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: Role;
  estVerifie: boolean;
  dateInscription: string;
  coachId: number | null;
}

export interface Activite { id: number; nom: string; categorie: string; total?: number; }

export interface Disponibilite { id: number; jourSemaine: number; jour: string; heureDebut: string; heureFin: string; }

export interface Avis {
  id: number;
  note: number;
  commentaire: string | null;
  dateAvis: string;
  statutModeration: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  auteur: string;
  salle: { id: number; nom: string } | null;
  coach: { id: number; nom: string } | null;
}

export interface Seance {
  id: number;
  titre: string;
  dateDebut: string;
  dateFin: string;
  capaciteMax: number;
  inscrits: number;
  placesRestantes: number;
  prix: number;
  niveau: Niveau;
  statut: 'PLANIFIEE' | 'ANNULEE';
  activite: { id: number; nom: string; categorie: string };
  salle: { id: number; nom: string; ville: string };
  coach: { id: number; nom: string };
}

export interface Coach {
  id: number;
  nom: string;
  prenom: string;
  nomFamille: string;
  specialite: string;
  biographie: string | null;
  tarifHoraire: number;
  ville: string;
  noteMoyenne: number | null;
  nbAvis: number;
  disponibilites?: Disponibilite[];
  avis?: Avis[];
  seances?: Seance[];
  email?: string;
  nbSeances?: number;
}

export interface Salle {
  id: number;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string | null;
  description: string | null;
  equipements: string[];
  latitude: number | null;
  longitude: number | null;
  noteMoyenne: number | null;
  nbAvis: number;
  activites: string[];
  estFavori: boolean;
  horaires?: Disponibilite[];
  avis?: Avis[];
  coachs?: Coach[];
  seances?: Seance[];
  gestionnaire?: string;
  nbSeances?: number;
}

export interface Reservation {
  id: number;
  dateReservation: string;
  statut: 'CONFIRMEE' | 'ANNULEE';
  codeConfirmation: string;
  seance: Seance;
  sportif: { id: number; nom: string; email: string };
}

export interface ResultatRecherche { seances: Seance[]; salles: Salle[]; coachs: Coach[]; }

export interface Accueil {
  stats: { salles: number; coachs: number; seances: number };
  activites: Activite[];
  prochainesSeances: Seance[];
  meilleuresSalles: Salle[];
}

/** Erreur renvoyée par l'API : { message, erreurs: { champ: message } } */
export interface ErreurApi { message: string; erreurs?: Record<string, string>; }

export const LIBELLES_NIVEAU: Record<Niveau, string> = {
  TOUS: 'Tous niveaux', DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé',
};
export const LIBELLES_ROLE: Record<Role, string> = {
  SPORTIF: 'Sportif', COACH: 'Coach', GESTIONNAIRE: 'Gestionnaire de salle', ADMIN: 'Administrateur',
};
export const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
