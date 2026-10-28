import { dateCourte, heure, initiales, prix, versInputDate } from './format';

describe('format (affichage en français)', () => {
  it('formate une date courte et une heure', () => {
    expect(dateCourte('2026-10-14T18:30:00')).toBe('mer. 14 oct.');
    expect(heure('2026-10-14T08:05:00')).toBe('08:05');
  });

  it('formate un prix en euros', () => {
    expect(prix(15)).toBe('15 €');
    expect(prix(14.5)).toBe('14,50 €');
  });

  it('calcule les initiales', () => {
    expect(initiales('Yasmina Benali')).toBe('YB');
    expect(initiales('Aïssatou')).toBe('A');
  });

  it('prépare une valeur pour un champ datetime-local', () => {
    expect(versInputDate(new Date(2026, 0, 7, 9, 3))).toBe('2026-01-07T09:03');
  });
});
