<?php

namespace App\Service;

use App\Entity\Reservation;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Enum\StatutReservation;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

/** Notifications email : confirmation d'inscription et événements de réservation. */
class Notifier
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly string $frontendUrl,
        private readonly string $mailerFrom,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    public function confirmationInscription(Utilisateur $u): void
    {
        $lien = $this->frontendUrl.'/confirmer-email?token='.urlencode((string) $u->getTokenConfirmation());
        $this->envoyer($u, 'Confirmez votre adresse email', sprintf(
            '<p>Bonjour %s,</p><p>Bienvenue sur FitBook ! Cliquez sur le lien ci-dessous pour activer votre compte :</p><p><a href="%s">Confirmer mon email</a></p><p>Si vous n\'êtes pas à l\'origine de cette inscription, ignorez ce message.</p>',
            htmlspecialchars($u->getPrenom()), $lien
        ));
    }

    public function reservationConfirmee(Reservation $r): void
    {
        $s = $r->getSeance();
        $this->envoyer($r->getUtilisateur(), 'Réservation confirmée : '.$s->getTitre(), sprintf(
            '<p>Bonjour %s,</p><p>Votre réservation pour <strong>%s</strong> le %s à %s (%s) est confirmée.</p><p>Code de confirmation : <strong>%s</strong> (présentez le QR code dans votre espace).</p>',
            htmlspecialchars($r->getUtilisateur()->getPrenom()), htmlspecialchars($s->getTitre()),
            $s->getDateDebut()->format('d/m/Y'), $s->getDateDebut()->format('H:i'), htmlspecialchars($s->getSalle()->getNom()), $r->getCodeConfirmation()
        ));
    }

    public function reservationAnnulee(Reservation $r): void
    {
        $s = $r->getSeance();
        $this->envoyer($r->getUtilisateur(), 'Réservation annulée : '.$s->getTitre(), sprintf(
            '<p>Bonjour %s,</p><p>Votre réservation pour <strong>%s</strong> du %s a bien été annulée.</p>',
            htmlspecialchars($r->getUtilisateur()->getPrenom()), htmlspecialchars($s->getTitre()), $s->getDateDebut()->format('d/m/Y H:i')
        ));
    }

    /** Prévient tous les inscrits quand le coach / la salle annule la séance. */
    public function seanceAnnulee(Seance $s): int
    {
        $n = 0;
        foreach ($s->getReservations() as $r) {
            $this->envoyer($r->getUtilisateur(), 'Séance annulée : '.$s->getTitre(), sprintf(
                '<p>Bonjour %s,</p><p>La séance <strong>%s</strong> prévue le %s a été annulée par l\'organisateur. Votre réservation est annulée automatiquement.</p>',
                htmlspecialchars($r->getUtilisateur()->getPrenom()), htmlspecialchars($s->getTitre()), $s->getDateDebut()->format('d/m/Y H:i')
            ));
            ++$n;
        }

        return $n;
    }

    /** Bonus : rappel envoyé la veille de la séance (commande app:rappels-seances). */
    public function rappelSeance(Seance $s): int
    {
        $n = 0;
        foreach ($s->getReservations() as $r) {
            if ($r->getStatut() !== StatutReservation::CONFIRMEE) {
                continue;
            }
            $this->envoyer($r->getUtilisateur(), 'Rappel : '.$s->getTitre().' demain', sprintf(
                '<p>Bonjour %s,</p><p>Petit rappel : <strong>%s</strong> le %s à %s, %s, %s.</p><p>Bonne séance !</p>',
                htmlspecialchars($r->getUtilisateur()->getPrenom()), htmlspecialchars($s->getTitre()), $s->getDateDebut()->format('d/m/Y'),
                $s->getDateDebut()->format('H:i'), htmlspecialchars($s->getSalle()->getNom()), htmlspecialchars($s->getSalle()->getAdresse())
            ));
            ++$n;
        }

        return $n;
    }

    private function envoyer(Utilisateur $destinataire, string $sujet, string $html): void
    {
        $email = (new Email())
            ->from(new Address($this->mailerFrom, 'FitBook'))
            ->to(new Address($destinataire->getEmail(), $destinataire->getNomComplet()))
            ->subject('[FitBook] '.$sujet)
            ->html($html.'<p style="color:#64748B">— L\'équipe FitBook</p>')
            ->text(strip_tags($html));
        try {
            $this->mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            // un serveur mail indisponible ne doit pas bloquer la réservation
            $this->logger?->error('Email non envoyé : '.$e->getMessage());
        }
    }
}
