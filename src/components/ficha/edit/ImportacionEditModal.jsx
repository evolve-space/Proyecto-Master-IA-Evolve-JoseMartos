import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import { F, FormActions, inp } from '../formUi'
import { importacionesService } from '../../../features/importaciones/services/importacionesService'
import { proveedoresService } from '../../../features/proveedores/services/proveedoresService'

const EMPTY = {
  proveedorId: '',
  fechaDuaAlbaran: '',
  fechaFactura: '',
  producto: '',
  cantidad: '',
  importeEur: '',
  aranceles: '0',
  costeDespacho: '',
  gastoImpKg: '',
  costeKg: '',
  importeUsd: '',
  tipoCambio: '',
  forwarderer: '',
  incoterm: 'CIF',
  documentacion: false,
  observaciones: '',
}

export default function ImportacionEditModal({ open, entity, onClose, onSaved }) {
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
      const updated = await importacionesService.update(entity.id, form)
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
        <F label="Fecha DUA/Albarán">
          <input type="date" value={form.fechaDuaAlbaran ?? ''} onChange={(e) => set('fechaDuaAlbaran', e.target.value)} className={inp} />
        </F>
        <F label="Fecha Factura">
          <input type="date" value={form.fechaFactura ?? ''} onChange={(e) => set('fechaFactura', e.target.value)} className={inp} />
        </F>
        <F label="Incoterm">
          <select value={form.incoterm ?? 'CIF'} onChange={(e) => set('incoterm', e.target.value)} className={inp}>
            <option>EXW</option>
            <option>CIF</option>
            <option>CIP</option>
            <option>CFR</option>
          </select>
        </F>
        <F label="Producto" full>
          <input value={form.producto ?? ''} onChange={(e) => set('producto', e.target.value)} className={inp} />
        </F>
        <F label="Cantidad (kg)">
          <input type="number" step="0.001" value={form.cantidad ?? ''} onChange={(e) => set('cantidad', e.target.value)} className={inp} />
        </F>
        <F label="Importe EUR">
          <input type="number" step="0.01" value={form.importeEur ?? ''} onChange={(e) => set('importeEur', e.target.value)} className={inp} />
        </F>
        <F label="Importe USD">
          <input type="number" step="0.01" value={form.importeUsd ?? ''} onChange={(e) => set('importeUsd', e.target.value)} className={inp} />
        </F>
        <F label="Tipo de cambio">
          <input type="number" step="0.0001" value={form.tipoCambio ?? ''} onChange={(e) => set('tipoCambio', e.target.value)} className={inp} />
        </F>
        <F label="Aranceles">
          <input type="number" step="0.01" value={form.aranceles ?? ''} onChange={(e) => set('aranceles', e.target.value)} className={inp} />
        </F>
        <F label="Coste despacho">
          <input type="number" step="0.01" value={form.costeDespacho ?? ''} onChange={(e) => set('costeDespacho', e.target.value)} className={inp} />
        </F>
        <F label="Gasto imp./kg">
          <input type="number" step="0.0001" value={form.gastoImpKg ?? ''} onChange={(e) => set('gastoImpKg', e.target.value)} className={inp} />
        </F>
        <F label="Coste/kg">
          <input type="number" step="0.0001" value={form.costeKg ?? ''} onChange={(e) => set('costeKg', e.target.value)} className={inp} />
        </F>
        <F label="Forwarder">
          <input value={form.forwarderer ?? ''} onChange={(e) => set('forwarderer', e.target.value)} className={inp} />
        </F>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="doc-import-edit" checked={!!form.documentacion} onChange={(e) => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="doc-import-edit" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
        </div>
        <F label="Observaciones" full>
          <textarea rows={2} value={form.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} className={`${inp} resize-none`} />
        </F>
        <FormActions onCancel={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
