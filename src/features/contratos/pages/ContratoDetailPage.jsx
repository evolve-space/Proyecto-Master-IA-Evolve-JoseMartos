import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EntityFichaView from '../../../components/ficha/EntityFichaView'
import ContratoEditModal from '../../../components/ficha/edit/ContratoEditModal'
import { fmtDate, useEntityFicha } from '../../../components/ficha/useEntityFicha'
import { contratosService } from '../services/contratosService'

export default function ContratoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { entity, stats, items, loading, error, reload } = useEntityFicha(id, contratosService.getFicha)
  const e = entity

  const caduca = e?.fechaCaducidad ? new Date(e.fechaCaducidad) : null
  const proxVencer = caduca && caduca > new Date() && caduca <= new Date(Date.now() + 30 * 86400000)

  return (
    <>
      <EntityFichaView
        loading={loading}
        error={error}
        onEdit={() => setEditOpen(true)}
        backTo={() => navigate('/contratos')}
        backLabel="Volver a contratos"
        icon="description"
        entityId={e?.id}
        title={e?.numeroContrato || 'Contrato'}
        subtitle={e?.producto}
        badges={[
          e?.grado && { label: e.grado, className: 'bg-slate-100 text-slate-700 border border-slate-200' },
          proxVencer && { label: 'Caduca pronto', className: 'bg-amber-50 text-amber-800 border border-amber-200' },
          e?.documentacion && { label: 'Doc. completa', className: 'bg-primary/10 text-primary border border-primary/20' },
        ].filter(Boolean)}
        highlights={[
          e?.precio && { label: 'Precio', value: `${parseFloat(e.precio).toFixed(2)} €/kg` },
          e?.cantidad && { label: 'Cantidad total', value: `${parseFloat(e.cantidad).toLocaleString('es-ES')} kg` },
          e?.cantidadPendiente != null && {
            label: 'Pendiente',
            value: `${parseFloat(e.cantidadPendiente).toLocaleString('es-ES')} kg`,
          },
          e?.fechaCaducidad && { label: 'Caducidad', value: fmtDate(e.fechaCaducidad) },
        ].filter(Boolean)}
        stats={[
          { icon: 'mail', label: 'Correos vinculados', value: stats.emails },
          { icon: 'event', label: 'Eventos vinculados', value: stats.eventos },
        ]}
        proveedor={e?.proveedorId ? { id: e.proveedorId, nombre: e.proveedorNombre } : null}
        fields={e ? [
          ['Fecha contrato', fmtDate(e.fecha)],
          ['Producto', e.producto],
          ['Cantidad pedida', e.cantidadPedida ? `${parseFloat(e.cantidadPedida).toLocaleString('es-ES')} kg` : null],
          ['Observaciones', e.observaciones],
        ] : []}
        items={items}
      />
      <ContratoEditModal
        open={editOpen}
        entity={e}
        onClose={() => setEditOpen(false)}
        onSaved={reload}
      />
    </>
  )
}
