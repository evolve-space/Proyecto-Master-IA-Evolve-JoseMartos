import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EntityFichaView from '../../../components/ficha/EntityFichaView'
import OfertaEditModal from '../../../components/ficha/edit/OfertaEditModal'
import { fmtDate, useEntityFicha } from '../../../components/ficha/useEntityFicha'
import { ofertasService } from '../services/ofertasService'

const tipoStyle = {
  Contrato: 'bg-primary/10 text-primary border border-primary/20',
  Pedido: 'bg-secondary-container/30 text-secondary border border-secondary/20',
}

export default function OfertaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { entity, stats, items, loading, error, reload } = useEntityFicha(id, ofertasService.getFicha)
  const e = entity

  return (
    <>
      <EntityFichaView
        loading={loading}
        error={error}
        onEdit={() => setEditOpen(true)}
        backTo={() => navigate('/ofertas')}
        backLabel="Volver a ofertas"
        icon="local_offer"
        entityId={e?.id}
        title={e?.producto || 'Oferta'}
        subtitle={e?.proveedorNombre}
        badges={[
          e?.tipo && { label: e.tipo, className: tipoStyle[e.tipo] ?? 'bg-slate-100 text-slate-600' },
          e?.grado && { label: e.grado, className: 'bg-slate-100 text-slate-600 border border-slate-200' },
          e?.muestra && { label: 'Muestra solicitada', className: 'bg-amber-50 text-amber-800 border border-amber-200' },
        ].filter(Boolean)}
        highlights={[
          e?.precio && {
            label: 'Precio',
            value: `${parseFloat(e.precio).toFixed(2)} ${e.moneda === 'USD' ? '$' : '€'}/kg`,
          },
          e?.cantidad && {
            label: 'Cantidad',
            value: `${parseFloat(e.cantidad).toLocaleString('es-ES')} kg`,
          },
          e?.fecha && { label: 'Fecha', value: fmtDate(e.fecha) },
          e?.incoterm && { label: 'Incoterm', value: e.incoterm },
        ].filter(Boolean)}
        stats={[
          { icon: 'mail', label: 'Correos vinculados', value: stats.emails },
          { icon: 'event', label: 'Eventos vinculados', value: stats.eventos },
        ]}
        proveedor={e?.proveedorId ? { id: e.proveedorId, nombre: e.proveedorNombre } : null}
        fields={e ? [
          ['Moneda', e.moneda],
          ['Tipo', e.tipo],
          ['Grado', e.grado],
          ['Documentación', e.documentacion ? 'Completa' : 'Pendiente'],
          ['Observaciones', e.observaciones],
        ] : []}
        items={items}
      />
      <OfertaEditModal
        open={editOpen}
        entity={e}
        onClose={() => setEditOpen(false)}
        onSaved={reload}
      />
    </>
  )
}
