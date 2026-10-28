<?php

namespace App\Command;

use App\Repository\SeanceRepository;
use App\Service\Notifier;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/** Bonus « notifications avant une séance » : à lancer chaque jour (cron / planificateur Windows). */
#[AsCommand(name: 'app:rappels-seances', description: 'Envoie un email de rappel aux inscrits des séances des prochaines 24 h')]
class RappelsSeancesCommand extends Command
{
    public function __construct(private readonly SeanceRepository $seances, private readonly Notifier $notifier)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('heures', null, InputOption::VALUE_REQUIRED, 'Fenêtre en heures', '24');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $now = new \DateTimeImmutable();
        $liste = $this->seances->commencantEntre($now, $now->modify('+'.(int) $input->getOption('heures').' hours'));
        $total = 0;
        foreach ($liste as $s) {
            $n = $this->notifier->rappelSeance($s);
            $io->writeln(sprintf(' - %s (%s) : %d rappel(s)', $s->getTitre(), $s->getDateDebut()->format('d/m H:i'), $n));
            $total += $n;
        }
        $io->success(sprintf('%d séance(s), %d email(s) de rappel envoyé(s).', count($liste), $total));

        return Command::SUCCESS;
    }
}
