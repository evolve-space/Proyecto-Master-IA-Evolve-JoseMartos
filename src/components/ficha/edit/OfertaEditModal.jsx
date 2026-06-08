import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import { F, FormActions, inp } from '../formUi'
import { ofertasService } from '../../../features/ofertas/services/ofertasService'
import { proveedoresService } from '../../../features/proveedores/services/proveedoresService'

const EMPTY = {
  proveedorId: '',
  fecha: '',
  producto: '',
  grado: 'Food Grade',
  cantidad: '',
  precio: '',
  moneda: 'EUR',
  incoterm: 'CIF',
  muestra: false,
  tipo: 'Contrato',
  documentacion: false,
  observaciones: '',
}

export default function OfertaEditModal({ open, entity, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [proveedores, setProveedores] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(entity ? { ...EMPTY, ...entity } : EMPTY)
    proveedoresService.getAll().then(setProveedores).catch(() => setProveedores([]))
  }, [open, entity])

  if (!open || !entity?.id) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await ofertasService.update(entity.id, form)
      onSaved?.(updated)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Editar — ${entity.producto}`} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Proveedor *">
          <select required value={form.proveedorId ?? ''} onChange={(e) => set('proveedorId', Number(e.target.value))} className={inp}>
            <option value="">— Seleccionar —</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </F>
        <F label="Fecha">
          <input type="date" value={form.fecha ?? ''} onChange={(e) => set('fecha', e.target.value)} className={inp} />
        </F>
        <F label="Producto" full>
          <input value={form.producto ?? ''} onChange={(e) => set('producto', e.target.value)} className={inp} />
        </F>
        <F label="Grado">
          <select value={form.grado ?? 'Food Grade'} onChange={(e) => set('grado', e.target.value)} className={inp}>
            <option>Food Grade</option>
            <option>Feed Grade</option>
            <option>Reach</option>
          </select>
        </F>
        <F label="Tipo">
          <select value={form.tipo ?? 'Contrato'} onChange={(e) => set('tipo', e.target.value)} className={inp}>
            <option>Contrato</option>
            <option>Pedido</option>
          </select>
        </F>
        <F label="Cantidad (kg)">
          <input type="number" step="0.001" value={form.cantidad ?? ''} onChange={(e) => set('cantidad', e.target.value)} className={inp} />
        </F>
        <F label="Precio">
          <input type="number" step="0.0001" value={form.precio ?? ''} onChange={(e) => set('precio', e.target.value)} className={inp} />
        </F>
        <F label="Moneda">
          <select value={form.moneda ?? 'EUR'} onChange={(e) => set('moneda', e.target.value)} className={inp}>
            <option>EUR</option>
            <option>USD</option>
          </select>
        </F>
        <F label="Incoterm">
          <select value={form.incoterm ?? 'CIF'} onChange={(e) => set('incoterm', e.target.value)} className={inp}>
            <option>EXW</option>
            <option>CIF</option>
            <option>CIP</option>
            <option>CFR</option>
          </select>
        </F>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.muestra} onChange={(e) => set('muestra', e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-600">Muestra</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.documentacion} onChange={(e) => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-600">Documentación</span>
          </label>
        </div>
        <F label="Observaciones" full>
          <textarea rows={2} value={form.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} className={`${inp} resize-none`} />
        </F>
        <FormActions onCancel={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
