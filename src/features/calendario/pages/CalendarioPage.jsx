import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { calendarioService } from '../services/calendarioService'
import { outlookOAuthService } from '../../emails/services/outlookOAuthService'
import { openOutlookOAuth } from '../../emails/utils/outlookOAuthFlow'
import { emailsService } from '../../emails/services/emailsService'
import { proveedoresService } from '../../proveedores/services/proveedoresService'
import MonthCalendar from '../components/MonthCalendar'
import EventModal from '../components/EventModal'
import CategoriesModal from '../components/CategoriesModal'
import { calendarioCategoriasService } from '../services/calendarioCategoriasService'
import { dashboardService } from '../../dashboard/services/dashboardService'
import { Link } from 'react-router-dom'
import {
  MONTHS,
  addMonths,
  defaultEventTimes,
  eventOnDate,
  formatDateShort,
  formatTime,
  rangeForMonth,
} from '../utils/dateUtils'

const EMPTY = {
  subject: '',
  description: '',
  location: '',
  startAt: '',
  endAt: '',
  allDay: false,
  proveedorId: null,
  emailId: null,
  categoriaId: null,
  pushOutlook: false,
}

export default function CalendarioPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(now)
  const [events, setEvents] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [outlook, setOutlook] = useState({ connected: false, email: null, loading: true })
  const [connectingOutlook, setConnectingOutlook] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [weekAlerts, setWeekAlerts] = useState(null)

  const loadOutlook = useCallback(async () => {
    try {
      const status = await outlookOAuthService.getStatus()
      setOutlook({ connected: !!status.connected, email: status.email ?? null, loading: false })
    } catch {
      setOutlook({ connected: false, email: null, loading: false })
    }
  }, [])

  const loadEvents = useCallback(async (year, month) => {
    setLoading(true)
    setError(null)
    try {
      const { from, to } = rangeForMonth(year, month)
      const data = await calendarioService.getEventos({ from, to })
      setEvents(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAlerts = useCallback(async () => {
    try {
      const data = await dashboardService.getAlerts()
      setWeekAlerts(data)
    } catch {
      setWeekAlerts(null)
    }
  }, [])

  const loadCategorias = useCallback(async () => {
    try {
      const list = await calendarioCategoriasService.getAll()
      setCategorias(list ?? [])
    } catch {
      setCategorias([])
    }
  }, [])

  useEffect(() => {
    loadOutlook()
    loadCategorias()
    loadAlerts()
    proveedoresService.getAll().then(setProveedores).catch(() => {})
    emailsService.getAll().then(setEmails).catch(() => {})
  }, [loadOutlook, loadCategorias, loadAlerts])

  useEffect(() => {
    loadEvents(viewYear, viewMonth)
  }, [viewYear, viewMonth, loadEvents])

  useEffect(() => {
    const result = searchParams.get('outlook')
    if (result === 'connected') {
      loadOutlook()
      setError(null)
      setSearchParams({}, { replace: true })
    }
    if (result === 'error') {
      setError(searchParams.get('message') || 'Error al conectar Outlook')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, loadOutlook])

  const openCreate = useCallback((date) => {
    const base = date ?? selectedDate ?? new Date()
    const { startAt, endAt } = defaultEventTimes(base)
    setForm({ ...EMPTY, startAt, endAt })
    setSelected(null)
    setModal('create')
  }, [selectedDate])

  useEffect(() => {
    const emailId = searchParams.get('emailId')
    if (!emailId || emails.length === 0) return

    const email = emails.find((e) => String(e.id) === emailId)
    if (!email) return

    const { startAt, endAt } = defaultEventTimes(new Date(email.receivedAt ?? undefined))
    setForm({
      ...EMPTY,
      subject: email.subject ? `Seguimiento: ${email.subject}` : 'Seguimiento correo',
      description: email.body?.slice(0, 2000) ?? '',
      emailId: email.id,
      proveedorId: email.proveedor ?? null,
      startAt,
      endAt,
    })
    setSelected(null)
    setModal('create')
    setSearchParams({}, { replace: true })
  }, [searchParams, emails, setSearchParams])

  const openView = (ev) => { setSelected(ev); setForm({ ...ev }); setModal('view') }
  const openEdit = (ev) => { setSelected(ev); setForm({ ...ev, pushOutlook: true }); setModal('edit') }
  const openDelete = (ev) => { setSelected(ev); setForm({ ...ev }); setModal('delete') }
  const close = () => { setModal(null); setSelected(null) }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const prevMonth = () => {
    const next = addMonths(viewYear, viewMonth, -1)
    setViewYear(next.year)
    setViewMonth(next.month)
  }

  const nextMonth = () => {
    const next = addMonths(viewYear, viewMonth, 1)
    setViewYear(next.year)
    setViewMonth(next.month)
  }

  const goToday = () => {
    const t = new Date()
    setViewYear(t.getFullYear())
    setViewMonth(t.getMonth())
    setSelectedDate(t)
  }

  const handleSync = async () => {
    if (!outlook.connected) return
    setSyncing(true)
    setError(null)
    try {
      const { from, to } = rangeForMonth(viewYear, viewMonth)
      const result = await calendarioService.syncFromOutlook({ from, to })
      await loadEvents(viewYear, viewMonth)
      if (result.imported === 0 && result.updated === 0) {
        setError(null)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  const isCalendarPermissionError = (msg) =>
    /403|access is denied|calendario|calendar/i.test(String(msg ?? ''))

  const handleConnectOutlook = async (reauthorize = false) => {
    setConnectingOutlook(true)
    try {
      const { url } = await outlookOAuthService.getConnectUrl({
        consent: reauthorize || !outlook.connected,
        returnTo: 'calendario',
      })
      if (!url) throw new Error('No se recibió URL de Microsoft.')
      openOutlookOAuth(url, {
        onConnected: () => {
          setError(null)
          loadOutlook()
          setConnectingOutlook(false)
        },
        onError: (message) => {
          setError(message)
          setConnectingOutlook(false)
        },
        onDismiss: () => setConnectingOutlook(false),
      })
    } catch (e) {
      setError(e.message)
      setConnectingOutlook(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (modal === 'view') {
      openEdit(selected)
      return
    }

    setSaving(true)
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        location: form.location,
        startAt: form.startAt,
        endAt: form.endAt,
        allDay: form.allDay,
        proveedorId: form.proveedorId,
        emailId: form.emailId,
        categoriaId: form.categoriaId,
        pushOutlook: form.pushOutlook,
      }

      if (modal === 'create') {
        const created = form.emailId
          ? await calendarioService.createFromEmail(form.emailId, payload)
          : await calendarioService.create(payload)
        setEvents((prev) => [...prev, created])
      } else {
        const updated = await calendarioService.update(selected.id, payload)
        setEvents((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      }
      close()
      await loadEvents(viewYear, viewMonth)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await calendarioService.remove(selected.id)
      setEvents((prev) => prev.filter((x) => x.id !== selected.id))
      close()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredEvents = useMemo(() => events.filter((ev) => {
    if (categoriaFilter === 'all') return true
    if (categoriaFilter === 'none') return !ev.categoriaId
    return ev.categoriaId === Number(categoriaFilter)
  }), [events, categoriaFilter])

  const dayEvents = useMemo(
    () => filteredEvents
      .filter((ev) => eventOnDate(ev, selectedDate))
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    [filteredEvents, selectedDate],
  )

  const upcoming = useMemo(
    () => filteredEvents
      .filter((ev) => new Date(ev.endAt) >= new Date())
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      .slice(0, 8),
    [filteredEvents],
  )

  const showReauth = error && isCalendarPermissionError(error)

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex flex-col flex-1 min-h-0 h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] w-full">
      {/* Toolbar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-4 py-2 border-b border-[#E2E4D9] bg-white/80">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth} className="p-2 rounded-lg border border-[#E2E4D9] hover:bg-slate-50" aria-label="Mes anterior">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <h2 className="text-lg font-bold text-on-surface min-w-[160px] text-center">
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <button type="button" onClick={nextMonth} className="p-2 rounded-lg border border-[#E2E4D9] hover:bg-slate-50" aria-label="Mes siguiente">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <button type="button" onClick={goToday} className="ml-1 px-3 py-1.5 text-sm rounded-lg border border-[#E2E4D9] hover:bg-slate-50 text-slate-600">
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="px-2 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#62C234]/40 max-w-[140px]"
          >
            <option value="all">Categoría</option>
            <option value="none">Sin categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCategoriesModal(true)}
            title="Gestionar categorías"
            className="p-2 rounded-lg border border-[#E2E4D9] bg-white text-slate-600 hover:border-[#62C234]/40"
          >
            <span className="material-symbols-outlined text-[18px]">label</span>
          </button>
          {outlook.connected && (
            <span className="text-xs text-slate-400 truncate max-w-[160px]" title={outlook.email}>
              {outlook.email}
            </span>
          )}
          {outlook.connected && (
            <button
              type="button"
              onClick={() => handleConnectOutlook(true)}
              disabled={connectingOutlook}
              title="Volver a autorizar permisos de calendario"
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              Reautorizar
            </button>
          )}
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || !outlook.connected}
            title={!outlook.connected ? 'Conecta Outlook primero' : 'Sincronizar calendario Outlook'}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[#E2E4D9] hover:bg-slate-50 disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-[18px] ${syncing ? 'animate-spin' : ''}`}>sync</span>
            Sincronizar
          </button>
          <button
            type="button"
            onClick={() => openCreate(selectedDate)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-[#276c00] text-white font-semibold hover:bg-[#276c00]/90"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo evento
          </button>
        </div>
      </div>

      {weekAlerts && (weekAlerts.eventsNext24h > 0 || (weekAlerts.upcomingEvents?.length ?? 0) > 0) && (
        <div className="shrink-0 mx-3 mt-2 flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-violet-200 bg-violet-50 text-sm text-violet-900">
          <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
          <span className="flex-1 min-w-0">
            {weekAlerts.eventsNext24h > 0 && (
              <strong>{weekAlerts.eventsNext24h} en 24 h</strong>
            )}
            {weekAlerts.eventsNext24h > 0 && weekAlerts.upcomingEvents?.length ? ' · ' : ''}
            {weekAlerts.upcomingEvents?.length
              ? `${weekAlerts.upcomingEvents.length} evento(s) esta semana`
              : null}
            {weekAlerts.upcomingEvents?.[0]?.subject && (
              <span className="text-violet-700"> — próximo: {weekAlerts.upcomingEvents[0].subject}</span>
            )}
          </span>
          <Link to="/" className="text-xs font-semibold text-violet-800 hover:underline shrink-0">Dashboard</Link>
        </div>
      )}

      {!outlook.loading && !outlook.connected && (
        <div className="shrink-0 mx-3 mt-2 flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <div className="flex items-start gap-2 flex-1">
            <span className="material-symbols-outlined text-[22px] shrink-0">event</span>
            <div>
              <p className="font-semibold">Conecta Outlook para sincronizar el calendario</p>
              <p className="text-amber-800/80 text-xs mt-0.5">
                Los eventos locales se pueden crear sin conexión. Para importar y publicar en Outlook, usa la misma cuenta que en Correos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleConnectOutlook(false)}
            disabled={connectingOutlook}
            className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-60"
          >
            {connectingOutlook ? 'Redirigiendo…' : 'Conectar Outlook'}
          </button>
        </div>
      )}

      {error && (
        <div className="shrink-0 mx-3 mt-2 flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <p className="min-w-0">
              {showReauth
                ? 'Outlook está conectado para correo, pero falta permiso de calendario. Pulsa «Reautorizar Outlook» y acepta acceso al calendario.'
                : error}
            </p>
          </div>
          {showReauth && outlook.connected && (
            <button
              type="button"
              onClick={() => handleConnectOutlook(true)}
              disabled={connectingOutlook}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              Reautorizar Outlook
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-[#E2E4D9] overflow-hidden">
        <div className="min-h-0 min-w-0 p-2 sm:p-3 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-white border border-[#E2E4D9] rounded-xl">
              <span className="material-symbols-outlined animate-spin text-[#62C234] text-4xl">progress_activity</span>
            </div>
          ) : (
            <MonthCalendar
              year={viewYear}
              month={viewMonth}
              events={filteredEvents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEventClick={openView}
            />
          )}
        </div>

        <aside className="min-h-0 overflow-y-auto bg-[#fafaf3]/50 p-3 space-y-3">
          <div className="bg-white border border-[#E2E4D9] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#62C234]">today</span>
              {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="text-xs text-slate-400 mb-3">Sin eventos este día</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {dayEvents.map((ev) => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => openView(ev)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-[#E2E4D9] transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">{ev.subject}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ev.urgency === 'alta' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-red-100 text-red-700 border border-red-200">
                            Urgente
                          </span>
                        )}
                        {ev.categoriaNombre && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded text-white font-medium"
                            style={{ backgroundColor: ev.categoriaColor || '#64748b' }}
                          >
                            {ev.categoriaNombre}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ev.allDay ? 'Todo el día' : `${formatTime(ev.startAt)} – ${formatTime(ev.endAt)}`}
                      </p>
                      {ev.emailId && (
                        <p className="text-[10px] text-sky-600 mt-1 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">mail</span>
                          Correo vinculado
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => openCreate(selectedDate)}
              className="w-full text-xs py-2 rounded-lg border border-dashed border-[#E2E4D9] text-slate-500 hover:border-[#62C234] hover:text-[#276c00] transition-colors"
            >
              + Añadir en este día
            </button>
          </div>

          <div className="bg-white border border-[#E2E4D9] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-on-surface mb-3">Próximos eventos</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400">No hay eventos próximos</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((ev) => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => openView(ev)}
                      className="w-full text-left text-xs p-2 rounded-lg hover:bg-slate-50"
                    >
                      <p className="font-medium text-slate-700 line-clamp-1 flex items-center gap-1.5">
                        {ev.categoriaColor && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.categoriaColor }} />
                        )}
                        {ev.subject}
                      </p>
                      <p className="text-slate-400">{formatDateShort(ev.startAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {modal && ['create', 'edit', 'view', 'delete'].includes(modal) && (
        <EventModal
          mode={modal}
          form={form}
          set={set}
          onClose={close}
          onSubmit={handleSubmit}
          onDelete={modal === 'delete' ? handleDelete : () => setModal('delete')}
          saving={saving}
          proveedores={proveedores}
          emails={emails}
          categorias={categorias}
          outlookConnected={outlook.connected}
        />
      )}

      {showCategoriesModal && (
        <CategoriesModal
          onClose={() => setShowCategoriesModal(false)}
          onChanged={loadCategorias}
        />
      )}

    </div>
  )
}
