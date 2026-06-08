import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EntityFichaView from '../../../components/ficha/EntityFichaView'
import ProveedorEditModal from '../../../components/ficha/edit/ProveedorEditModal'
import { proveedoresService } from '../services/proveedoresService'

const tipoStyle = {
  Fabricante: 'bg-primary/10 text-primary border border-primary/20',
  Distribuidor: 'bg-secondary-container/30 text-secondary border border-secondary/20',
}

export default function ProviderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const type = filter === 'all' ? undefined : filter
    proveedoresService
      .getTimeline(id, type)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, filter, tick])

  const p = data?.proveedor
  const stats = data?.stats ?? {}
  const items = data?.items ?? []

  return (
    <>
      <EntityFichaView
        loading={loading}
        error={error}
        onEdit={() => setEditOpen(true)}
        backTo={() => navigate('/proveedores')}
        backLabel="Volver a proveedores"
        avatarLetter={p?.nombre?.[0]}
        entityId={p?.id}
        title={p?.nombre || 'Proveedor'}
        subtitle={[p?.actividad, p?.cifNif].filter(Boolean).join(' · ')}
        badges={[
          p?.tipo && { label: p.tipo, className: tipoStyle[p.tipo] ?? 'bg-slate-100 text-slate-600' },
          p?.incoterm && { label: p.incoterm, className: 'bg-slate-100 text-slate-600 border border-slate-200' },
          {
            label: p?.documentacion ? 'Documentación completa' : 'Documentación pendiente',
            className: p?.documentacion
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-amber-50 text-amber-800 border border-amber-200',
          },
        ].filter(Boolean)}
        highlights={[
          p?.email && { label: 'Email', value: p.email },
          p?.telefono && { label: 'Teléfono', value: p.telefono },
          p?.formaPago && { label: 'Forma de pago', value: `${p.formaPago} días` },
          p?.contactoPrincipal && { label: 'Contacto', value: p.contactoPrincipal },
        ].filter(Boolean)}
        stats={[
          { icon: 'mail', label: 'Correos', value: stats.emails },
          { icon: 'event', label: 'Eventos', value: stats.eventos },
          { icon: 'local_offer', label: 'Ofertas', value: stats.ofertas },
          { icon: 'science', label: 'Muestras', value: stats.muestras },
          { icon: 'description', label: 'Contratos', value: stats.contratos },
          { icon: 'local_shipping', label: 'Importaciones', value: stats.importaciones },
        ]}
        fields={p ? [
          ['CIF/NIF', p.cifNif],
          ['Actividad', p.actividad],
          ['Certificaciones', p.certificaciones],
          ['Móvil', p.movil],
          ['Web', p.web],
          ['Dirección facturación', p.direccionFacturacion],
          ['Observaciones', p.observaciones],
        ] : []}
        items={items}
        timelineFilter={filter}
        onTimelineFilterChange={setFilter}
        showTimelineFilters
        activityTitle="Historial de actividad"
      />
      <ProveedorEditModal
        open={editOpen}
        entity={p}
        onClose={() => setEditOpen(false)}
        onSaved={reload}
      />
    </>
  )
}
