import { useState, useEffect } from 'react'
import { contratosService } from '../services/contratosService'
import { proveedoresService } from '../../proveedores/services/proveedoresService'
import Modal from '../../../components/ui/Modal'

const gradoStyle = {
  BIO:   'bg-green-100 text-green-700',
  HALAL: 'bg-teal-100 text-teal-700',
  KOSHER:'bg-purple-100 text-purple-700',
  FOOD:  'bg-blue-100 text-blue-700',
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
  proveedorId: '', fecha: '', numeroContrato: '', producto: '',
  precio: '', grado: 'FOOD', cantidad: '', cantidadPedida: '0',
  cantidadPendiente: '', fechaCaducidad: '', documentacion: false, observaciones: '',
}

export default function ContratosPage() {
  const [contratos, setContratos]     = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [modal, setModal]             = useState(null)
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [menuOpen, setMenuOpen]       = useState(null)
  const [search, setSearch]           = useState('')

  useEffect(() => {
    Promise.all([contratosService.getAll(), proveedoresService.getAll()])
      .then(([c, p]) => { setContratos(c); setProveedores(p) })
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
  const openEdit   = c   => { setForm({ ...EMPTY, ...c }); setSelected(c); setModal('edit') }
  const openDetail = c   => { setSelected(c); setModal('detail') }
  const openDelete = c   => { setSelected(c); setModal('delete') }
  const close      = ()  => { setModal(null); setSelected(null) }
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const created = await contratosService.create(form)
        setContratos(prev => [...prev, created])
      } else {
        const updated = await contratosService.update(selected.id, form)
        setContratos(prev => prev.map(x => x.id === updated.id ? updated : x))
      }
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await contratosService.remove(selected.id)
      setContratos(prev => prev.filter(x => x.id !== selected.id))
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <p className="p-lg text-slate-500">Cargando contratos…</p>
  if (error)   return <p className="p-lg text-red-500">Error: {error}</p>

  const totalTm     = contratos.reduce((s, c) => s + parseFloat(c.cantidad ?? 0), 0)
  const pendienteTm = contratos.reduce((s, c) => s + parseFloat(c.cantidadPendiente ?? 0), 0)

  const q = search.toLowerCase()
  const filtered = q
    ? contratos.filter(c =>
        [c.numeroContrato, c.proveedorNombre, c.producto, c.grado]
          .some(v => (v ?? '').toLowerCase().includes(q))
      )
    : contratos

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Contratos</h2>
          <p className="text-body-sm text-slate-500 mt-1">{filtered.length} de {contratos.length} contratos</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar contrato…"
              className="pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">add</span>
            Nuevo Contrato
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Contratos', value: contratos.length, icon: 'description' },
          { label: 'Total Tm',        value: totalTm.toLocaleString('es-ES', { maximumFractionDigits: 0 }), icon: 'scale' },
          { label: 'Tm Pendientes',   value: pendienteTm.toLocaleString('es-ES', { maximumFractionDigits: 0 }), icon: 'hourglass_empty' },
          { label: 'Con Documento',   value: contratos.filter(c => c.documentacion).length, icon: 'folder' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-[#E2E4D9] p-md rounded-xl shadow-sm flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <div>
              <p className="text-body-sm text-slate-500">{label}</p>
              <p className="font-h3 text-h3 text-on-surface">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nº Contrato</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Cantidad (kg)</th>
                <th className="px-6 py-4">Progreso</th>
                <th className="px-6 py-4">Cad.</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-slate-400 text-sm">Sin resultados para «{search}»</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-label-md text-primary">{c.numeroContrato}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{c.proveedorNombre?.[0]}</div>
                      <span className="text-body-sm">{c.proveedorNombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{fmtDate(c.fecha)}</td>
                  <td className="px-6 py-4 text-body-sm">{c.producto}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${gradoStyle[c.grado] ?? 'bg-slate-100 text-slate-500'}`}>{c.grado}</span>
                  </td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(c.precio ?? 0).toFixed(4)}</td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(c.cantidad ?? 0).toLocaleString('es-ES')}</td>
                  <td className="px-6 py-4 min-w-[120px]">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (parseFloat(c.cantidadPedida ?? 0) / parseFloat(c.cantidad ?? 1)) * 100).toFixed(0)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{parseFloat(c.cantidadPedida ?? 0).toLocaleString('es-ES')} / {parseFloat(c.cantidad ?? 0).toLocaleString('es-ES')}</p>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{fmtDate(c.fechaCaducidad)}</td>
                  <td className="px-6 py-4 text-body-sm">{c.documentacion ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id) }} className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {menuOpen === c.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-[#E2E4D9] rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { openDetail(c); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">visibility</span> Ver detalle
                        </button>
                        <button onClick={() => { openEdit(c); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                        <button onClick={() => { openDelete(c); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600">
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
        <Modal title={`Contrato ${selected.numeroContrato}`} onClose={close} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['Nº Contrato', selected.numeroContrato],
              ['Proveedor', selected.proveedorNombre],
              ['Fecha', fmtDate(selected.fecha)],
              ['Producto', selected.producto],
              ['Grado', selected.grado],
              ['Precio', parseFloat(selected.precio ?? 0).toFixed(4)],
              ['Cantidad (kg)', parseFloat(selected.cantidad ?? 0).toLocaleString('es-ES')],
              ['Cantidad pedida (kg)', parseFloat(selected.cantidadPedida ?? 0).toLocaleString('es-ES')],
              ['Cantidad pendiente (kg)', parseFloat(selected.cantidadPendiente ?? 0).toLocaleString('es-ES')],
              ['Fecha caducidad', fmtDate(selected.fechaCaducidad)],
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
        <Modal title={modal === 'create' ? 'Nuevo Contrato' : `Editar Contrato`} onClose={close} size="lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Proveedor *">
              <select required value={form.proveedorId ?? ''} onChange={e => set('proveedorId', Number(e.target.value))} className={inp}>
                <option value="">-- Seleccionar --</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </F>
            <F label="Fecha"><input type="date" value={form.fecha ?? ''} onChange={e => set('fecha', e.target.value)} className={inp} /></F>
            <F label="Nº Contrato"><input value={form.numeroContrato ?? ''} onChange={e => set('numeroContrato', e.target.value)} className={inp} /></F>
            <F label="Grado">
              <select value={form.grado ?? 'FOOD'} onChange={e => set('grado', e.target.value)} className={inp}>
                <option>BIO</option><option>HALAL</option><option>KOSHER</option><option>FOOD</option>
              </select>
            </F>
            <F label="Producto" full><input value={form.producto ?? ''} onChange={e => set('producto', e.target.value)} className={inp} /></F>
            <F label="Precio"><input type="number" step="0.0001" value={form.precio ?? ''} onChange={e => set('precio', e.target.value)} className={inp} /></F>
            <F label="Cantidad (kg)"><input type="number" step="0.001" value={form.cantidad ?? ''} onChange={e => set('cantidad', e.target.value)} className={inp} /></F>
            <F label="Cantidad pedida (kg)"><input type="number" step="0.001" value={form.cantidadPedida ?? ''} onChange={e => set('cantidadPedida', e.target.value)} className={inp} /></F>
            <F label="Cantidad pendiente (kg)"><input type="number" step="0.001" value={form.cantidadPendiente ?? ''} onChange={e => set('cantidadPendiente', e.target.value)} className={inp} /></F>
            <F label="Fecha caducidad"><input type="date" value={form.fechaCaducidad ?? ''} onChange={e => set('fechaCaducidad', e.target.value)} className={inp} /></F>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="doc-c" checked={!!form.documentacion} onChange={e => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="doc-c" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
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
        <Modal title="Eliminar contrato" onClose={close} size="sm">
          <p className="text-sm text-slate-600 mb-6">¿Eliminar contrato <strong>{selected.numeroContrato}</strong>? Esta acción no se puede deshacer.</p>
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