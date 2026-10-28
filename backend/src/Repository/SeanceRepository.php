<?php

namespace App\Repository;

use App\Entity\Seance;
use App\Enum\StatutReservation;
use App\Enum\StatutSeance;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Seance> */
class SeanceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Seance::class);
    }

    /**
     * Recherche avancée des séances à venir.
     * Filtres : q (texte), ville, activites[] (ids), categorie, niveau, date (Y-m-d), prixMax, disponible (bool), salle, coach, tri.
     *
     * @return Seance[]
     */
    public function rechercher(array $f): array
    {
        $qb = $this->createQueryBuilder('s')
            ->addSelect('sa', 'a', 'c', 'u')
            ->join('s.salle', 'sa')
            ->join('s.activite', 'a')
            ->join('s.coach', 'c')
            ->join('c.utilisateur', 'u')
            ->where('s.statut = :planifiee')->setParameter('planifiee', StatutSeance::PLANIFIEE)
            ->andWhere('s.dateDebut > :now')->setParameter('now', new \DateTimeImmutable());

        if (!empty($f['q'])) {
            $qb->andWhere('LOWER(s.titre) LIKE :q OR LOWER(a.nom) LIKE :q OR LOWER(sa.nom) LIKE :q OR LOWER(u.nom) LIKE :q OR LOWER(u.prenom) LIKE :q OR LOWER(a.categorie) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($f['q']).'%');
        }
        if (!empty($f['ville'])) {
            $qb->andWhere('LOWER(sa.ville) = :ville')->setParameter('ville', mb_strtolower($f['ville']));
        }
        if (!empty($f['activites'])) {
            $qb->andWhere('a.id IN (:acts)')->setParameter('acts', array_map('intval', (array) $f['activites']));
        }
        if (!empty($f['categorie'])) {
            $qb->andWhere('a.categorie = :cat')->setParameter('cat', $f['categorie']);
        }
        if (!empty($f['niveau']) && $f['niveau'] !== 'TOUS') {
            $qb->andWhere('s.niveau IN (:niv)')->setParameter('niv', [$f['niveau'], 'TOUS']);
        }
        if (!empty($f['date'])) {
            $jour = \DateTimeImmutable::createFromFormat('!Y-m-d', $f['date']);
            if ($jour) {
                $qb->andWhere('s.dateDebut >= :d1 AND s.dateDebut < :d2')
                    ->setParameter('d1', $jour)->setParameter('d2', $jour->modify('+1 day'));
            }
        }
        if (isset($f['prixMax']) && $f['prixMax'] !== '' && $f['prixMax'] !== null) {
            $qb->andWhere('s.prix <= :pmax')->setParameter('pmax', (float) $f['prixMax']);
        }
        if (!empty($f['salle'])) {
            $qb->andWhere('sa.id = :salle')->setParameter('salle', (int) $f['salle']);
        }
        if (!empty($f['coach'])) {
            $qb->andWhere('c.id = :coach')->setParameter('coach', (int) $f['coach']);
        }
        match ($f['tri'] ?? 'date') {
            'prix' => $qb->orderBy('s.prix', 'ASC'),
            'prix_desc' => $qb->orderBy('s.prix', 'DESC'),
            default => $qb->orderBy('s.dateDebut', 'ASC'),
        };
        $seances = $qb->getQuery()->getResult();

        if (!empty($f['disponible']) && filter_var($f['disponible'], FILTER_VALIDATE_BOOLEAN)) {
            $seances = array_values(array_filter($seances, fn (Seance $s) => !$s->estComplete()));
        }

        return $seances;
    }

    /** @return Seance[] séances qui commencent dans l'intervalle (rappels email) */
    public function commencantEntre(\DateTimeImmutable $de, \DateTimeImmutable $a): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.statut = :p')->setParameter('p', StatutSeance::PLANIFIEE)
            ->andWhere('s.dateDebut >= :de AND s.dateDebut < :a')
            ->setParameter('de', $de)->setParameter('a', $a)
            ->getQuery()->getResult();
    }

    public function compterAVenir(): int
    {
        return (int) $this->createQueryBuilder('s')->select('COUNT(s.id)')
            ->where('s.statut = :p')->setParameter('p', StatutSeance::PLANIFIEE)
            ->andWhere('s.dateDebut > :now')->setParameter('now', new \DateTimeImmutable())
            ->getQuery()->getSingleScalarResult();
    }

    /** @return array<int, array{nom: string, total: int}> nombre de séances à venir par activité */
    public function compterParActivite(): array
    {
        return $this->createQueryBuilder('s')
            ->select('a.id, a.nom, a.categorie, COUNT(s.id) AS total')
            ->join('s.activite', 'a')
            ->where('s.statut = :p')->setParameter('p', StatutSeance::PLANIFIEE)
            ->andWhere('s.dateDebut > :now')->setParameter('now', new \DateTimeImmutable())
            ->groupBy('a.id')->orderBy('total', 'DESC')
            ->getQuery()->getArrayResult();
    }

    public function nombreReservationsConfirmees(Seance $s): int
    {
        return (int) $this->getEntityManager()->createQuery(
            'SELECT COUNT(r.id) FROM App\Entity\Reservation r WHERE r.seance = :s AND r.statut = :st'
        )->setParameters(['s' => $s, 'st' => StatutReservation::CONFIRMEE])->getSingleScalarResult();
    }
}
