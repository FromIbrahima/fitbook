import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';

type Page = 'faq' | 'contact' | 'conditions' | 'confidentialite';

/** Les 4 pages d'aide du pied de page. « page » arrive de la route (data: { page: 'faq' }) grâce à withComponentInputBinding. */
@Component({
  selector: 'app-aide',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="conteneur page-aide anim-apparition">
      <nav class="aide-onglets" aria-label="Pages d'aide">
        <a routerLink="/faq" [class.actif]="page() === 'faq'">FAQ</a>
        <a routerLink="/contact" [class.actif]="page() === 'contact'">Contact</a>
        <a routerLink="/conditions" [class.actif]="page() === 'conditions'">Conditions</a>
        <a routerLink="/confidentialite" [class.actif]="page() === 'confidentialite'">Confidentialité</a>
      </nav>

      @switch (page()) {
        @case ('faq') {
          <h1>Questions fréquentes</h1>
          <p class="texte-gris">Tout ce qu'il faut savoir pour réserver une séance sur FitBook.</p>
          @for (q of faq; track q.question) {
            <details class="panneau aide-question">
              <summary>{{ q.question }}</summary>
              <p>{{ q.reponse }}</p>
            </details>
          }
          <p class="texte-gris">Vous ne trouvez pas votre réponse ? <a routerLink="/contact" class="lien">Contactez-nous</a>.</p>
        }
        @case ('contact') {
          <h1>Contact</h1>
          <p class="texte-gris">Une question sur une réservation, un compte ou une salle ? Écrivez-nous.</p>
          <div class="grille-cartes">
            <a class="panneau aide-contact" href="mailto:contact@fitbook.be?subject=Question%20FitBook">
              <span class="stat-icone"><app-icon nom="mail" /></span>
              <span><small>Email</small><strong>contact&#64;fitbook.be</strong><small>Réponse sous 48 h ouvrables</small></span>
            </a>
            <a class="panneau aide-contact" href="tel:+3222345678">
              <span class="stat-icone"><app-icon nom="phone" /></span>
              <span><small>Téléphone</small><strong>02 234 56 78</strong><small>Du lundi au vendredi, 9 h – 17 h</small></span>
            </a>
            <div class="panneau aide-contact">
              <span class="stat-icone"><app-icon nom="pin" /></span>
              <span><small>Adresse</small><strong>Rue de la Loi 42</strong><small>1000 Bruxelles</small></span>
            </div>
          </div>
          <section class="panneau">
            <h2>Vous êtes un professionnel ?</h2>
            <p>Coach indépendant ou gérant de salle, créez votre compte pour publier vos séances.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <a class="btn btn-primaire" routerLink="/connexion" [queryParams]="{ mode: 'inscription', role: 'COACH' }">Devenir coach</a>
              <a class="btn btn-encre" routerLink="/connexion" [queryParams]="{ mode: 'inscription', role: 'GESTIONNAIRE' }">Inscrire ma salle</a>
            </div>
          </section>
        }
        @case ('conditions') {
          <h1>Conditions d'utilisation</h1>
          <p class="texte-gris">En vigueur au 6 novembre 2026.</p>
          @for (s of conditions; track s.titre) { <section class="panneau"><h2>{{ s.titre }}</h2><p>{{ s.texte }}</p></section> }
        }
        @case ('confidentialite') {
          <h1>Politique de confidentialité</h1>
          <p class="texte-gris">Comment FitBook utilise et protège vos données personnelles (RGPD).</p>
          @for (s of confidentialite; track s.titre) { <section class="panneau"><h2>{{ s.titre }}</h2><p>{{ s.texte }}</p></section> }
        }
      }
    </div>`,
})
export class AideComponent {
  readonly page = input<Page>('faq');

  protected readonly faq = [
    { question: 'Comment réserver une séance ?', reponse: 'Créez un compte sportif et confirmez votre email, puis cliquez sur « Réserver » sur la carte d\'une séance. La réservation apparaît dans votre espace sportif, avec son code et son QR code, et un email de confirmation vous est envoyé.' },
    { question: 'Puis-je annuler une réservation ?', reponse: 'Oui, depuis « Mes réservations » dans votre espace sportif, tant que la séance n\'a pas commencé. La place est aussitôt rendue disponible pour un autre sportif.' },
    { question: 'Que faire si une séance est complète ?', reponse: 'Le bouton affiche « Complet » : la capacité maximale est atteinte. Revenez plus tard, une place peut se libérer si quelqu\'un annule, ou choisissez une autre date.' },
    { question: 'À quoi sert le QR code ?', reponse: 'Il contient le code de votre réservation. Présentez-le à l\'accueil de la salle pour confirmer votre présence.' },
    { question: 'Comment payer une séance ?', reponse: 'FitBook ne prend pas de paiement en ligne : le prix indiqué sur la séance se règle directement à la salle.' },
    { question: 'Je suis coach ou gérant de salle : comment m\'inscrire ?', reponse: 'Utilisez « Devenir coach » ou « Inscrire ma salle ». Une fois votre email confirmé, vous pouvez créer vos séances, gérer vos horaires et suivre vos réservations.' },
    { question: 'Je n\'ai pas reçu l\'email de confirmation.', reponse: 'Vérifiez vos courriers indésirables. Sans cet email, contactez-nous : l\'administrateur peut valider votre compte.' },
  ];

  protected readonly conditions = [
    { titre: '1. Objet', texte: 'FitBook met en relation des sportifs, des coachs et des salles de sport pour réserver des séances. Ces conditions s\'appliquent à toute personne qui utilise le site.' },
    { titre: '2. Compte', texte: 'La création d\'un compte demande une adresse email valide, confirmée par un lien. Vous êtes responsable de votre mot de passe et des réservations faites avec votre compte.' },
    { titre: '3. Réservations', texte: 'Une réservation est confirmée dans la limite des places disponibles. Un sportif ne peut réserver qu\'une fois la même séance. Elle peut être annulée jusqu\'au début de la séance.' },
    { titre: '4. Séances et salles', texte: 'Les coachs et les gérants sont responsables des informations qu\'ils publient (horaires, prix, capacité). Une séance peut être annulée par son organisateur : les inscrits sont alors prévenus par email.' },
    { titre: '5. Avis', texte: 'Les avis doivent être respectueux et porter sur une expérience réelle. Ils sont publiés après validation par l\'administrateur, qui peut refuser un avis injurieux ou hors sujet.' },
    { titre: '6. Responsabilité', texte: 'FitBook est un projet de fin de formation : le service est fourni tel quel, sans garantie de disponibilité permanente.' },
  ];

  protected readonly confidentialite = [
    { titre: 'Données collectées', texte: 'Nom, prénom, adresse email, téléphone (facultatif), rôle, et pour les coachs : spécialité, ville et tarif. Nous enregistrons aussi vos réservations, vos avis et vos salles favorites.' },
    { titre: 'Pourquoi', texte: 'Uniquement pour faire fonctionner le service : vous connecter, enregistrer et confirmer vos réservations, vous envoyer les emails liés (confirmation, annulation, rappel) et afficher les statistiques aux coachs et aux salles.' },
    { titre: 'Sécurité', texte: 'Les mots de passe sont hachés et ne sont jamais stockés en clair. La connexion utilise un jeton signé valable 8 heures, gardé dans votre navigateur (localStorage) et supprimé à la déconnexion.' },
    { titre: 'Partage', texte: 'Vos données ne sont ni vendues ni partagées. Le coach et la salle d\'une séance voient le nom des sportifs inscrits.' },
    { titre: 'Vos droits', texte: 'Vous pouvez consulter et modifier vos informations dans votre profil. Pour supprimer votre compte ou obtenir une copie de vos données, écrivez à contact@fitbook.be.' },
  ];
}
