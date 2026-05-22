import { useState, useEffect } from 'react'
import { importacionesService } from '../services/importacionesService'
import { downloadImportacionPdf } from '../utils/downloadImportacionPdf'
import { proveedoresService } from '../../proveedores/services/proveedoresService'
import Modal from '../../../components/ui/Modal'

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
  proveedorId: '', fechaDuaAlbaran: '', fechaFactura: '', producto: '',
  cantidad: '', importeEur: '', aranceles: '0', costeDespacho: '',
  gastoImpKg: '', costeKg: '', importeUsd: '', tipoCambio: '',
  forwarderer: '', incoterm: 'CIF', documentacion: false, observaciones: '',
}

export default function ImportacionesPage() {
  const [importaciones, setImportaciones] = useState([])
  const [proveedores, setProveedores]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [modal, setModal]                 = useState(null)
  const [selected, setSelected]           = useState(null)
  const [form, setForm]                   = useState(EMPTY)
  const [saving, setSaving]               = useState(false)
  const [menuOpen, setMenuOpen]           = useState(null)
  const [search, setSearch]               = useState('')

  useEffect(() => {
    Promise.all([importacionesService.getAll(), proveedoresService.getAll()])
      .then(([imp, prov]) => { setImportaciones(imp); setProveedores(prov) })
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
  const openEdit   = i   => { setForm({ ...EMPTY, ...i }); setSelected(i); setModal('edit') }
  const openDetail = i   => { setSelected(i); setModal('detail') }
  const openDelete = i   => { setSelected(i); setModal('delete') }
  const close      = ()  => { setModal(null); setSelected(null) }
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const created = await importacionesService.create(form)
        setImportaciones(prev => [...prev, created])
      } else {
        const updated = await importacionesService.update(selected.id, form)
        setImportaciones(prev => prev.map(x => x.id === updated.id ? updated : x))
      }
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await importacionesService.remove(selected.id)
      setImportaciones(prev => prev.filter(x => x.id !== selected.id))
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleGeneratePdf = async (item) => {
    setSaving(true)
    try {
      const result = await importacionesService.generatePdf(item)
      if (result instanceof Blob) {
        downloadImportacionPdf(result, item.id)
        return
      }
      if (result?.message) alert(result.message)
    } catch (e) {
      alert(`No se pudo generar el PDF.\n\n${e?.message || 'Error desconocido'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-lg text-slate-500">Cargando importaciones…</p>
  if (error)   return <p className="p-lg text-red-500">Error: {error}</p>

  const totalImporteEUR = importaciones.reduce((s, i) => s + parseFloat(i.importeEur ?? 0), 0)
  const totalKg         = importaciones.reduce((s, i) => s + parseFloat(i.cantidad ?? 0), 0)

  const q = search.toLowerCase()
  const filtered = q
    ? importaciones.filter(i =>
        [i.proveedorNombre, i.producto, i.incoterm, i.forwarderer]
          .some(v => (v ?? '').toLowerCase().includes(q))
      )
    : importaciones

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Importaciones</h2>
          <p className="text-body-sm text-slate-500 mt-1">{filtered.length} de {importaciones.length} importaciones</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar importación…"
              className="pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">add</span>
            Nueva Importación
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Importaciones', value: importaciones.length, icon: 'local_shipping' },
          { label: 'Total Kg', value: totalKg.toLocaleString('es-ES', { maximumFractionDigits: 0 }), icon: 'scale' },
          { label: 'Total EUR', value: totalImporteEUR.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }), icon: 'euro' },
          { label: 'Con Documento', value: importaciones.filter(i => i.documentacion).length, icon: 'folder' },
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
                <th className="px-6 py-4">Fecha DUA</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Cantidad (kg)</th>
                <th className="px-6 py-4">Importe EUR</th>
                <th className="px-6 py-4">Importe USD</th>
                <th className="px-6 py-4">Coste/kg</th>
                <th className="px-6 py-4">Incoterm</th>
                <th className="px-6 py-4">Forwarder</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-slate-400 text-sm">Sin resultados para «{search}»</td></tr>
              )}
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{fmtDate(i.fechaDuaAlbaran)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{i.proveedorNombre?.[0]}</div>
                      <span className="text-body-sm">{i.proveedorNombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{i.producto}</td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(i.cantidad ?? 0).toLocaleString('es-ES')}</td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(i.importeEur ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-6 py-4 font-label-md">{parseFloat(i.importeUsd ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</td>
                  <td className="px-6 py-4 text-body-sm">{parseFloat(i.costeKg ?? 0).toFixed(4)}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{i.incoterm}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{i.forwarderer}</td>
                  <td className="px-6 py-4 text-body-sm">{i.documentacion ? 'Sí' : 'No'}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === i.id ? null : i.id) }} className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {menuOpen === i.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-[#E2E4D9] rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { openDetail(i); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">visibility</span> Ver detalle
                        </button>
                        <button onClick={() => { handleGeneratePdf(i); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span> Generar PDF
                        </button>
                        <button onClick={() => { openEdit(i); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                        <button onClick={() => { openDelete(i); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600">
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
        <Modal title={`Importación — ${selected.producto}`} onClose={close} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['Proveedor', selected.proveedorNombre],
              ['Fecha DUA/Albarán', fmtDate(selected.fechaDuaAlbaran)],
              ['Fecha Factura', fmtDate(selected.fechaFactura)],
              ['Producto', selected.producto],
              ['Cantidad (kg)', parseFloat(selected.cantidad ?? 0).toLocaleString('es-ES')],
              ['Importe EUR', parseFloat(selected.importeEur ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })],
              ['Importe USD', parseFloat(selected.importeUsd ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'USD' })],
              ['Tipo de cambio', selected.tipoCambio],
              ['Aranceles', selected.aranceles],
              ['Coste despacho', selected.costeDespacho],
              ['Gasto imp./kg', selected.gastoImpKg],
              ['Coste/kg', parseFloat(selected.costeKg ?? 0).toFixed(4)],
              ['Forwarder', selected.forwarderer],
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

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Nueva Importación' : 'Editar Importación'} onClose={close} size="lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Proveedor *">
              <select required value={form.proveedorId ?? ''} onChange={e => set('proveedorId', Number(e.target.value))} className={inp}>
                <option value="">-- Seleccionar --</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </F>
            <F label="Fecha DUA/Albarán"><input type="date" value={form.fechaDuaAlbaran ?? ''} onChange={e => set('fechaDuaAlbaran', e.target.value)} className={inp} /></F>
            <F label="Fecha Factura"><input type="date" value={form.fechaFactura ?? ''} onChange={e => set('fechaFactura', e.target.value)} className={inp} /></F>
            <F label="Incoterm">
              <select value={form.incoterm ?? 'CIF'} onChange={e => set('incoterm', e.target.value)} className={inp}>
                <option>EXW</option><option>CIF</option><option>CIP</option><option>CFR</option>
              </select>
            </F>
            <F label="Producto" full><input value={form.producto ?? ''} onChange={e => set('producto', e.target.value)} className={inp} /></F>
            <F label="Cantidad (kg)"><input type="number" step="0.001" value={form.cantidad ?? ''} onChange={e => set('cantidad', e.target.value)} className={inp} /></F>
            <F label="Importe EUR"><input type="number" step="0.01" value={form.importeEur ?? ''} onChange={e => set('importeEur', e.target.value)} className={inp} /></F>
            <F label="Importe USD"><input type="number" step="0.01" value={form.importeUsd ?? ''} onChange={e => set('importeUsd', e.target.value)} className={inp} /></F>
            <F label="Tipo de cambio"><input type="number" step="0.0001" value={form.tipoCambio ?? ''} onChange={e => set('tipoCambio', e.target.value)} className={inp} /></F>
            <F label="Aranceles"><input type="number" step="0.01" value={form.aranceles ?? ''} onChange={e => set('aranceles', e.target.value)} className={inp} /></F>
            <F label="Coste despacho"><input type="number" step="0.01" value={form.costeDespacho ?? ''} onChange={e => set('costeDespacho', e.target.value)} className={inp} /></F>
            <F label="Gasto imp./kg"><input type="number" step="0.0001" value={form.gastoImpKg ?? ''} onChange={e => set('gastoImpKg', e.target.value)} className={inp} /></F>
            <F label="Coste/kg"><input type="number" step="0.0001" value={form.costeKg ?? ''} onChange={e => set('costeKg', e.target.value)} className={inp} /></F>
            <F label="Forwarder"><input value={form.forwarderer ?? ''} onChange={e => set('forwarderer', e.target.value)} className={inp} /></F>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="doc-i" checked={!!form.documentacion} onChange={e => set('documentacion', e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="doc-i" className="text-sm text-slate-600 cursor-pointer">Documentación</label>
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
        <Modal title="Eliminar importación" onClose={close} size="sm">
          <p className="text-sm text-slate-600 mb-6">¿Eliminar la importación de <strong>{selected.producto}</strong>? Esta acción no se puede deshacer.</p>
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