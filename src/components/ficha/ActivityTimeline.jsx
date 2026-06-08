import { Link } from 'react-router-dom'

const TYPE_CFG = {
  email: { icon: 'mail', label: 'Correo', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
  evento: { icon: 'event', label: 'Evento', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-100' },
  oferta: { icon: 'local_offer', label: 'Oferta', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  muestra: { icon: 'science', label: 'Muestra', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
  contrato: { icon: 'description', label: 'Contrato', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
  importacion: { icon: 'local_shipping', label: 'Importación', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
}

const LINKS = {
  email: (id) => `/correos?emailId=${id}`,
  evento: () => '/calendario',
  oferta: (id) => `/ofertas/${id}`,
  muestra: (id) => `/muestras/${id}`,
  contrato: (id) => `/contratos/${id}`,
  importacion: (id) => `/importaciones/${id}`,
}

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'email', label: 'Correos' },
  { id: 'evento', label: 'Eventos' },
  { id: 'oferta', label: 'Ofertas' },
  { id: 'muestra', label: 'Muestras' },
  { id: 'contrato', label: 'Contratos' },
  { id: 'importacion', label: 'Import.' },
]

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ActivityTimeline({
  items = [],
  filter,
  onFilterChange,
  showFilters = true,
  emptyMessage = 'Aún no hay correos ni eventos vinculados',
}) {
  return (
    <div>
      {showFilters && onFilterChange && (
        <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-[#E2E4D9]">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                filter === f.id
                  ? 'border-primary bg-primary text-white font-semibold shadow-sm'
                  : 'border-[#E2E4D9] bg-white text-slate-600 hover:border-primary/40 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">inbox</span>
          <p className="text-sm text-slate-500 max-w-[240px]">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const cfg = TYPE_CFG[item.type] ?? TYPE_CFG.email
            const to = LINKS[item.type]?.(item.id) ?? '/'
            return (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  to={to}
                  className="group flex gap-4 p-4 rounded-xl border border-[#E2E4D9] bg-[#fafaf3]/40 hover:bg-white hover:border-primary/25 hover:shadow-md transition-all"
                >
                  <div
                    className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${cfg.bg}`}
                  >
                    <span className={`material-symbols-outlined text-[22px] ${cfg.color}`}>{cfg.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <time className="text-[11px] text-slate-400 shrink-0 font-medium pt-0.5">
                        {fmtDate(item.date)}
                      </time>
                    </div>
                    {item.summary && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {item.meta?.urgency === 'alta' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                          Urgente
                        </span>
                      )}
                      {item.meta?.categoriaNombre && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: item.meta.categoriaColor || '#64748b' }}
                        >
                          {item.meta.categoriaNombre}
                        </span>
                      )}
                      {item.meta?.estado && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-[#E2E4D9] text-slate-600">
                          {item.meta.estado}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary self-center shrink-0 transition-colors">
                    chevron_right
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
