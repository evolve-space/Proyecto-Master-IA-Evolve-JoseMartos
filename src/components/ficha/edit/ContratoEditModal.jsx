import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import { F, FormActions, inp } from '../formUi'
import { contratosService } from '../../../features/contratos/services/contratosService'
import { proveedoresService } from '../../../features/proveedores/services/proveedoresService'

const EMPTY = {
  proveedorId: '',
  fecha: '',
  numeroContrato: '',
  producto: '',
  precio: '',
  grado: 'FOOD',
  cantidad: '',
  cantidadPedida: '0',
  cantidadPendiente: '',
  fechaCaducidad: '',
  documentacion: false,
  observaciones: '',
}

export default function ContratoEditModal({ open, entity, onClose, onSaved }) {
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
      const updated = await contratosService.update(entity.id, form)
      onSaved?.(updated)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Editar — ${entity.numeroContrato}`} onClose={onClose} size="lg">
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
        <F label="Nº Contrato">
          <input value={form.numeroContrato ?? ''} onChange={(e) => set('numeroContrato', e.target.value)} className={inp} />
        </F>
        <F label="Grado">
          <select value={form.grado ?? 'FOOD'} onChange={(e) => set('grado', e.target.value)} className={inp}>
            <option>BIO</option>
            <option>HALAL</option>
            <option>KOSHER</option>
            <option>FOOD</option>
          </select>
        </F>
        <F label="Producto" full>
          <input value={form.producto ?? ''} onChange={(e) => set('producto', e.target.value)} className={inp} />
        </F>
        <F label="Precio">
          <input type="number" step="0.0001" value={form.precio ?? ''} onChange={(e) => set('precio', e.target.value)} className={inp} />
        </F>
        <F label="Cantidad (kg)">
          <input type="number" step="0.001" value={form.cantidad ?? ''} onChange={(e) => set('cantidad', e.target.value)} className={inp} />
        </F>
        <F label="Cantidad pedida (kg)">
          <input type="number" step="0.001" value={form.cantidadPedida ?? ''} onChange={(e) => set('cantidadPedida', e.target.value)} className={inp} />
        </F>
        <F label="Cantidad pendiente (kg)">
          <input type="number" step="0.001" value={form.cantidadPendiente ?? ''} onChange={(e) => set('cantidadPendiente', e.target.value)} className={inp} />
        </F>
        <F label="Fecha caducidad">
          <input type="date" value={form.fechaCaducidad ?? ''} onChange={(e) => set('fechaCaducidad', e.target.value)} className={inp} />
        </F>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="doc-contrato-edit" checked={!!form.documentacion} onChange={(e) => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="doc-contrato-edit" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
        </div>
        <F label="Observaciones" full>
          <textarea rows={2} value={form.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} className={`${inp} resize-none`} />
        </F>
        <FormActions onCancel={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
