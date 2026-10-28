/**
 * Adresse de l'API Symfony.
 * '/api' = même adresse que le site : pendant « npx ng serve », Angular transmet chaque appel /api/...
 * au backend http://127.0.0.1:8000 (voir proxy.conf.json). Pas de problème de CORS ni de localhost / 127.0.0.1.
 * Le backend doit être lancé avec :  php -S 127.0.0.1:8000 -t public   (ou : symfony serve --no-tls)
 */
export const environment = {
  apiUrl: '/api',
};
