<?php

namespace App\EventSubscriber;

use App\Service\ApiException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

/** Toutes les erreurs de /api sont renvoyées en JSON : {"message": "...", "erreurs": {...}} */
class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        // priorité -5 : après le pare-feu Security, qui transforme les refus d'accès en erreurs 403
        return [KernelEvents::EXCEPTION => ['onException', -5]];
    }

    public function onException(ExceptionEvent $event): void
    {
        if (!str_starts_with($event->getRequest()->getPathInfo(), '/api')) {
            return;
        }
        $e = $event->getThrowable();
        if ($e instanceof ApiException) {
            $event->setResponse(new JsonResponse(['message' => $e->getMessage(), 'erreurs' => $e->erreurs ?: new \stdClass()], $e->statut));

            return;
        }
        if ($e instanceof HttpExceptionInterface) {
            $msg = match ($e->getStatusCode()) {
                404 => 'Ressource introuvable.',
                403 => str_starts_with($e->getMessage(), 'Access Denied') ? 'Accès refusé : votre rôle ne permet pas cette action.' : $e->getMessage(),
                default => $e->getMessage(),
            };
            $event->setResponse(new JsonResponse(['message' => $msg], $e->getStatusCode()));
        }
    }
}
