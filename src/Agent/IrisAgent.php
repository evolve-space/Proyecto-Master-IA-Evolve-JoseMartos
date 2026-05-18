<?php

namespace App\Agent;

/**
 * Iris — Especialista en Muestras.
 *
 * Herramientas disponibles (CRUD completo):
 *   Muestras: list, get, create, update, delete
 */
final class IrisAgent extends AbstractAgent
{
    public function getId(): string   { return 'iris'; }
    public function getName(): string { return 'Iris'; }

    protected function getSystemPrompt(array $context): string
    {
        $rol    = $context['userRole'] ?? 'normal';
        $pagina = $context['currentPage'] ?? '';

        return $this->loadPersona('Iris') . "\n\nContexto: rol={$rol}, página={$pagina}";
    }

    protected function getTools(): array
    {
        return [
            $this->tool('list_muestras', 'Obtiene la lista de todas las muestras.', []),
            $this->tool('get_muestra', 'Obtiene el detalle de una muestra por su ID.', [
                'id' => $this->numProp('ID de la muestra'),
            ], ['id']),
            $this->tool('create_muestra', 'Crea una nueva muestra.', [
                'proveedorId'  => $this->numProp('ID del proveedor (obligatorio)'),
                'producto'     => $this->strProp('Producto de la muestra'),
                'fecha'        => $this->strProp('Fecha de solicitud (YYYY-MM-DD)'),
                'estado'       => $this->strProp('Estado de la muestra', ['Compra', 'Análisis', 'Pendiente']),
                'idLote'       => $this->strProp('ID de lote del proveedor'),
                'grado'        => $this->strProp('Grado del producto', ['BIO', 'HALAL', 'KOSHER', 'FOOD']),
                'usuarioId'    => $this->numProp('ID del usuario responsable'),
                'documentacion'=> $this->boolProp('¿Documentación en regla?'),
                'observaciones'=> $this->strProp('Observaciones'),
            ], ['proveedorId']),
            $this->tool('update_muestra', 'Actualiza una muestra existente.', [
                'id'           => $this->numProp('ID de la muestra a actualizar'),
                'proveedorId'  => $this->numProp('ID del proveedor'),
                'producto'     => $this->strProp('Producto'),
                'fecha'        => $this->strProp('Fecha (YYYY-MM-DD)'),
                'estado'       => $this->strProp('Estado', ['Compra', 'Análisis', 'Pendiente']),
                'idLote'       => $this->strProp('ID lote'),
                'grado'        => $this->strProp('Grado', ['BIO', 'HALAL', 'KOSHER', 'FOOD']),
                'usuarioId'    => $this->numProp('ID usuario responsable'),
                'documentacion'=> $this->boolProp('Documentación'),
                'observaciones'=> $this->strProp('Observaciones'),
            ], ['id']),
            $this->tool('delete_muestra', 'Elimina una muestra por su ID.', [
                'id' => $this->numProp('ID de la muestra a eliminar'),
            ], ['id']),
            $this->tool('list_proveedores', 'Obtiene los proveedores disponibles.', []),
        ];
    }

    protected function executeTool(string $name, array $args, string $jwt): string
    {
        return match ($name) {
            'list_muestras'   => $this->toJson($this->apiClient->get('/api/muestras', $jwt)),
            'get_muestra'     => $this->toJson($this->apiClient->get('/api/muestras/' . (int) $args['id'], $jwt)),
            'create_muestra'  => $this->toJson($this->apiClient->post('/api/muestras', $jwt, $args)),
            'update_muestra'  => $this->toJson($this->apiClient->put('/api/muestras/' . (int) $args['id'], $jwt, $args)),
            'delete_muestra'  => $this->apiClient->delete('/api/muestras/' . (int) $args['id'], $jwt)
                ? 'Muestra eliminada correctamente.'
                : 'Error al eliminar la muestra.',
            'list_proveedores' => $this->toJson($this->apiClient->get('/api/proveedores', $jwt)),

            default => json_encode(['error' => "Herramienta desconocida: {$name}"]),
        };
    }
}
