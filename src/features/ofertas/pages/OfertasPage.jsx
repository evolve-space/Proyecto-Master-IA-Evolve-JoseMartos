import { useState, useEffect } from 'react'
import { ofertasService } from '../services/ofertasService'
import { proveedoresService } from '../../proveedores/services/proveedoresService'
import Modal from '../../../components/ui/Modal'
import FloatingActionButton from '../../../components/ui/FloatingActionButton'

const tipoStyle = {
  Contrato: 'bg-primary-container/20 text-primary',
  Pedido:   'bg-secondary-container text-secondary',
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
  proveedorId: '', fecha: '', producto: '', grado: 'Food Grade',
  cantidad: '', precio: '', moneda: 'EUR', incoterm: 'CIF',
  muestra: false, tipo: 'Contrato', documentacion: false, observaciones: '',
}

export default function OfertasPage() {
  const [ofertas, setOfertas]         = useState([])
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
    Promise.all([ofertasService.getAll(), proveedoresService.getAll()])
      .then(([o, p]) => { setOfertas(o); setProveedores(p) })
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
  const openEdit   = o   => { setForm({ ...EMPTY, ...o }); setSelected(o); setModal('edit') }
  const openDetail = o   => { setSelected(o); setModal('detail') }
  const openDelete = o   => { setSelected(o); setModal('delete') }
  const close      = ()  => { setModal(null); setSelected(null) }
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const created = await ofertasService.create(form)
        setOfertas(prev => [...prev, created])
      } else {
        const updated = await ofertasService.update(selected.id, form)
        setOfertas(prev => prev.map(x => x.id === updated.id ? updated : x))
      }
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await ofertasService.remove(selected.id)
      setOfertas(prev => prev.filter(x => x.id !== selected.id))
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <p className="p-lg text-slate-500">Cargando ofertas…</p>
  if (error)   return <p className="p-lg text-red-500">Error: {error}</p>

  const q = search.toLowerCase()
  const filtered = q
    ? ofertas.filter(o =>
        [o.proveedorNombre, o.producto, o.grado, o.tipo, o.moneda, o.incoterm]
          .some(v => (v ?? '').toLowerCase().includes(q))
      )
    : ofertas

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Ofertas</h2>
          <p className="text-body-sm text-slate-500 mt-1">{filtered.length} de {ofertas.length} ofertas</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar oferta…"
              className="pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">add</span>
            Nueva Oferta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Ofertas', value: ofertas.length, icon: 'local_offer' },
          { label: 'Contratos',     value: ofertas.filter(o => o.tipo === 'Contrato').length, icon: 'description' },
          { label: 'Pedidos',       value: ofertas.filter(o => o.tipo === 'Pedido').length, icon: 'shopping_cart' },
          { label: 'Con Muestra',   value: ofertas.filter(o => o.muestra).length, icon: 'science' },
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
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Cantidad (kg)</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Moneda</th>
                <th className="px-6 py-4">Incoterm</th>
                <th className="px-6 py-4">Muestra</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="text-center py-10 text-slate-400 text-sm">Sin resultados para «{search}»</td></tr>
              )}
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{fmtDate(o.fecha)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{o.proveedorNombre?.[0]}</div>
                      <span className="text-body-sm font-label-md">{o.proveedorNombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{o.producto}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.grado}</td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(o.cantidad).toLocaleString('es-ES')}</td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(o.precio).toFixed(2)}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.moneda}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.incoterm}</td>
                  <td className="px-6 py-4 text-body-sm">{o.muestra ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${tipoStyle[o.tipo] ?? 'bg-slate-100 text-slate-500'}`}>{o.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{o.documentacion ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === o.id ? null : o.id) }} className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {menuOpen === o.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-[#E2E4D9] rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { openDetail(o); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">visibility</span> Ver detalle
                        </button>
                        <button onClick={() => { openEdit(o); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                        <button onClick={() => { openDelete(o); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600">
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
        <Modal title={`Oferta — ${selected.producto}`} onClose={close} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['Fecha', fmtDate(selected.fecha)],
              ['Proveedor', selected.proveedorNombre],
              ['Producto', selected.producto],
              ['Grado', selected.grado],
              ['Cantidad (kg)', parseFloat(selected.cantidad ?? 0).toLocaleString('es-ES')],
              ['Precio', parseFloat(selected.precio ?? 0).toFixed(4)],
              ['Moneda', selected.moneda],
              ['Incoterm', selected.incoterm],
              ['Muestra', selected.muestra ? 'Sí' : 'No'],
              ['Tipo', selected.tipo],
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
        <Modal title={modal === 'create' ? 'Nueva Oferta' : 'Editar Oferta'} onClose={close} size="lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Proveedor *">
              <select required value={form.proveedorId ?? ''} onChange={e => set('proveedorId', Number(e.target.value))} className={inp}>
                <option value="">-- Seleccionar --</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </F>
            <F label="Fecha"><input type="date" value={form.fecha ?? ''} onChange={e => set('fecha', e.target.value)} className={inp} /></F>
            <F label="Producto" full><input value={form.producto ?? ''} onChange={e => set('producto', e.target.value)} className={inp} /></F>
            <F label="Grado">
              <select value={form.grado ?? 'Food Grade'} onChange={e => set('grado', e.target.value)} className={inp}>
                <option>Food Grade</option><option>Feed Grade</option><option>Reach</option>
              </select>
            </F>
            <F label="Tipo">
              <select value={form.tipo ?? 'Contrato'} onChange={e => set('tipo', e.target.value)} className={inp}>
                <option>Contrato</option><option>Pedido</option>
              </select>
            </F>
            <F label="Cantidad (kg)"><input type="number" step="0.001" value={form.cantidad ?? ''} onChange={e => set('cantidad', e.target.value)} className={inp} /></F>
            <F label="Precio"><input type="number" step="0.0001" value={form.precio ?? ''} onChange={e => set('precio', e.target.value)} className={inp} /></F>
            <F label="Moneda">
              <select value={form.moneda ?? 'EUR'} onChange={e => set('moneda', e.target.value)} className={inp}>
                <option>EUR</option><option>USD</option>
              </select>
            </F>
            <F label="Incoterm">
              <select value={form.incoterm ?? 'CIF'} onChange={e => set('incoterm', e.target.value)} className={inp}>
                <option>EXW</option><option>CIF</option><option>CIP</option><option>CFR</option>
              </select>
            </F>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.muestra} onChange={e => set('muestra', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-slate-600">Muestra</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.documentacion} onChange={e => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-slate-600">Documentación</span>
              </label>
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
        <Modal title="Eliminar oferta" onClose={close} size="sm">
          <p className="text-sm text-slate-600 mb-6">¿Eliminar oferta de <strong>{selected.producto}</strong>? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3">
            <button onClick={close} className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}

      <FloatingActionButton onClick={openCreate} />
    </div>
  )
}