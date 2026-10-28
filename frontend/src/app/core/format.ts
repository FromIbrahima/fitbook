/** Petites fonctions d'affichage (dates en français, prix, initiales). */
const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function dateCourte(iso: string): string {
  const d = new Date(iso);
  return `${JOURS_COURTS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}
export function heure(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export function dateHeure(iso: string): string { return `${dateCourte(iso)} · ${heure(iso)}`; }
export function prix(n: number): string { return `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} €`; }
export function initiales(nom: string): string {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]).join('').toUpperCase();
}
/** Couleur pastel stable selon un texte (cartes, avatars) */
export function teinte(texte: string): string {
  const couleurs = ['#FFB38A', '#93C5FD', '#86EFAC', '#FCA5A5', '#C4B5FD', '#FDE68A'];
  let h = 0;
  for (const c of texte) h = (h * 31 + c.charCodeAt(0)) % 997;
  return couleurs[h % couleurs.length];
}
/** valeur pour <input type="datetime-local"> */
export function versInputDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
