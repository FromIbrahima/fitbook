import { DestroyRef, afterNextRender, inject } from '@angular/core';

/**
 * Tableaux lisibles sur téléphone.
 * Sur petit écran, le CSS transforme chaque ligne de tableau en « carte » (une valeur par ligne).
 * Pour que chaque valeur garde son titre, on copie le texte de l'en-tête de colonne (<th>)
 * dans un attribut data-label de chaque cellule (<td>) ; le CSS l'affiche avec td::before { content: attr(data-label) }.
 * Un MutationObserver refait l'opération quand Angular ajoute des lignes ou change de page.
 */
export function activerTableauxResponsives(): void {
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    const etiqueter = () => {
      document.querySelectorAll('table').forEach((table) => {
        const titres = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent?.trim() ?? '');
        table.querySelectorAll('tbody tr').forEach((tr) => {
          Array.from(tr.children).forEach((td, i) => {
            const titre = (td as HTMLElement).hasAttribute('colspan') ? '' : titres[i] ?? '';
            if (td.getAttribute('data-label') !== titre) td.setAttribute('data-label', titre);
          });
        });
      });
    };
    let attente = 0;
    const observateur = new MutationObserver(() => { cancelAnimationFrame(attente); attente = requestAnimationFrame(etiqueter); });
    observateur.observe(document.body, { childList: true, subtree: true });
    etiqueter();
    destroyRef.onDestroy(() => observateur.disconnect());
  });
}
