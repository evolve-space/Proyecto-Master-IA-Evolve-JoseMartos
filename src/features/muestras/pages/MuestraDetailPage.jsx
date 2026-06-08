import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EntityFichaView from '../../../components/ficha/EntityFichaView'
import MuestraEditModal from '../../../components/ficha/edit/MuestraEditModal'
import { fmtDate, useEntityFicha } from '../../../components/ficha/useEntityFicha'
import { muestrasService } from '../services/muestrasService'

const estadoStyle = {
  'Análisis': 'bg-secondary-container/40 text-secondary border border-secondary/20',
  Compra: 'bg-primary/10 text-primary border border-primary/20',
  Pendiente: 'bg-amber-50 text-amber-800 border border-amber-200',
}

export default function MuestraDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { entity, stats, items, loading, error, reload } = useEntityFicha(id, muestrasService.getFicha)
  const e = entity

  return (
    <>
      <EntityFichaView
        loading={loading}
        error={error}
        onEdit={() => setEditOpen(true)}
        backTo={() => navigate('/muestras')}
        backLabel="Volver a muestras"
        icon="science"
        entityId={e?.id}
        title={e?.producto || 'Muestra'}
        subtitle={e?.proveedorNombre}
        badges={[
          e?.estado && { label: e.estado, className: estadoStyle[e.estado] ?? 'bg-slate-100 text-slate-600' },
          e?.grado && { label: e.grado, className: 'bg-slate-100 text-slate-700 border border-slate-200' },
        ].filter(Boolean)}
        highlights={[
          e?.idLote && { label: 'Lote', value: e.idLote },
          e?.fecha && { label: 'Fecha', value: fmtDate(e.fecha) },
          e?.usuarioNombre && { label: 'Responsable', value: e.usuarioNombre },
          { label: 'Documentación', value: e?.documentacion ? 'Completa' : 'Pendiente' },
        ].filter((h) => h.value)}
        stats={[
          { icon: 'mail', label: 'Correos vinculados', value: stats.emails },
          { icon: 'event', label: 'Eventos vinculados', value: stats.eventos },
        ]}
        proveedor={e?.proveedorId ? { id: e.proveedorId, nombre: e.proveedorNombre } : null}
        fields={e ? [
          ['Estado', e.estado],
          ['Grado', e.grado],
          ['Observaciones', e.observaciones],
        ] : []}
        items={items}
      />
      <MuestraEditModal
        open={editOpen}
        entity={e}
        onClose={() => setEditOpen(false)}
        onSaved={reload}
      />
    </>
  )
}
