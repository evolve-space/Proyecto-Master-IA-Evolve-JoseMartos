<?php

namespace App\Agent;

interface AgentInterface
{
    /** Identificador de máquina (carmen, rafa, noa, iris, alex) */
    public function getId(): string;

    /** Nombre para mostrar */
    public function getName(): string;

    /**
     * Procesa el mensaje del usuario y devuelve la respuesta en lenguaje natural.
     *
     * @param string $message  Mensaje actual del usuario
     * @param array  $history  Historial de mensajes [['role'=>'user|assistant','content'=>'...']]
     * @param array  $context  Contexto: userId, userRole, currentPage
     * @param string $jwt      JWT del usuario para llamar a la API SRM
     */
    public function handle(string $message, array $history, array $context, string $jwt): string;

    /**
     * Indica si este agente puede atender al usuario según su contexto (rol, permisos, etc.)
     */
    public function supports(array $context): bool;
}
