<?php

namespace App\Agent;

/**
 * Noa — Especialista en Importaciones.
 *
 * Herramientas disponibles (CRUD completo):
 *   Importaciones: list, get, create, update, delete
 */
final class NoaAgent extends AbstractAgent
{
    public function getId(): string   { return 'noa'; }
    public function getName(): string { return 'Noa'; }

    protected function getSystemPrompt(array $context): string
    {
        $rol    = $context['userRole'] ?? 'normal';
        $pagina = $context['currentPage'] ?? '';

        return $this->loadPersona('Noa') . "\n\nContexto: rol={$rol}, página={$pagina}";
    }

    protected function getTools(): array
    {
        return [
            $this->tool('list_importaciones', 'Obtiene la lista de todas las importaciones.', []),
            $this->tool('get_importacion', 'Obtiene el detalle de una importación por su ID.', [
                'id' => $this->numProp('ID de la importación'),
            ], ['id']),
            $this->tool('create_importacion', 'Crea una nueva importación.', [
                'proveedorId'     => $this->numProp('ID del proveedor (obligatorio)'),
                'producto'        => $this->strProp('Producto importado'),
                'fechaDuaAlbaran' => $this->strProp('Fecha DUA/Albarán (YYYY-MM-DD)'),
                'fechaFactura'    => $this->strProp('Fecha factura (YYYY-MM-DD)'),
                'cantidad'        => $this->numProp('Cantidad (kg)'),
                'importeEur'      => $this->numProp('Importe en EUR'),
                'importeUsd'      => $this->numProp('Importe en USD'),
                'tipoCambio'      => $this->numProp('Tipo de cambio USD/EUR'),
                'aranceles'       => $this->numProp('Aranceles (%)'),
                'costeDespacho'   => $this->numProp('Coste de despacho (EUR)'),
                'gastoImpKg'      => $this->numProp('Gasto importación por kg'),
                'costeKg'         => $this->numProp('Coste total por kg'),
                'incoterm'        => $this->strProp('Incoterm', ['EXW', 'CIF', 'CIP', 'CFR']),
                'forwarderer'     => $this->strProp('Transitario/forwarder'),
                'documentacion'   => $this->boolProp('Documentación en regla'),
                'observaciones'   => $this->strProp('Observaciones'),
            ], ['proveedorId']),
            $this->tool('update_importacion', 'Actualiza una importación existente.', [
                'id'              => $this->numProp('ID de la importación a actualizar'),
                'proveedorId'     => $this->numProp('ID del proveedor'),
                'producto'        => $this->strProp('Producto'),
                'fechaDuaAlbaran' => $this->strProp('Fecha DUA (YYYY-MM-DD)'),
                'fechaFactura'    => $this->strProp('Fecha factura (YYYY-MM-DD)'),
                'cantidad'        => $this->numProp('Cantidad (kg)'),
                'importeEur'      => $this->numProp('Importe EUR'),
                'importeUsd'      => $this->numProp('Importe USD'),
                'tipoCambio'      => $this->numProp('Tipo de cambio'),
                'aranceles'       => $this->numProp('Aranceles (%)'),
                'costeDespacho'   => $this->numProp('Coste despacho'),
                'gastoImpKg'      => $this->numProp('Gasto imp/kg'),
                'costeKg'         => $this->numProp('Coste/kg'),
                'incoterm'        => $this->strProp('Incoterm', ['EXW', 'CIF', 'CIP', 'CFR']),
                'forwarderer'     => $this->strProp('Transitario'),
                'documentacion'   => $this->boolProp('Documentación'),
                'observaciones'   => $this->strProp('Observaciones'),
            ], ['id']),
            $this->tool('delete_importacion', 'Elimina una importación por su ID.', [
                'id' => $this->numProp('ID de la importación a eliminar'),
            ], ['id']),
            $this->tool('list_proveedores', 'Obtiene los proveedores disponibles.', []),
        ];
    }

    protected function executeTool(string $name, array $args, string $jwt): string
    {
        return match ($name) {
            'list_importaciones'  => $this->toJson($this->apiClient->get('/api/importaciones', $jwt)),
            'get_importacion'     => $this->toJson($this->apiClient->get('/api/importaciones/' . (int) $args['id'], $jwt)),
            'create_importacion'  => $this->toJson($this->apiClient->post('/api/importaciones', $jwt, $args)),
            'update_importacion'  => $this->toJson($this->apiClient->put('/api/importaciones/' . (int) $args['id'], $jwt, $args)),
            'delete_importacion'  => $this->apiClient->delete('/api/importaciones/' . (int) $args['id'], $jwt)
                ? 'Importación eliminada correctamente.'
                : 'Error al eliminar la importación.',
            'list_proveedores'    => $this->toJson($this->apiClient->get('/api/proveedores', $jwt)),

            default => json_encode(['error' => "Herramienta desconocida: {$name}"]),
        };
    }
}
