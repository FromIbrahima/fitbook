<?php

namespace App\Repository;

use App\Entity\Coach;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Coach> */
class CoachRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Coach::class);
    }

    /** @return Coach[] */
    public function rechercher(array $f): array
    {
        $qb = $this->createQueryBuilder('c')->addSelect('u')->join('c.utilisateur', 'u')->orderBy('u.nom', 'ASC');
        if (!empty($f['q'])) {
            $qb->andWhere('LOWER(u.nom) LIKE :q OR LOWER(u.prenom) LIKE :q OR LOWER(c.specialite) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($f['q']).'%');
        }
        if (!empty($f['ville'])) {
            $qb->andWhere('LOWER(c.ville) = :ville')->setParameter('ville', mb_strtolower($f['ville']));
        }
        if (!empty($f['activites'])) {
            $qb->andWhere('EXISTS (SELECT 1 FROM App\Entity\Seance s2 WHERE s2.coach = c AND IDENTITY(s2.activite) IN (:acts))')
                ->setParameter('acts', array_map('intval', (array) $f['activites']));
        }
        if (isset($f['prixMax']) && $f['prixMax'] !== '' && $f['prixMax'] !== null) {
            $qb->andWhere('c.tarifHoraire <= :p')->setParameter('p', (float) $f['prixMax']);
        }
        $coachs = $qb->getQuery()->getResult();
        if (!empty($f['noteMin'])) {
            $coachs = array_values(array_filter($coachs, fn (Coach $c) => ($c->noteMoyenne() ?? 0) >= (float) $f['noteMin']));
        }

        return $coachs;
    }
}
