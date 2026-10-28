<?php

namespace App\DataFixtures;

use App\Entity\Activite;
use App\Entity\Avis;
use App\Entity\Coach;
use App\Entity\Disponibilite;
use App\Entity\Reservation;
use App\Entity\Salle;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Enum\Niveau;
use App\Enum\Role;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Données de démonstration (Bruxelles) — php bin/console doctrine:fixtures:load
 * Mot de passe de TOUS les comptes : FitBook2026!
 */
class AppFixtures extends Fixture
{
    public const MOT_DE_PASSE = 'FitBook2026!';

    private ?string $hash = null;

    public function __construct(private readonly UserPasswordHasherInterface $hasher)
    {
    }

    public function load(ObjectManager $om): void
    {
        // ---------- activités ----------
        $act = [];
        foreach ([['Yoga', 'Bien-être'], ['Pilates', 'Bien-être'], ['Méditation', 'Bien-être'], ['CrossFit', 'Cardio & force'],
                  ['Boxe', 'Sports de combat'], ['Musculation', 'Cardio & force'], ['Running', 'Cardio & force']] as [$nom, $cat]) {
            $act[$nom] = (new Activite())->setNom($nom)->setCategorie($cat);
            $om->persist($act[$nom]);
        }

        // ---------- utilisateurs ----------
        $admin = $this->user($om, 'admin@fitbook.be', 'Admin', 'FitBook', Role::ADMIN);
        $mamadou = $this->user($om, 'mamadou.barry@fitbook.be', 'Barry', 'Mamadou', Role::GESTIONNAIRE, '0470 12 34 56');
        $claire = $this->user($om, 'claire.dubois@fitbook.be', 'Dubois', 'Claire', Role::GESTIONNAIRE, '0471 22 33 44');

        $coachs = [];
        foreach ([
            ['yasmina.benali@fitbook.be', 'Benali', 'Yasmina', 'Yoga · Méditation', 'Ixelles', 45, 'Professeure de yoga certifiée RYT-500, 10 ans d\'expérience. Vinyasa, Hatha et méditation guidée.'],
            ['ngozi.okafor@fitbook.be', 'Okafor', 'Ngozi', 'Pilates', 'Uccle', 40, 'Pilates matwork et reformer, renforcement profond et posture.'],
            ['lucas.janssens@fitbook.be', 'Janssens', 'Lucas', 'Yin Yoga', 'Etterbeek', 35, 'Yin yoga et mobilité, idéal pour récupérer après le sport.'],
            ['karim.elamrani@fitbook.be', 'El Amrani', 'Karim', 'Boxe anglaise', 'Saint-Gilles', 50, 'Ancien boxeur amateur, cours techniques et cardio-boxe tous niveaux.'],
            ['sofie.peeters@fitbook.be', 'Peeters', 'Sofie', 'CrossFit · Musculation', 'Laeken', 55, 'Coach CrossFit L2, préparation physique et haltérophilie.'],
        ] as [$email, $nom, $prenom, $spec, $ville, $tarif, $bio]) {
            $u = $this->user($om, $email, $nom, $prenom, Role::COACH);
            $c = (new Coach())->setSpecialite($spec)->setVille($ville)->setTarifHoraire($tarif)->setBiographie($bio);
            $u->setCoach($c);
            $coachs[$prenom] = $c;
        }
        // disponibilités hebdomadaires des coachs
        foreach ([['Yasmina', [[1, '17:00', '21:00'], [2, '07:00', '10:00'], [3, '17:00', '21:00'], [4, '18:00', '21:00'], [6, '09:00', '12:00']]],
                  ['Ngozi', [[1, '12:00', '14:00'], [3, '12:00', '14:00'], [5, '12:00', '14:00']]],
                  ['Lucas', [[2, '19:00', '21:30'], [5, '19:00', '21:30'], [7, '10:00', '12:00']]],
                  ['Karim', [[1, '18:00', '22:00'], [3, '18:00', '22:00'], [6, '10:00', '13:00']]],
                  ['Sofie', [[1, '07:00', '09:00'], [2, '07:00', '09:00'], [4, '07:00', '09:00'], [6, '09:00', '12:00']]]] as [$p, $creneaux]) {
            foreach ($creneaux as [$j, $d, $f]) {
                $coachs[$p]->ajouterDisponibilite(new Disponibilite($j, $d, $f));
            }
        }

        $sportifs = [];
        foreach ([['aissatou.bah@fitbook.be', 'Bah', 'Aïssatou'], ['cheikh.fall@fitbook.be', 'Fall', 'Cheikh'], ['elise.petit@fitbook.be', 'Petit', 'Élise'],
                  ['kofi.mensah@fitbook.be', 'Mensah', 'Kofi'], ['ines.martin@fitbook.be', 'Martin', 'Inès'], ['tom.vermeulen@fitbook.be', 'Vermeulen', 'Tom']] as [$e, $n, $p]) {
            $sportifs[$p] = $this->user($om, $e, $n, $p, Role::SPORTIF);
        }
        // compte non confirmé (pour montrer le blocage de connexion)
        $this->user($om, 'nouveau@fitbook.be', 'Nouveau', 'Compte', Role::SPORTIF, null, false);

        // ---------- salles ----------
        $semaine = [[1, '07:00', '22:00'], [2, '07:00', '22:00'], [3, '07:00', '22:00'], [4, '07:00', '22:00'], [5, '07:00', '21:00'], [6, '09:00', '18:00'], [7, '09:00', '13:00']];
        $salles = [];
        foreach ([
            ['Zen Studio', 'Rue du Bailli 42', '1050', 'Ixelles', '02 345 67 89', $mamadou, 50.8270, 4.3640, 'Un studio lumineux de 400 m² dédié au yoga, au pilates et à la méditation. Cours pour tous les niveaux, encadrés par des coachs certifiés.', ['Vestiaires', 'Douches', 'Tapis fournis', 'Wi-Fi', 'Parking vélo']],
            ['Lotus Loft', 'Avenue d\'Auderghem 120', '1040', 'Etterbeek', '02 640 11 22', $mamadou, 50.8335, 4.3890, 'Loft cosy pour le yoga doux, le yin et le yoga prénatal.', ['Vestiaires', 'Tisanerie', 'Tapis fournis']],
            ['Box Atomium', 'Boulevard du Centenaire 8', '1020', 'Laeken', '02 478 90 12', $claire, 50.8950, 4.3410, 'Box de CrossFit de 600 m² avec zone haltérophilie et rameurs.', ['Vestiaires', 'Douches', 'Casiers', 'Parking']],
            ['Ring Club', 'Chaussée de Waterloo 210', '1060', 'Saint-Gilles', '02 537 45 66', $claire, 50.8260, 4.3450, 'Club de boxe historique : ring, sacs, cardio-boxe et préparation physique.', ['Vestiaires', 'Douches', 'Gants prêtés']],
            ['Move Center', 'Rue Vanderkindere 300', '1180', 'Uccle', '02 344 55 77', $claire, 50.8100, 4.3560, 'Centre de remise en forme : pilates, musculation et running club.', ['Vestiaires', 'Douches', 'Wi-Fi', 'Parking', 'Sauna']],
        ] as [$nom, $adr, $cp, $ville, $tel, $gest, $lat, $lng, $desc, $eq]) {
            $s = (new Salle())->setNom($nom)->setAdresse($adr)->setCodePostal($cp)->setVille($ville)->setTelephone($tel)
                ->setGestionnaire($gest)->setLatitude($lat)->setLongitude($lng)->setDescription($desc)->setEquipements($eq);
            foreach ($semaine as [$j, $d, $f]) {
                $s->ajouterHoraire(new Disponibilite($j, $d, $f));
            }
            $om->persist($s);
            $salles[$nom] = $s;
        }

        // ---------- séances : 14 prochains jours + quelques séances passées (historique) ----------
        $modeles = [ // [titre, activité, coach, salle, heure, durée min, capacité, prix, niveau, jours ISO]
            ['Vinyasa Flow', 'Yoga', 'Yasmina', 'Zen Studio', '18:30', 60, 15, 15, Niveau::TOUS, [1, 3]],
            ['Réveil yoga', 'Yoga', 'Yasmina', 'Zen Studio', '07:30', 60, 15, 12, Niveau::DEBUTANT, [2]],
            ['Méditation guidée', 'Méditation', 'Yasmina', 'Zen Studio', '20:00', 45, 20, 10, Niveau::TOUS, [4]],
            ['Pilates Core', 'Pilates', 'Ngozi', 'Move Center', '12:15', 45, 10, 16, Niveau::INTERMEDIAIRE, [1, 3, 5]],
            ['Yin Yoga', 'Yoga', 'Lucas', 'Lotus Loft', '19:45', 60, 12, 13, Niveau::DEBUTANT, [2, 5]],
            ['Yoga prénatal', 'Yoga', 'Lucas', 'Lotus Loft', '10:30', 60, 8, 17, Niveau::DEBUTANT, [7]],
            ['Boxe débutant', 'Boxe', 'Karim', 'Ring Club', '19:00', 60, 12, 12, Niveau::DEBUTANT, [1, 3]],
            ['Cardio-boxe', 'Boxe', 'Karim', 'Ring Club', '10:30', 60, 16, 14, Niveau::INTERMEDIAIRE, [6]],
            ['WOD Intensif', 'CrossFit', 'Sofie', 'Box Atomium', '07:00', 60, 14, 18, Niveau::AVANCE, [1, 2, 4]],
            ['Haltérophilie technique', 'Musculation', 'Sofie', 'Box Atomium', '10:00', 90, 8, 20, Niveau::INTERMEDIAIRE, [6]],
        ];
        $aujourdhui = new \DateTimeImmutable('today');
        $toutes = [];
        for ($i = -10; $i <= 14; ++$i) {
            $jour = $aujourdhui->modify("$i days");
            foreach ($modeles as [$titre, $a, $c, $sa, $h, $duree, $cap, $prix, $niv, $jours]) {
                if (!in_array((int) $jour->format('N'), $jours, true)) {
                    continue;
                }
                $debut = new \DateTimeImmutable($jour->format('Y-m-d').' '.$h);
                $s = (new Seance())->setTitre($titre)->setActivite($act[$a])->setCoach($coachs[$c])->setSalle($salles[$sa])
                    ->setDateDebut($debut)->setDateFin($debut->modify("+$duree minutes"))->setCapaciteMax($cap)->setPrix($prix)->setNiveau($niv);
                $om->persist($s);
                $toutes[] = $s;
            }
        }

        // ---------- réservations ----------
        $listeSportifs = array_values($sportifs);
        foreach ($toutes as $k => $s) {
            // remplissage varié ; « Yin Yoga » et la 1re « Boxe débutant » à venir sont complètes
            $n = match (true) {
                $s->getTitre() === 'Yin Yoga' && $s->getDateDebut() > new \DateTimeImmutable() => $s->getCapaciteMax(),
                default => $k % 5,
            };
            for ($j = 0; $j < $n; ++$j) {
                $u = $j < count($listeSportifs) ? $listeSportifs[$j] : $this->user($om, "sportif$k.$j@fitbook.be", 'Sportif', "N°$k-$j", Role::SPORTIF);
                $r = (new Reservation())->setUtilisateur($u)->setSeance($s);
                $s->getReservations()->add($r);
                $om->persist($r);
            }
        }

        // ---------- avis (validés + en attente de modération) ----------
        foreach ([
            [$sportifs['Cheikh'], $salles['Zen Studio'], null, 5, 'Super ambiance, la coach Yasmina est top. Je recommande !', true],
            [$sportifs['Élise'], $salles['Zen Studio'], null, 5, 'Studio très propre et calme. Réservation simple et rapide.', true],
            [$sportifs['Kofi'], $salles['Zen Studio'], null, 4, 'Bons cours mais vestiaires un peu petits aux heures de pointe.', true],
            [$sportifs['Aïssatou'], $salles['Box Atomium'], null, 5, 'Box très bien équipée, coachs motivants.', true],
            [$sportifs['Inès'], $salles['Ring Club'], null, 4, 'Ambiance familiale, parfait pour débuter la boxe.', true],
            [$sportifs['Tom'], $salles['Move Center'], null, 5, 'Le sauna après le pilates, un vrai bonheur.', true],
            [$sportifs['Cheikh'], null, $coachs['Yasmina'], 5, 'Pédagogue et bienveillante, cours très fluides.', true],
            [$sportifs['Élise'], null, $coachs['Ngozi'], 5, 'Exercices précis, on sent les progrès rapidement.', true],
            [$sportifs['Kofi'], null, $coachs['Karim'], 4, 'Exigeant mais toujours à l\'écoute.', true],
            [$sportifs['Aïssatou'], null, $coachs['Sofie'], 5, 'Programmation au top, je progresse chaque semaine.', true],
            [$sportifs['Tom'], $salles['Lotus Loft'], null, 3, 'Joli lieu mais un peu bruyant côté rue ce jour-là.', false],
            [$sportifs['Inès'], null, $coachs['Lucas'], 2, 'Cours commencé avec 15 minutes de retard.', false],
        ] as [$u, $salle, $coach, $note, $com, $valide]) {
            $avis = (new Avis())->setAuteur($u)->setSalle($salle)->setCoach($coach)->setNote($note)->setCommentaire($com);
            if ($valide) {
                $avis->valider();
            }
            $om->persist($avis);
        }

        // ---------- favoris ----------
        $sportifs['Aïssatou']->ajouterFavori($salles['Zen Studio']);
        $sportifs['Aïssatou']->ajouterFavori($salles['Box Atomium']);
        $sportifs['Cheikh']->ajouterFavori($salles['Ring Club']);

        $om->flush();
    }

    private function user(ObjectManager $om, string $email, string $nom, string $prenom, Role $role, ?string $tel = null, bool $verifie = true): Utilisateur
    {
        $u = (new Utilisateur())->setEmail($email)->setNom($nom)->setPrenom($prenom)->setRole($role)->setTelephone($tel)->setEstVerifie($verifie);
        if (!$verifie) {
            $u->setTokenConfirmation(str_repeat('a', 64));
        }
        // même mot de passe pour tous : on ne hache qu'une fois (rapide)
        $this->hash ??= $this->hasher->hashPassword($u, self::MOT_DE_PASSE);
        $u->setPassword($this->hash);
        $om->persist($u);

        return $u;
    }
}
