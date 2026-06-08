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

export function CreateOfertaFromEmailModal({ email, proveedores, form, set, onClose, onSubmit, saving }) {
  return (
    <Modal title="Crear oferta desde correo" onClose={onClose} size="lg">
      <p className="text-xs text-slate-500 mb-4 line-clamp-2">
        Origen: <strong>{email?.subject}</strong>
      </p>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <F label="Proveedor *" full>
          <select
            required
            value={form.proveedorId ?? ''}
            onChange={(e) => set('proveedorId', e.target.value)}
            className={inp}
          >
            <option value="">Seleccionar…</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </F>
        <F label="Fecha">
          <input type="date" value={form.fecha ?? ''} onChange={(e) => set('fecha', e.target.value)} className={inp} />
        </F>
        <F label="Producto *" full>
          <input required value={form.producto ?? ''} onChange={(e) => set('producto', e.target.value)} className={inp} />
        </F>
        <F label="Grado">
          <select value={form.grado ?? 'Food Grade'} onChange={(e) => set('grado', e.target.value)} className={inp}>
            <option>Food Grade</option>
            <option>Feed Grade</option>
            <option>Reach</option>
          </select>
        </F>
        <F label="Cantidad (kg)">
          <input value={form.cantidad ?? ''} onChange={(e) => set('cantidad', e.target.value)} className={inp} />
        </F>
        <F label="Precio">
          <input value={form.precio ?? ''} onChange={(e) => set('precio', e.target.value)} className={inp} />
        </F>
        <F label="Moneda">
          <select value={form.moneda ?? 'EUR'} onChange={(e) => set('moneda', e.target.value)} className={inp}>
            <option>EUR</option>
            <option>USD</option>
          </select>
        </F>
        <F label="Incoterm">
          <select value={form.incoterm ?? 'CIF'} onChange={(e) => set('incoterm', e.target.value)} className={inp}>
            {['EXW', 'CIF', 'CIP', 'CFR'].map((i) => <option key={i}>{i}</option>)}
          </select>
        </F>
        <F label="Tipo">
          <select value={form.tipo ?? 'Contrato'} onChange={(e) => set('tipo', e.target.value)} className={inp}>
            <option>Contrato</option>
            <option>Pedido</option>
          </select>
        </F>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[#E2E4D9]">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-60">
            {saving ? 'Creando…' : 'Crear oferta'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function CreateMuestraFromEmailModal({ email, proveedores, form, set, onClose, onSubmit, saving }) {
  return (
    <Modal title="Registrar muestra desde correo" onClose={onClose} size="lg">
      <p className="text-xs text-slate-500 mb-4 line-clamp-2">
        Origen: <strong>{email?.subject}</strong>
      </p>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <F label="Proveedor *" full>
          <select
            required
            value={form.proveedorId ?? ''}
            onChange={(e) => set('proveedorId', e.target.value)}
            className={inp}
          >
            <option value="">Seleccionar…</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </F>
        <F label="Fecha">
          <input type="date" value={form.fecha ?? ''} onChange={(e) => set('fecha', e.target.value)} className={inp} />
        </F>
        <F label="Producto *" full>
          <input required value={form.producto ?? ''} onChange={(e) => set('producto', e.target.value)} className={inp} />
        </F>
        <F label="Estado">
          <select value={form.estado ?? 'Pendiente'} onChange={(e) => set('estado', e.target.value)} className={inp}>
            <option>Pendiente</option>
            <option>Análisis</option>
            <option>Compra</option>
          </select>
        </F>
        <F label="ID Lote">
          <input value={form.idLote ?? ''} onChange={(e) => set('idLote', e.target.value)} className={inp} />
        </F>
        <F label="Grado">
          <select value={form.grado ?? 'FOOD'} onChange={(e) => set('grado', e.target.value)} className={inp}>
            {['BIO', 'HALAL', 'KOSHER', 'FOOD'].map((g) => <option key={g}>{g}</option>)}
          </select>
        </F>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[#E2E4D9]">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-60">
            {saving ? 'Creando…' : 'Registrar muestra'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function guessProductFromSubject(subject) {
  if (!subject) return ''
  return subject.replace(/^(re|fw|fwd)\s*:\s*/gi, '').trim().slice(0, 255)
}

export function emailDateToInput(receivedAt) {
  if (!receivedAt) return ''
  return receivedAt.slice(0, 10)
}
