<?php

namespace App\Service;

use JsonSchema\Constraints\Constraint;
use JsonSchema\Validator;

/**
 * Validation d'un formulaire par JSON Schema (config/json_schema/*.schema.json).
 * Utilisé pour le formulaire de séance (création / modification) côté coach et gestionnaire.
 */
class JsonSchemaValidator
{
    public function __construct(private readonly string $schemaDir)
    {
    }

    /** @param array<string, mixed> $data */
    public function valider(array $data, string $schema): void
    {
        $chemin = $this->schemaDir.'/'.$schema.'.schema.json';
        if (!is_file($chemin)) {
            throw new \LogicException("Schéma JSON introuvable : $chemin");
        }
        // le validateur attend des objets (stdClass), pas des tableaux associatifs
        $objet = json_decode(json_encode($data === [] ? new \stdClass() : $data));
        $validator = new Validator();
        $validator->validate($objet, (object) ['$ref' => 'file://'.realpath($chemin)], Constraint::CHECK_MODE_NORMAL);

        if (!$validator->isValid()) {
            $erreurs = [];
            foreach ($validator->getErrors() as $e) {
                $champ = ltrim((string) ($e['property'] ?? ''), '.') ?: 'global';
                $erreurs[$champ] = self::traduire($e);
            }
            throw new ApiException('Les données ne respectent pas le schéma JSON du formulaire.', 422, $erreurs);
        }
    }

    private static function traduire(array $e): string
    {
        $c = $e['constraint']['name'] ?? ($e['constraint'] ?? '');
        $p = $e['constraint']['params'] ?? [];

        return match ($c) {
            'required' => 'Champ obligatoire.',
            'type' => 'Type invalide (attendu : '.($p['expected'] ?? ($e['message'] ?? '')).').',
            'minLength' => 'Trop court.',
            'maxLength' => 'Trop long.',
            'minimum' => 'Valeur trop petite.',
            'maximum' => 'Valeur trop grande.',
            'enum' => 'Valeur non autorisée.',
            'pattern' => 'Format invalide.',
            'additionalProp' => 'Champ non autorisé.',
            default => (string) ($e['message'] ?? 'Valeur invalide.'),
        };
    }
}
