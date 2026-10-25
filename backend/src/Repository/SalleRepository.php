<?php

namespace App\Repository;

use App\Entity\Salle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Salle> */
class SalleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Salle::class);
    }

    /** @return Salle[] */
    public function rechercher(array $f): array
    {
        $qb = $this->createQueryBuilder('sa')->orderBy('sa.nom', 'ASC');
        if (!empty($f['q'])) {
            $qb->andWhere('LOWER(sa.nom) LIKE :q OR LOWER(sa.description) LIKE :q OR LOWER(sa.equipements) LIKE :q OR LOWER(sa.ville) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($f['q']).'%');
        }
        if (!empty($f['ville'])) {
            $qb->andWhere('LOWER(sa.ville) = :ville')->setParameter('ville', mb_strtolower($f['ville']));
        }
        if (!empty($f['activites'])) {
            $qb->andWhere('EXISTS (SELECT 1 FROM App\Entity\Seance s2 WHERE s2.salle = sa AND IDENTITY(s2.activite) IN (:acts))')
                ->setParameter('acts', array_map('intval', (array) $f['activites']));
        }
        $salles = $qb->getQuery()->getResult();

        if (!empty($f['noteMin'])) {
            $salles = array_values(array_filter($salles, fn (Salle $s) => ($s->noteMoyenne() ?? 0) >= (float) $f['noteMin']));
        }
        // Bonus : recherche par distance (formule de haversine) si lat/lng/rayon fournis
        if (isset($f['lat'], $f['lng']) && $f['lat'] !== '' && $f['lng'] !== '') {
            $rayon = (float) ($f['rayon'] ?? 10);
            $salles = array_values(array_filter($salles, function (Salle $s) use ($f, $rayon) {
                $d = self::distanceKm((float) $f['lat'], (float) $f['lng'], $s->getLatitude(), $s->getLongitude());

                return $d !== null && $d <= $rayon;
            }));
        }

        return $salles;
    }

    public static function distanceKm(float $lat1, float $lng1, ?float $lat2, ?float $lng2): ?float
    {
        if ($lat2 === null || $lng2 === null) {
            return null;
        }
        $r = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return round($r * 2 * atan2(sqrt($a), sqrt(1 - $a)), 2);
    }

    /** @return string[] */
    public function villes(): array
    {
        return array_column($this->createQueryBuilder('sa')->select('DISTINCT sa.ville')->orderBy('sa.ville')->getQuery()->getArrayResult(), 'ville');
    }
}
