<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Page d'accueil du backend (http://127.0.0.1:8000/).
 * Le backend est une API : il renvoie du JSON au frontend Angular. Cette page sert seulement
 * à vérifier qu'il tourne, qu'il est connecté à MySQL avec fitbook_user, et à ouvrir quelques routes.
 */
class AccueilController
{
    #[Route('/', name: 'app_accueil', methods: ['GET'])]
    public function accueil(Connection $db): Response
    {
        try {
            $utilisateur = (string) $db->fetchOne('SELECT CURRENT_USER()');
            $chiffres = [
                'Salles' => (int) $db->fetchOne('SELECT COUNT(*) FROM salles'),
                'Coachs' => (int) $db->fetchOne('SELECT COUNT(*) FROM coachs'),
                'Séances' => (int) $db->fetchOne('SELECT COUNT(*) FROM seances'),
                'Réservations' => (int) $db->fetchOne('SELECT COUNT(*) FROM reservations'),
            ];
            $procedures = $db->fetchFirstColumn('SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE() ORDER BY ROUTINE_NAME');
            $etat = '<p class="ok">✔ Connecté à MySQL avec l\'utilisateur <code>'.htmlspecialchars($utilisateur).'</code></p>';
        } catch (\Throwable $e) {
            $chiffres = [];
            $procedures = [];
            $etat = '<p class="ko">✘ Base de données inaccessible : <code>'.htmlspecialchars($e->getMessage()).'</code><br>Vérifiez DATABASE_URL dans backend/.env.local, puis lancez les migrations.</p>';
        }

        $cases = '';
        foreach ($chiffres as $nom => $n) {
            $cases .= "<div class=\"case\"><b>$n</b><span>$nom</span></div>";
        }
        $procs = $procedures ? implode('', array_map(fn ($p) => '<li><code>'.htmlspecialchars($p).'</code></li>', $procedures)) : '<li>aucune (lancez les migrations)</li>';
        $liens = '';
        foreach (['/api/activites' => 'Activités', '/api/villes' => 'Villes', '/api/salles' => 'Salles', '/api/coachs' => 'Coachs', '/api/seances' => 'Séances à venir', '/api/recherche?q=yoga' => 'Recherche « yoga »'] as $url => $nom) {
            $liens .= "<li><a href=\"$url\">$url</a> — $nom</li>";
        }

        $html = <<<HTML
<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>FitBook — API</title>
<style>
body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#F6F7F9;color:#0F172A}
main{max-width:760px;margin:40px auto;padding:0 16px}
h1{margin:0;font-size:28px}h1 span{color:#FF5A1F}
.carte{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:18px 22px;margin:16px 0}
.ok{color:#15803D;font-weight:600}.ko{color:#B91C1C}
.cases{display:flex;gap:12px;flex-wrap:wrap}.case{flex:1;min-width:120px;background:#FFF1EA;border-radius:10px;padding:10px 14px}
.case b{display:block;font-size:24px;color:#FF5A1F}
code{background:#F1F5F9;padding:1px 5px;border-radius:4px}a{color:#FF5A1F}
</style></head><body><main>
<h1><span>⚡ FitBook</span> — API backend (Symfony)</h1>
<p>Le backend ne fait pas l'affichage : il répond en <b>JSON</b> au frontend Angular (<a href="http://localhost:4200">http://localhost:4200</a>).</p>
<div class="carte">$etat<div class="cases">$cases</div></div>
<div class="carte"><b>Procédures stockées</b><ul>$procs</ul></div>
<div class="carte"><b>Quelques routes publiques à ouvrir</b> (les autres demandent d'être connecté)<ul>$liens</ul></div>
</main></body></html>
HTML;

        return new Response($html);
    }
}
