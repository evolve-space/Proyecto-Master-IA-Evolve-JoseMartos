<?php

namespace App\Agent;

/**
 * Carmen — Especialista en Proveedores y Contratos.
 *
 * Herramientas disponibles (CRUD completo):
 *   Proveedores: list, get, create, update, delete
 *   Contratos:   list, get, create, update, delete
 */
final class CarmenAgent extends AbstractAgent
{
    public function getId(): string   { return 'carmen'; }
    public function getName(): string { return 'Carmen'; }

    // ──────────────────────────────────────────────────────────────
    // System prompt
    // ──────────────────────────────────────────────────────────────

    protected function getSystemPrompt(array $context): string
    {
        $rol    = $context['userRole'] ?? 'normal';
        $pagina = $context['currentPage'] ?? '';

        return $this->loadPersona('Carmen') . "\n\nContexto: rol={$rol}, página={$pagina}";
    }

    // ──────────────────────────────────────────────────────────────
    // Definición de herramientas OpenAI
    // ──────────────────────────────────────────────────────────────

    protected function getTools(): array
    {
        return [
            // ── Proveedores ──────────────────────────────────────
            $this->tool('list_proveedores', 'Obtiene la lista de todos los proveedores.', []),
            $this->tool('get_proveedor', 'Obtiene el detalle de un proveedor por su ID.', [
                'id' => $this->numProp('ID del proveedor'),
            ], ['id']),
            $this->tool('create_proveedor', 'Crea un nuevo proveedor.', [
                'nombre'               => $this->strProp('Nombre del proveedor (obligatorio)'),
                'cifNif'               => $this->strProp('CIF/NIF'),
                'telefono'             => $this->strProp('Teléfono'),
                'email'                => $this->strProp('Email'),
                'movil'                => $this->strProp('Móvil'),
                'web'                  => $this->strProp('Web'),
                'actividad'            => $this->strProp('Actividad o sector'),
                'contactoPrincipal'    => $this->strProp('Nombre del contacto principal'),
                'tipo'                 => $this->strProp('Tipo de proveedor', ['Fabricante', 'Distribuidor']),
                'incoterm'             => $this->strProp('Incoterm habitual', ['EXW', 'CIF', 'CIP', 'CFR']),
                'formaPago'            => $this->numProp('Días de pago (30, 60, 75)'),
                'direccionFacturacion' => $this->strProp('Dirección de facturación'),
                'certificaciones'      => $this->strProp('Certificaciones'),
                'documentacion'        => $this->boolProp('¿Documentación en regla?'),
                'observaciones'        => $this->strProp('Observaciones'),
            ], ['nombre']),
            $this->tool('update_proveedor', 'Actualiza un proveedor existente.', [
                'id'                   => $this->numProp('ID del proveedor a actualizar'),
                'nombre'               => $this->strProp('Nombre'),
                'cifNif'               => $this->strProp('CIF/NIF'),
                'telefono'             => $this->strProp('Teléfono'),
                'email'                => $this->strProp('Email'),
                'movil'                => $this->strProp('Móvil'),
                'web'                  => $this->strProp('Web'),
                'actividad'            => $this->strProp('Actividad'),
                'contactoPrincipal'    => $this->strProp('Contacto principal'),
                'tipo'                 => $this->strProp('Tipo', ['Fabricante', 'Distribuidor']),
                'incoterm'             => $this->strProp('Incoterm', ['EXW', 'CIF', 'CIP', 'CFR']),
                'formaPago'            => $this->numProp('Días de pago'),
                'direccionFacturacion' => $this->strProp('Dirección'),
                'certificaciones'      => $this->strProp('Certificaciones'),
                'documentacion'        => $this->boolProp('Documentación'),
                'observaciones'        => $this->strProp('Observaciones'),
            ], ['id']),
            $this->tool('delete_proveedor', 'Elimina un proveedor por su ID.', [
                'id' => $this->numProp('ID del proveedor a eliminar'),
            ], ['id']),

            // ── Contratos ────────────────────────────────────────
            $this->tool('list_contratos', 'Obtiene la lista de todos los contratos.', []),
            $this->tool('get_contrato', 'Obtiene el detalle de un contrato por su ID.', [
                'id' => $this->numProp('ID del contrato'),
            ], ['id']),
            $this->tool('create_contrato', 'Crea un nuevo contrato.', [
                'proveedorId'       => $this->numProp('ID del proveedor (obligatorio)'),
                'numeroContrato'    => $this->strProp('Número o referencia del contrato'),
                'producto'          => $this->strProp('Producto contratado'),
                'fecha'             => $this->strProp('Fecha del contrato (YYYY-MM-DD)'),
                'fechaCaducidad'    => $this->strProp('Fecha de caducidad (YYYY-MM-DD)'),
                'precio'            => $this->numProp('Precio unitario'),
                'cantidad'          => $this->numProp('Cantidad total pactada (kg)'),
                'cantidadPedida'    => $this->numProp('Cantidad ya pedida (kg)'),
                'cantidadPendiente' => $this->numProp('Cantidad pendiente (kg)'),
                'grado'             => $this->strProp('Grado del producto', ['BIO', 'HALAL', 'KOSHER', 'FOOD']),
                'documentacion'     => $this->boolProp('Documentación en regla'),
                'observaciones'     => $this->strProp('Observaciones'),
            ], ['proveedorId']),
            $this->tool('update_contrato', 'Actualiza un contrato existente.', [
                'id'                => $this->numProp('ID del contrato a actualizar'),
                'proveedorId'       => $this->numProp('ID del proveedor'),
                'numeroContrato'    => $this->strProp('Número de contrato'),
                'producto'          => $this->strProp('Producto'),
                'fecha'             => $this->strProp('Fecha (YYYY-MM-DD)'),
                'fechaCaducidad'    => $this->strProp('Fecha caducidad (YYYY-MM-DD)'),
                'precio'            => $this->numProp('Precio'),
                'cantidad'          => $this->numProp('Cantidad total'),
                'cantidadPedida'    => $this->numProp('Cantidad pedida'),
                'cantidadPendiente' => $this->numProp('Cantidad pendiente'),
                'grado'             => $this->strProp('Grado', ['BIO', 'HALAL', 'KOSHER', 'FOOD']),
                'documentacion'     => $this->boolProp('Documentación'),
                'observaciones'     => $this->strProp('Observaciones'),
            ], ['id']),
            $this->tool('delete_contrato', 'Elimina un contrato por su ID.', [
                'id' => $this->numProp('ID del contrato a eliminar'),
            ], ['id']),
        ];
    }

    // ──────────────────────────────────────────────────────────────
    // Ejecución de herramientas
    // ──────────────────────────────────────────────────────────────

    protected function executeTool(string $name, array $args, string $jwt): string
    {
        return match ($name) {
            'list_proveedores' => $this->toJson($this->apiClient->get('/api/proveedores', $jwt)),
            'get_proveedor'    => $this->toJson($this->apiClient->get('/api/proveedores/' . (int) $args['id'], $jwt)),
            'create_proveedor' => $this->toJson($this->apiClient->post('/api/proveedores', $jwt, $args)),
            'update_proveedor' => $this->toJson($this->apiClient->put('/api/proveedores/' . (int) $args['id'], $jwt, $args)),
            'delete_proveedor' => $this->apiClient->delete('/api/proveedores/' . (int) $args['id'], $jwt)
                ? 'Proveedor eliminado correctamente.'
                : 'Error al eliminar el proveedor.',

            'list_contratos' => $this->toJson($this->apiClient->get('/api/contratos', $jwt)),
            'get_contrato'   => $this->toJson($this->apiClient->get('/api/contratos/' . (int) $args['id'], $jwt)),
            'create_contrato' => $this->toJson($this->apiClient->post('/api/contratos', $jwt, $args)),
            'update_contrato' => $this->toJson($this->apiClient->put('/api/contratos/' . (int) $args['id'], $jwt, $args)),
            'delete_contrato' => $this->apiClient->delete('/api/contratos/' . (int) $args['id'], $jwt)
                ? 'Contrato eliminado correctamente.'
                : 'Error al eliminar el contrato.',

            default => json_encode(['error' => "Herramienta desconocida: {$name}"]),
        };
    }
}
