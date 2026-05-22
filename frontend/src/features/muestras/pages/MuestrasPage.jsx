import { useState, useEffect } from 'react'
import { muestrasService } from '../services/muestrasService'
import { proveedoresService } from '../../proveedores/services/proveedoresService'
import { usuariosService } from '../../usuarios/services/usuariosService'
import Modal from '../../../components/ui/Modal'

const estadoStyle = {
  'Análisis':  'bg-secondary-container text-secondary',
  'Compra':    'bg-primary-container/20 text-primary',
  'Pendiente': 'bg-tertiary-fixed text-on-tertiary-container',
}

const estadoIcon = {
  'Análisis':  'biotech',
  'Compra':    'check_circle',
  'Pendiente': 'schedule',
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

function fmtDate(d) {
  if (!d) return '-'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const EMPTY = {
  proveedorId: '', usuarioId: '', fecha: '', estado: 'Pendiente',
  idLote: '', producto: '', grado: 'FOOD', documentacion: false, observaciones: '',
}

export default function MuestrasPage() {
  const [muestras, setMuestras]       = useState([])
  const [proveedores, setProveedores] = useState([])
  const [usuarios, setUsuarios]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [modal, setModal]             = useState(null)
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [menuOpen, setMenuOpen]       = useState(null)
  const [search, setSearch]           = useState('')

  useEffect(() => {
    Promise.all([muestrasService.getAll(), proveedoresService.getAll(), usuariosService.getAll()])
      .then(([m, p, u]) => { setMuestras(m); setProveedores(p); setUsuarios(u) })
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
  const openEdit   = m   => { setForm({ ...EMPTY, ...m }); setSelected(m); setModal('edit') }
  const openDetail = m   => { setSelected(m); setModal('detail') }
  const openDelete = m   => { setSelected(m); setModal('delete') }
  const close      = ()  => { setModal(null); setSelected(null) }
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, usuarioId: form.usuarioId || null }
      if (modal === 'create') {
        const created = await muestrasService.create(payload)
        setMuestras(prev => [...prev, created])
      } else {
        const updated = await muestrasService.update(selected.id, payload)
        setMuestras(prev => prev.map(x => x.id === updated.id ? updated : x))
      }
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await muestrasService.remove(selected.id)
      setMuestras(prev => prev.filter(x => x.id !== selected.id))
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <p className="p-lg text-slate-500">Cargando muestras…</p>
  if (error)   return <p className="p-lg text-red-500">Error: {error}</p>

  const q = search.toLowerCase()
  const filtered = q
    ? muestras.filter(m =>
        [m.proveedorNombre, m.producto, m.grado, m.estado, m.idLote, m.usuarioNombre]
          .some(v => (v ?? '').toLowerCase().includes(q))
      )
    : muestras

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Muestras</h2>
          <p className="text-body-sm text-slate-500 mt-1">{filtered.length} de {muestras.length} muestras</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar muestra…"
              className="pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">add</span>
            Nueva Muestra
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter mb-xl">
        {['Análisis', 'Compra', 'Pendiente'].map(estado => (
          <div key={estado} className="bg-white border border-[#E2E4D9] p-md rounded-xl shadow-sm flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">{estadoIcon[estado]}</span>
            <div>
              <p className="text-body-sm text-slate-500">{estado}</p>
              <p className="font-h3 text-h3 text-on-surface">{muestras.filter(m => m.estado === estado).length}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Id Lote</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Observaciones</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400 text-sm">Sin resultados para «{search}»</td></tr>
              )}
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{fmtDate(m.fecha)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{m.proveedorNombre?.[0]}</div>
                      <span className="text-body-sm">{m.proveedorNombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${estadoStyle[m.estado] ?? 'bg-slate-100 text-slate-500'}`}>{m.estado}</span>
                  </td>
                  <td className="px-6 py-4 font-label-md text-on-surface">{m.idLote}</td>
                  <td className="px-6 py-4 text-body-sm">{m.producto}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{m.grado}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{m.usuarioNombre ?? '-'}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-400 max-w-[200px] truncate">{m.observaciones ?? '-'}</td>
                  <td className="px-6 py-4 text-body-sm">{m.documentacion ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === m.id ? null : m.id) }} className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {menuOpen === m.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-[#E2E4D9] rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { openDetail(m); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">visibility</span> Ver detalle
                        </button>
                        <button onClick={() => { openEdit(m); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                        <button onClick={() => { openDelete(m); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600">
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

      {modal === 'detail' && selected && (
        <Modal title={`Muestra — ${selected.idLote}`} onClose={close} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['Fecha', fmtDate(selected.fecha)],
              ['Proveedor', selected.proveedorNombre],
              ['Estado', selected.estado],
              ['Id Lote', selected.idLote],
              ['Producto', selected.producto],
              ['Grado', selected.grado],
              ['Usuario', selected.usuarioNombre ?? '-'],
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

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Nueva Muestra' : `Editar: ${selected.idLote}`} onClose={close} size="lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Proveedor *">
              <select required value={form.proveedorId ?? ''} onChange={e => set('proveedorId', Number(e.target.value))} className={inp}>
                <option value="">-- Seleccionar --</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </F>
            <F label="Usuario (opcional)">
              <select value={form.usuarioId ?? ''} onChange={e => set('usuarioId', e.target.value ? Number(e.target.value) : '')} className={inp}>
                <option value="">-- Sin asignar --</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </F>
            <F label="Fecha"><input type="date" value={form.fecha ?? ''} onChange={e => set('fecha', e.target.value)} className={inp} /></F>
            <F label="Estado">
              <select value={form.estado ?? 'Pendiente'} onChange={e => set('estado', e.target.value)} className={inp}>
                <option>Pendiente</option><option>Análisis</option><option>Compra</option>
              </select>
            </F>
            <F label="Id Lote"><input value={form.idLote ?? ''} onChange={e => set('idLote', e.target.value)} className={inp} /></F>
            <F label="Grado">
              <select value={form.grado ?? 'FOOD'} onChange={e => set('grado', e.target.value)} className={inp}>
                <option>BIO</option><option>HALAL</option><option>KOSHER</option><option>FOOD</option>
              </select>
            </F>
            <F label="Producto" full><input value={form.producto ?? ''} onChange={e => set('producto', e.target.value)} className={inp} /></F>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="doc-m" checked={!!form.documentacion} onChange={e => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="doc-m" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
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

      {modal === 'delete' && selected && (
        <Modal title="Eliminar muestra" onClose={close} size="sm">
          <p className="text-sm text-slate-600 mb-6">¿Eliminar muestra <strong>{selected.idLote}</strong>? Esta acción no se puede deshacer.</p>
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