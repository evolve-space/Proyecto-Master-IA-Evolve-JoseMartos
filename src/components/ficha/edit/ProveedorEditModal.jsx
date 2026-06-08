import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import { F, FormActions, inp } from '../formUi'
import { proveedoresService } from '../../../features/proveedores/services/proveedoresService'

const EMPTY = {
  nombre: '',
  cifNif: '',
  telefono: '',
  movil: '',
  email: '',
  web: '',
  actividad: '',
  direccionFacturacion: '',
  tipo: 'Fabricante',
  certificaciones: '',
  contactoPrincipal: '',
  formaPago: 30,
  incoterm: 'CIF',
  documentacion: false,
  observaciones: '',
}

export default function ProveedorEditModal({ open, entity, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(entity ? { ...EMPTY, ...entity } : EMPTY)
  }, [open, entity])

  if (!open || !entity?.id) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await proveedoresService.update(entity.id, form)
      onSaved?.(updated)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Editar — ${entity.nombre}`} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Nombre *">
          <input required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} className={inp} />
        </F>
        <F label="CIF/NIF">
          <input value={form.cifNif ?? ''} onChange={(e) => set('cifNif', e.target.value)} className={inp} />
        </F>
        <F label="Tipo">
          <select value={form.tipo ?? 'Fabricante'} onChange={(e) => set('tipo', e.target.value)} className={inp}>
            <option>Fabricante</option>
            <option>Distribuidor</option>
          </select>
        </F>
        <F label="Actividad">
          <input value={form.actividad ?? ''} onChange={(e) => set('actividad', e.target.value)} className={inp} />
        </F>
        <F label="Teléfono">
          <input value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} className={inp} />
        </F>
        <F label="Móvil">
          <input value={form.movil ?? ''} onChange={(e) => set('movil', e.target.value)} className={inp} />
        </F>
        <F label="E-mail">
          <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className={inp} />
        </F>
        <F label="Web">
          <input value={form.web ?? ''} onChange={(e) => set('web', e.target.value)} className={inp} />
        </F>
        <F label="Dirección facturación" full>
          <input value={form.direccionFacturacion ?? ''} onChange={(e) => set('direccionFacturacion', e.target.value)} className={inp} />
        </F>
        <F label="Certificaciones">
          <input value={form.certificaciones ?? ''} onChange={(e) => set('certificaciones', e.target.value)} className={inp} />
        </F>
        <F label="Contacto principal">
          <input value={form.contactoPrincipal ?? ''} onChange={(e) => set('contactoPrincipal', e.target.value)} className={inp} />
        </F>
        <F label="Forma de pago (días)">
          <select value={form.formaPago ?? 30} onChange={(e) => set('formaPago', Number(e.target.value))} className={inp}>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={75}>75</option>
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
        <div className="flex items-center gap-2">
          <input type="checkbox" id="doc-prov-edit" checked={!!form.documentacion} onChange={(e) => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="doc-prov-edit" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
        </div>
        <F label="Observaciones" full>
          <textarea rows={2} value={form.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} className={`${inp} resize-none`} />
        </F>
        <FormActions onCancel={onClose} saving={saving} />
      </form>
    </Modal>
  )
}
