import { useState, useEffect } from 'react'
import { proveedoresService } from '../services/proveedoresService'
import Modal from '../../../components/ui/Modal'

const tipoStyle = {
  Fabricante:   'bg-primary-container/20 text-primary',
  Distribuidor: 'bg-secondary-container text-secondary',
}

const inp = 'w-full border border-[#E2E4D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

function F({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const EMPTY = {
  nombre: '', cifNif: '', telefono: '', movil: '', email: '', web: '',
  actividad: '', direccionFacturacion: '', tipo: 'Fabricante',
  certificaciones: '', contactoPrincipal: '', formaPago: 30,
  incoterm: 'CIF', documentacion: false, observaciones: '',
}

export default function ProvidersPage() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [modal, setModal]             = useState(null)   // null | 'create' | 'edit' | 'detail' | 'delete'
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [menuOpen, setMenuOpen]       = useState(null)
  const [search, setSearch]           = useState('')

  useEffect(() => {
    proveedoresService.getAll()
      .then(setProveedores)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const h = () => setMenuOpen(null)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [menuOpen])

  const openCreate = ()  => { setForm(EMPTY); setSelected(null); setModal('create') }
  const openEdit   = p   => { setForm({ ...EMPTY, ...p }); setSelected(p); setModal('edit') }
  const openDetail = p   => { setSelected(p); setModal('detail') }
  const openDelete = p   => { setSelected(p); setModal('delete') }
  const close      = ()  => { setModal(null); setSelected(null) }
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const created = await proveedoresService.create(form)
        setProveedores(prev => [...prev, created])
      } else {
        const updated = await proveedoresService.update(selected.id, form)
        setProveedores(prev => prev.map(x => x.id === updated.id ? updated : x))
      }
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await proveedoresService.remove(selected.id)
      setProveedores(prev => prev.filter(x => x.id !== selected.id))
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <p className="p-lg text-slate-500">Cargando proveedores…</p>
  if (error)   return <p className="p-lg text-red-500">Error: {error}</p>

  const q = search.toLowerCase()
  const filtered = q
    ? proveedores.filter(p =>
        [p.nombre, p.cifNif, p.actividad, p.email, p.contactoPrincipal, p.tipo]
          .some(v => (v ?? '').toLowerCase().includes(q))
      )
    : proveedores

  return (
    <div>
      {/* Cabecera */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Proveedores</h2>
          <p className="text-body-sm text-slate-500 mt-1">{filtered.length} de {proveedores.length} proveedores</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar proveedor…"
              className="pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">add</span>
            Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">CIF/NIF</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Actividad</th>
                <th className="px-6 py-4">Certificaciones</th>
                <th className="px-6 py-4">Cont. Principal</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Forma Pago</th>
                <th className="px-6 py-4">Incoterm</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-slate-400 text-sm">Sin resultados para «{search}»</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center font-bold text-primary text-sm">{p.nombre[0]}</div>
                      <div>
                        <p className="font-label-md text-on-surface">{p.nombre}</p>
                        <p className="text-body-sm text-slate-400">{p.telefono}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm font-mono text-slate-500">{p.cifNif}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${tipoStyle[p.tipo] ?? 'bg-slate-100 text-slate-500'}`}>{p.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.actividad}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.certificaciones}</td>
                  <td className="px-6 py-4 text-body-sm">{p.contactoPrincipal}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.email}</td>
                  <td className="px-6 py-4 text-body-sm">{p.formaPago} días</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.incoterm}</td>
                  <td className="px-6 py-4 text-body-sm">{p.documentacion ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id) }}
                      className="text-slate-400 hover:text-primary"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {menuOpen === p.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-[#E2E4D9] rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { openDetail(p); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">visibility</span> Ver detalle
                        </button>
                        <button onClick={() => { openEdit(p); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                        <button onClick={() => { openDelete(p); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600">
                          <span className="material-symbols-outlined text-base">delete</span> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Detalle â”€â”€ */}
      {modal === 'detail' && selected && (
        <Modal title={selected.nombre} onClose={close} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['CIF/NIF', selected.cifNif],
              ['Tipo', selected.tipo],
              ['Actividad', selected.actividad],
              ['Certificaciones', selected.certificaciones],
              ['Teléfono', selected.telefono],
              ['Móvil', selected.movil],
              ['E-mail', selected.email],
              ['Web', selected.web],
              ['Dirección facturación', selected.direccionFacturacion],
              ['Contacto principal', selected.contactoPrincipal],
              ['Forma de pago', selected.formaPago ? `${selected.formaPago} días` : '-'],
              ['Incoterm', selected.incoterm],
              ['Documentación', selected.documentacion ? 'Sí' : 'No'],
              ['Observaciones', selected.observaciones ?? '-'],
            ].map(([l, v]) => (
              <div key={l} className="border-b border-slate-100 pb-3">
                <p className="text-xs text-slate-400 uppercase font-medium mb-0.5">{l}</p>
                <p className="text-sm text-on-surface">{v || '-'}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Crear / Editar */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Nuevo Proveedor' : `Editar: ${selected.nombre}`} onClose={close} size="lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Nombre *"><input required value={form.nombre} onChange={e => set('nombre', e.target.value)} className={inp} /></F>
            <F label="CIF/NIF"><input value={form.cifNif ?? ''} onChange={e => set('cifNif', e.target.value)} className={inp} /></F>
            <F label="Tipo">
              <select value={form.tipo ?? 'Fabricante'} onChange={e => set('tipo', e.target.value)} className={inp}>
                <option>Fabricante</option><option>Distribuidor</option>
              </select>
            </F>
            <F label="Actividad"><input value={form.actividad ?? ''} onChange={e => set('actividad', e.target.value)} className={inp} /></F>
            <F label="Teléfono"><input value={form.telefono ?? ''} onChange={e => set('telefono', e.target.value)} className={inp} /></F>
            <F label="Móvil"><input value={form.movil ?? ''} onChange={e => set('movil', e.target.value)} className={inp} /></F>
            <F label="E-mail"><input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} className={inp} /></F>
            <F label="Web"><input value={form.web ?? ''} onChange={e => set('web', e.target.value)} className={inp} /></F>
            <F label="Dirección facturación" full><input value={form.direccionFacturacion ?? ''} onChange={e => set('direccionFacturacion', e.target.value)} className={inp} /></F>
            <F label="Certificaciones"><input value={form.certificaciones ?? ''} onChange={e => set('certificaciones', e.target.value)} className={inp} /></F>
            <F label="Contacto principal"><input value={form.contactoPrincipal ?? ''} onChange={e => set('contactoPrincipal', e.target.value)} className={inp} /></F>
            <F label="Forma de pago (días)">
              <select value={form.formaPago ?? 30} onChange={e => set('formaPago', Number(e.target.value))} className={inp}>
                <option value={30}>30</option><option value={60}>60</option><option value={75}>75</option>
              </select>
            </F>
            <F label="Incoterm">
              <select value={form.incoterm ?? 'CIF'} onChange={e => set('incoterm', e.target.value)} className={inp}>
                <option>EXW</option><option>CIF</option><option>CIP</option><option>CFR</option>
              </select>
            </F>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="doc-p" checked={!!form.documentacion} onChange={e => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="doc-p" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
            </div>
            <F label="Observaciones" full>
              <textarea rows={2} value={form.observaciones ?? ''} onChange={e => set('observaciones', e.target.value)} className={inp + ' resize-none'} />
            </F>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Guardando…' : modal === 'create' ? 'Crear' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Eliminar */}
      {modal === 'delete' && selected && (
        <Modal title="Eliminar proveedor" onClose={close} size="sm">
          <p className="text-sm text-slate-600 mb-6">¿Eliminar <strong>{selected.nombre}</strong>? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3">
            <button onClick={close} className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
