<?php

namespace App\Agent;

/**
 * Rafa — Especialista en Ofertas y Pedidos.
 *
 * Herramientas disponibles (CRUD completo):
 *   Ofertas: list, get, create, update, delete
 */
final class RafaAgent extends AbstractAgent
{
    public function getId(): string   { return 'rafa'; }
    public function getName(): string { return 'Rafa'; }

    protected function getSystemPrompt(array $context): string
    {
        $rol    = $context['userRole'] ?? 'normal';
        $pagina = $context['currentPage'] ?? '';

        return $this->loadPersona('Rafa') . "\n\nContexto: rol={$rol}, página={$pagina}";
    }

    protected function getTools(): array
    {
        return [
            $this->tool('list_ofertas', 'Obtiene la lista de todas las ofertas.', []),
            $this->tool('get_oferta', 'Obtiene el detalle de una oferta por su ID.', [
                'id' => $this->numProp('ID de la oferta'),
            ], ['id']),
            $this->tool('create_oferta', 'Crea una nueva oferta.', [
                'proveedorId'  => $this->numProp('ID del proveedor (obligatorio)'),
                'producto'     => $this->strProp('Nombre del producto'),
                'fecha'        => $this->strProp('Fecha de la oferta (YYYY-MM-DD)'),
                'cantidad'     => $this->numProp('Cantidad (kg)'),
                'precio'       => $this->numProp('Precio unitario'),
                'moneda'       => $this->strProp('Moneda (EUR, USD, etc.)'),
                'grado'        => $this->strProp('Grado del producto', ['Food Grade', 'Feed Grade', 'Reach']),
                'incoterm'     => $this->strProp('Incoterm', ['EXW', 'CIF', 'CIP', 'CFR']),
                'tipo'         => $this->strProp('Tipo de operación', ['Contrato', 'Pedido']),
                'muestra'      => $this->boolProp('¿Incluye muestra?'),
                'documentacion'=> $this->boolProp('¿Documentación en regla?'),
                'observaciones'=> $this->strProp('Observaciones'),
            ], ['proveedorId']),
            $this->tool('update_oferta', 'Actualiza una oferta existente.', [
                'id'           => $this->numProp('ID de la oferta a actualizar'),
                'proveedorId'  => $this->numProp('ID del proveedor'),
                'producto'     => $this->strProp('Producto'),
                'fecha'        => $this->strProp('Fecha (YYYY-MM-DD)'),
                'cantidad'     => $this->numProp('Cantidad'),
                'precio'       => $this->numProp('Precio'),
                'moneda'       => $this->strProp('Moneda'),
                'grado'        => $this->strProp('Grado', ['Food Grade', 'Feed Grade', 'Reach']),
                'incoterm'     => $this->strProp('Incoterm', ['EXW', 'CIF', 'CIP', 'CFR']),
                'tipo'         => $this->strProp('Tipo', ['Contrato', 'Pedido']),
                'muestra'      => $this->boolProp('Muestra'),
                'documentacion'=> $this->boolProp('Documentación'),
                'observaciones'=> $this->strProp('Observaciones'),
            ], ['id']),
            $this->tool('delete_oferta', 'Elimina una oferta por su ID.', [
                'id' => $this->numProp('ID de la oferta a eliminar'),
            ], ['id']),
            $this->tool('list_proveedores', 'Obtiene los proveedores disponibles (para referenciar en ofertas).', []),
        ];
    }

    protected function executeTool(string $name, array $args, string $jwt): string
    {
        return match ($name) {
            'list_ofertas'    => $this->toJson($this->apiClient->get('/api/ofertas', $jwt)),
            'get_oferta'      => $this->toJson($this->apiClient->get('/api/ofertas/' . (int) $args['id'], $jwt)),
            'create_oferta'   => $this->toJson($this->apiClient->post('/api/ofertas', $jwt, $args)),
            'update_oferta'   => $this->toJson($this->apiClient->put('/api/ofertas/' . (int) $args['id'], $jwt, $args)),
            'delete_oferta'   => $this->apiClient->delete('/api/ofertas/' . (int) $args['id'], $jwt)
                ? 'Oferta eliminada correctamente.'
                : 'Error al eliminar la oferta.',
            'list_proveedores' => $this->toJson($this->apiClient->get('/api/proveedores', $jwt)),

            default => json_encode(['error' => "Herramienta desconocida: {$name}"]),
        };
    }
}
