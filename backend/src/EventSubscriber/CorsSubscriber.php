<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/** Autorise le frontend Angular (FRONTEND_URL) à appeler l'API (CORS) et rend le JSON lisible. */
class CorsSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly string $frontendUrl)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onRequest', 250],
            KernelEvents::RESPONSE => ['onResponse', -10],
        ];
    }

    public function onRequest(RequestEvent $event): void
    {
        if ($event->isMainRequest() && $event->getRequest()->getMethod() === 'OPTIONS') {
            $event->setResponse(new Response('', 204));
        }
    }

    public function onResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        if ($response instanceof JsonResponse) {
            // accents lisibles dans le JSON (« é » au lieu de « \u00e9 »)
            $response->setEncodingOptions($response->getEncodingOptions() | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        $h = $response->headers;
        // FRONTEND_URL, et la même adresse écrite avec 127.0.0.1 ou localhost
        $origine = $event->getRequest()->headers->get('Origin');
        $autorisees = [$this->frontendUrl, str_replace('localhost', '127.0.0.1', $this->frontendUrl), str_replace('127.0.0.1', 'localhost', $this->frontendUrl)];
        $h->set('Access-Control-Allow-Origin', in_array($origine, $autorisees, true) ? $origine : $this->frontendUrl);
        $h->set('Vary', 'Origin');
        $h->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $h->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
        $h->set('Access-Control-Max-Age', '3600');
    }
}
