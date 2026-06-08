import { Link } from 'react-router-dom'

function fmtWhen(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function CalendarAlerts({ upcomingEvents = [], eventsNext24h = 0 }) {
  if (!upcomingEvents.length) return null

  return (
    <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-violet-600">event_upcoming</span>
          Próximos eventos
        </h3>
        <Link to="/calendario" className="text-[11px] text-primary hover:underline">Calendario →</Link>
      </div>
      {eventsNext24h > 0 && (
        <p className="text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-2 py-1.5 mb-3">
          {eventsNext24h} evento{eventsNext24h > 1 ? 's' : ''} en las próximas 24 h
        </p>
      )}
      <ul className="space-y-2">
        {upcomingEvents.slice(0, 5).map((ev) => (
          <li key={ev.id}>
            <Link
              to="/calendario"
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 w-16 shrink-0 pt-0.5">{fmtWhen(ev.startAt)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{ev.subject}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {ev.proveedorNombre && (
                    <span className="text-[10px] text-slate-500">{ev.proveedorNombre}</span>
                  )}
                  {ev.urgency === 'alta' && (
                    <span className="text-[10px] font-semibold text-red-600">Urgente</span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
