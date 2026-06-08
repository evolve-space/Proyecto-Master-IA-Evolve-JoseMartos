import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EntityFichaView from '../../../components/ficha/EntityFichaView'
import ImportacionEditModal from '../../../components/ficha/edit/ImportacionEditModal'
import { fmtDate, useEntityFicha } from '../../../components/ficha/useEntityFicha'
import { importacionesService } from '../services/importacionesService'

export default function ImportacionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { entity, stats, items, loading, error, reload } = useEntityFicha(id, importacionesService.getFicha)
  const e = entity

  return (
    <>
      <EntityFichaView
        loading={loading}
        error={error}
        onEdit={() => setEditOpen(true)}
        backTo={() => navigate('/importaciones')}
        backLabel="Volver a importaciones"
        icon="local_shipping"
        entityId={e?.id}
        title={e?.producto || 'Importación'}
        subtitle={e?.proveedorNombre}
        badges={[
          e?.incoterm && { label: e.incoterm, className: 'bg-slate-100 text-slate-700 border border-slate-200' },
          e?.forwarderer && { label: e.forwarderer, className: 'bg-sky-50 text-sky-800 border border-sky-100' },
        ].filter(Boolean)}
        highlights={[
          e?.importeEur && {
            label: 'Importe EUR',
            value: parseFloat(e.importeEur).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
          },
          e?.cantidad && {
            label: 'Cantidad',
            value: `${parseFloat(e.cantidad).toLocaleString('es-ES')} kg`,
          },
          e?.costeKg && { label: 'Coste/kg', value: `${parseFloat(e.costeKg).toFixed(4)} €` },
          e?.fechaDuaAlbaran && { label: 'DUA / Albarán', value: fmtDate(e.fechaDuaAlbaran) },
        ].filter(Boolean)}
        stats={[
          { icon: 'mail', label: 'Correos vinculados', value: stats.emails },
          { icon: 'event', label: 'Eventos vinculados', value: stats.eventos },
        ]}
        proveedor={e?.proveedorId ? { id: e.proveedorId, nombre: e.proveedorNombre } : null}
        fields={e ? [
          ['Fecha factura', fmtDate(e.fechaFactura)],
          ['Importe USD', e.importeUsd ? parseFloat(e.importeUsd).toLocaleString('es-ES', { style: 'currency', currency: 'USD' }) : null],
          ['Tipo de cambio', e.tipoCambio],
          ['Aranceles', e.aranceles],
          ['Coste despacho', e.costeDespacho],
          ['Gasto imp./kg', e.gastoImpKg],
          ['Documentación', e.documentacion ? 'Completa' : 'Pendiente'],
          ['Observaciones', e.observaciones],
        ] : []}
        items={items}
      />
      <ImportacionEditModal
        open={editOpen}
        entity={e}
        onClose={() => setEditOpen(false)}
        onSaved={reload}
      />
    </>
  )
}
