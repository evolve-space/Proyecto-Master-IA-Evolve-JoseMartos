import { useState, useEffect } from 'react'
import { usuariosService } from '../services/usuariosService'
import Modal from '../../../components/ui/Modal'
import FloatingActionButton from '../../../components/ui/FloatingActionButton'

const tipoLabel = { superadmin: 'Superadmin', admin: 'Administrador', normal: 'Usuario' }

const tipoStyle = {
  superadmin: 'bg-red-100 text-red-700',
  admin:      'bg-primary-container/20 text-primary',
  normal:     'bg-slate-100 text-slate-500',
}

const inp = 'w-full border border-[#E2E4D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const EMPTY = { nombre: '', tipo: 'normal', password: '' }

export default function UsersPage() {
  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [menuOpen, setMenuOpen]   = useState(null)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    usuariosService.getAll()
      .then(setUsuarios)
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
  const openEdit   = u   => { setForm({ ...EMPTY, ...u }); setSelected(u); setModal('edit') }
  const openDelete = u   => { setSelected(u); setModal('delete') }
  const close      = ()  => { setModal(null); setSelected(null) }
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const created = await usuariosService.create(form)
        setUsuarios(prev => [...prev, created])
      } else {
        const updated = await usuariosService.update(selected.id, form)
        setUsuarios(prev => prev.map(x => x.id === updated.id ? updated : x))
      }
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await usuariosService.remove(selected.id)
      setUsuarios(prev => prev.filter(x => x.id !== selected.id))
      close()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <p className="p-lg text-slate-500">Cargando usuarios…</p>
  if (error)   return <p className="p-lg text-red-500">Error: {error}</p>

  const q = search.toLowerCase()
  const filtered = q
    ? usuarios.filter(u =>
        [u.nombre, u.tipo].some(v => (v ?? '').toLowerCase().includes(q))
      )
    : usuarios

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Usuarios</h2>
          <p className="text-body-sm text-slate-500 mt-1">{filtered.length} de {usuarios.length} usuarios</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuario…"
              className="pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">person_add</span>
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Id</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 text-sm">Sin resultados para «{search}»</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-400">#{u.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold">
                        {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-label-md text-on-surface">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${tipoStyle[u.tipo] ?? 'bg-slate-100 text-slate-500'}`}>
                      {tipoLabel[u.tipo] ?? u.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === u.id ? null : u.id) }} className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {menuOpen === u.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-[#E2E4D9] rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { openEdit(u); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                          <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                        <button onClick={() => { openDelete(u); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600">
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

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Nuevo Usuario' : `Editar: ${selected.nombre}`} onClose={close} size="sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <F label="Nombre *"><input required value={form.nombre} onChange={e => set('nombre', e.target.value)} className={inp} /></F>
            {modal === 'create' && (
              <F label="Contraseña *"><input required type="password" value={form.password ?? ''} onChange={e => set('password', e.target.value)} className={inp} placeholder="Mínimo 8 caracteres" /></F>
            )}
            <F label="Tipo *">
              <select required value={form.tipo ?? 'normal'} onChange={e => set('tipo', e.target.value)} className={inp}>
                <option value="normal">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </F>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Guardando…' : modal === 'create' ? 'Crear' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Eliminar usuario" onClose={close} size="sm">
          <p className="text-sm text-slate-600 mb-6">¿Eliminar usuario <strong>{selected.nombre}</strong>? Esta acción no se puede deshacer.</p>
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