<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Salle;
use App\Entity\Seance;
use App\Entity\Utilisateur;
use App\Repository\ActiviteRepository;
use App\Repository\CoachRepository;
use App\Repository\SalleRepository;
use App\Repository\SeanceRepository;
use App\Service\Presenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/** Routes publiques : accueil, barre de recherche + filtres, fiches salle / coach / séance. */
#[Route('/api')]
class PublicController extends AbstractController
{
    public function __construct(private readonly Presenter $p)
    {
    }

    #[Route('/accueil', methods: ['GET'])]
    public function accueil(SalleRepository $salles, CoachRepository $coachs, SeanceRepository $seances): JsonResponse
    {
        $toutesSalles = $salles->findAll();
        usort($toutesSalles, fn (Salle $a, Salle $b) => ($b->noteMoyenne() ?? 0) <=> ($a->noteMoyenne() ?? 0));

        return $this->json([
            'stats' => ['salles' => count($toutesSalles), 'coachs' => $coachs->count([]), 'seances' => $seances->compterAVenir()],
            'activites' => $seances->compterParActivite(),
            'prochainesSeances' => $this->p->liste(array_slice($seances->rechercher(['disponible' => false]), 0, 8), 'seance'),
            'meilleuresSalles' => $this->p->liste(array_slice($toutesSalles, 0, 4), 'salle', false, $this->viewer()),
        ]);
    }

    /** Barre de recherche + filtres avancés : renvoie séances, salles et coachs correspondants. */
    #[Route('/recherche', methods: ['GET'])]
    public function recherche(Request $request, SeanceRepository $seances, SalleRepository $salles, CoachRepository $coachs): JsonResponse
    {
        $f = $this->filtres($request);

        return $this->json([
            'filtres' => $f,
            'seances' => $this->p->liste($seances->rechercher($f), 'seance'),
            'salles' => $this->p->liste($salles->rechercher($f), 'salle', false, $this->viewer()),
            'coachs' => $this->p->liste($coachs->rechercher($f), 'coach'),
        ]);
    }

    #[Route('/salles', methods: ['GET'])]
    public function salles(Request $request, SalleRepository $salles): JsonResponse
    {
        return $this->json($this->p->liste($salles->rechercher($this->filtres($request)), 'salle', false, $this->viewer()));
    }

    #[Route('/salles/{id<\d+>}', methods: ['GET'])]
    public function salle(Salle $salle, SeanceRepository $seances): JsonResponse
    {
        $data = $this->p->salle($salle, true, $this->viewer());
        $data['seances'] = $this->p->liste($seances->rechercher(['salle' => $salle->getId()]), 'seance');

        return $this->json($data);
    }

    #[Route('/coachs', methods: ['GET'])]
    public function coachs(Request $request, CoachRepository $coachs): JsonResponse
    {
        return $this->json($this->p->liste($coachs->rechercher($this->filtres($request)), 'coach'));
    }

    #[Route('/coachs/{id<\d+>}', methods: ['GET'])]
    public function coach(Coach $coach, SeanceRepository $seances): JsonResponse
    {
        $data = $this->p->coach($coach, true);
        $data['seances'] = $this->p->liste($seances->rechercher(['coach' => $coach->getId()]), 'seance');

        return $this->json($data);
    }

    #[Route('/seances', methods: ['GET'])]
    public function seances(Request $request, SeanceRepository $seances): JsonResponse
    {
        return $this->json($this->p->liste($seances->rechercher($this->filtres($request)), 'seance'));
    }

    #[Route('/seances/{id<\d+>}', methods: ['GET'])]
    public function seance(Seance $seance): JsonResponse
    {
        return $this->json($this->p->seance($seance));
    }

    #[Route('/activites', methods: ['GET'])]
    public function activites(ActiviteRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn ($a) => ['id' => $a->getId(), 'nom' => $a->getNom(), 'categorie' => $a->getCategorie()], $repo->findBy([], ['nom' => 'ASC'])));
    }

    #[Route('/villes', methods: ['GET'])]
    public function villes(SalleRepository $salles): JsonResponse
    {
        return $this->json($salles->villes());
    }

    private function filtres(Request $r): array
    {
        $q = $r->query;
        $activites = $q->all()['activites'] ?? [];
        if (is_string($activites)) {
            $activites = array_filter(explode(',', $activites));
        }

        return [
            'q' => trim((string) $q->get('q', '')),
            'ville' => (string) $q->get('ville', ''),
            'activites' => $activites,
            'categorie' => (string) $q->get('categorie', ''),
            'niveau' => (string) $q->get('niveau', ''),
            'date' => (string) $q->get('date', ''),
            'prixMax' => $q->get('prixMax'),
            'noteMin' => $q->get('noteMin'),
            'disponible' => $q->get('disponible'),
            'tri' => (string) $q->get('tri', 'date'),
            'lat' => $q->get('lat'),
            'lng' => $q->get('lng'),
            'rayon' => $q->get('rayon'),
        ];
    }

    private function viewer(): ?Utilisateur
    {
        $u = $this->getUser();

        return $u instanceof Utilisateur ? $u : null;
    }
}
