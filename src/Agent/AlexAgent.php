<?php

namespace App\Agent;

/**
 * Alex — Especialista en Gestión de Usuarios.
 *
 * ACCESO RESTRINGIDO: solo disponible para admin y superadmin.
 *
 * Herramientas disponibles (CRUD completo):
 *   Usuarios: list, get, create, update, delete
 */
final class AlexAgent extends AbstractAgent
{
    public function getId(): string   { return 'alex'; }
    public function getName(): string { return 'Alex'; }

    public function supports(array $context): bool
    {
        return in_array($context['userRole'] ?? 'normal', ['admin', 'superadmin'], true);
    }

    protected function getSystemPrompt(array $context): string
    {
        $rol    = $context['userRole'] ?? 'admin';
        $pagina = $context['currentPage'] ?? '';

        return $this->loadPersona('Alex') . "\n\nContexto: rol={$rol}, página={$pagina}";
    }

    protected function getTools(): array
    {
        return [
            $this->tool('list_usuarios', 'Obtiene la lista de todos los usuarios del sistema.', []),
            $this->tool('get_usuario', 'Obtiene el detalle de un usuario por su ID.', [
                'id' => $this->numProp('ID del usuario'),
            ], ['id']),
            $this->tool('create_usuario', 'Crea un nuevo usuario en el sistema.', [
                'nombre'   => $this->strProp('Nombre completo (obligatorio)'),
                'username' => $this->strProp('Nombre de usuario / login (obligatorio)'),
                'password' => $this->strProp('Contraseña (obligatorio)'),
                'tipo'     => $this->strProp('Tipo de usuario', ['superadmin', 'admin', 'normal']),
                'email'    => $this->strProp('Email'),
            ], ['nombre', 'username', 'password', 'tipo']),
            $this->tool('update_usuario', 'Actualiza un usuario existente.', [
                'id'       => $this->numProp('ID del usuario a actualizar'),
                'nombre'   => $this->strProp('Nombre completo'),
                'username' => $this->strProp('Nombre de usuario'),
                'password' => $this->strProp('Nueva contraseña (dejar vacío para no cambiar)'),
                'tipo'     => $this->strProp('Tipo', ['superadmin', 'admin', 'normal']),
                'email'    => $this->strProp('Email'),
            ], ['id']),
            $this->tool('delete_usuario', 'Elimina un usuario por su ID.', [
                'id' => $this->numProp('ID del usuario a eliminar'),
            ], ['id']),
        ];
    }

    protected function executeTool(string $name, array $args, string $jwt): string
    {
        return match ($name) {
            'list_usuarios'  => $this->toJson($this->apiClient->get('/api/usuarios', $jwt)),
            'get_usuario'    => $this->toJson($this->apiClient->get('/api/usuarios/' . (int) $args['id'], $jwt)),
            'create_usuario' => $this->toJson($this->apiClient->post('/api/usuarios', $jwt, $args)),
            'update_usuario' => $this->toJson($this->apiClient->put('/api/usuarios/' . (int) $args['id'], $jwt, $args)),
            'delete_usuario' => $this->apiClient->delete('/api/usuarios/' . (int) $args['id'], $jwt)
                ? 'Usuario eliminado correctamente.'
                : 'Error al eliminar el usuario.',

            default => json_encode(['error' => "Herramienta desconocida: {$name}"]),
        };
    }
}
