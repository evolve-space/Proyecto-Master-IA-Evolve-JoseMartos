import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import { F, FormActions, inp } from '../formUi'
import { muestrasService } from '../../../features/muestras/services/muestrasService'
import { proveedoresService } from '../../../features/proveedores/services/proveedoresService'
import { usuariosService } from '../../../features/usuarios/services/usuariosService'

const EMPTY = {
  proveedorId: '',
  usuarioId: '',
  fecha: '',
  estado: 'Pendiente',
  idLote: '',
  producto: '',
  grado: 'FOOD',
  documentacion: false,
  observaciones: '',
}

export default function MuestraEditModal({ open, entity, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [proveedores, setProveedores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(entity ? { ...EMPTY, ...entity } : EMPTY)
    Promise.all([
      proveedoresService.getAll(),
      usuariosService.getAll().catch(() => []),
    ]).then(([p, u]) => {
      setProveedores(p)
      setUsuarios(u ?? [])
    })
  }, [open, entity])

  if (!open || !entity?.id) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await muestrasService.update(entity.id, form)
      onSaved?.(updated)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Editar — ${entity.idLote || entity.producto}`} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Proveedor *">
          <select required value={form.proveedorId ?? ''} onChange={(e) => set('proveedorId', Number(e.target.value))} className={inp}>
            <option value="">— Seleccionar —</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </F>
        <F label="Usuario (opcional)">
          <select value={form.usuarioId ?? ''} onChange={(e) => set('usuarioId', e.target.value ? Number(e.target.value) : '')} className={inp}>
            <option value="">— Sin asignar —</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </F>
        <F label="Fecha">
          <input type="date" value={form.fecha ?? ''} onChange={(e) => set('fecha', e.target.value)} className={inp} />
        </F>
        <F label="Estado">
          <select value={form.estado ?? 'Pendiente'} onChange={(e) => set('estado', e.target.value)} className={inp}>
            <option>Pendiente</option>
            <option>Análisis</option>
            <option>Compra</option>
          </select>
        </F>
        <F label="Id Lote">
          <input value={form.idLote ?? ''} onChange={(e) => set('idLote', e.target.value)} className={inp} />
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
        <div className="flex items-center gap-2">
          <input type="checkbox" id="doc-muestra-edit" checked={!!form.documentacion} onChange={(e) => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="doc-muestra-edit" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
        </div>
        <F label="Observaciones" full>
          <textarea rows={2} value={form.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} className={`${inp} resize-none`} />
        </F>
        <FormActions onCancel={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
