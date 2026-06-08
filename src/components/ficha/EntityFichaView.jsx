import { Link } from 'react-router-dom'
import ActivityTimeline from './ActivityTimeline'

function DetailField({ label, value, full }) {
  if (value == null || value === '') return null
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 leading-snug break-words">{value}</dd>
    </div>
  )
}

export default function EntityFichaView({
  loading,
  error,
  backTo,
  backLabel,
  icon,
  avatarLetter,
  entityId,
  title,
  subtitle,
  badges = [],
  highlights = [],
  stats = [],
  fields = [],
  proveedor,
  items = [],
  timelineFilter,
  onTimelineFilterChange,
  showTimelineFilters = false,
  headerActions,
  onEdit,
  activityTitle = 'Actividad relacionada',
}) {
  if (loading) {
    return (
      <div className="-m-4 sm:-m-6 lg:-m-8 flex items-center justify-center flex-1 min-h-[calc(100dvh-4rem)] w-full bg-[#fafaf3]">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          Cargando detalle…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="-m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 flex-1 w-full bg-[#fafaf3]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
          No se pudo cargar el detalle: {error}
        </div>
      </div>
    )
  }

  const visibleFields = fields.filter(([, v]) => v != null && v !== '')

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex flex-col w-full h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] min-h-0 bg-[#fafaf3]">
      {/* Barra superior */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[#E2E4D9] bg-white/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          {backLabel}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar
            </button>
          )}
          {headerActions}
        </div>
      </div>

      {/* Cabecera */}
      <section className="shrink-0 border-b border-[#E2E4D9] bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-[#62C234] to-[#276c00]" />
        <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
            <div className="flex gap-4 sm:gap-5 min-w-0 flex-1">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
                {avatarLetter ? (
                  <span className="text-xl sm:text-2xl font-bold text-primary">{avatarLetter}</span>
                ) : (
                  <span className="material-symbols-outlined text-[28px] sm:text-[32px] text-primary">{icon}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {entityId != null && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                    Registro #{entityId}
                  </p>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface leading-tight break-words">
                  {title}
                </h1>
                {subtitle && <p className="text-sm sm:text-base text-slate-500 mt-1">{subtitle}</p>}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {badges.map((b) => (
                      <span key={b.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.className}`}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {stats.length > 0 && (
              <div className="flex flex-wrap xl:justify-end gap-4 xl:gap-6 shrink-0">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px] text-slate-600">{s.icon}</span>
                    </span>
                    <div>
                      <p className="text-lg font-bold text-on-surface leading-none">{s.value ?? 0}</p>
                      <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {highlights.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-5 pt-5 border-t border-[#E2E4D9]">
              {highlights.map((h) => (
                <div key={h.label} className="rounded-xl bg-[#fafaf3] border border-[#E2E4D9] px-4 py-3 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 truncate">
                    {h.label}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-on-surface leading-tight break-words">{h.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cuerpo: dos columnas a pantalla completa */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        <section className="min-h-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#E2E4D9] bg-white p-4 sm:p-6 lg:p-8">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
            Información
          </h2>

          {proveedor?.id && (
            <div className="mb-6 p-4 rounded-xl bg-[#fafaf3] border border-[#E2E4D9]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Proveedor</p>
              <Link
                to={`/proveedores/${proveedor.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {proveedor.nombre?.[0]}
                </span>
                {proveedor.nombre}
              </Link>
            </div>
          )}

          {visibleFields.length > 0 ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
              {visibleFields.map(([label, value]) => (
                <DetailField
                  key={label}
                  label={label}
                  value={value}
                  full={label === 'Observaciones' || String(value).length > 60}
                />
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-400">Sin datos adicionales.</p>
          )}
        </section>

        <section className="min-h-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="shrink-0 mb-5">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              {activityTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Correos y eventos de calendario vinculados</p>
          </div>
          <div className="flex-1 min-h-0">
            <ActivityTimeline
              items={items}
              filter={timelineFilter}
              onFilterChange={onTimelineFilterChange}
              showFilters={showTimelineFilters}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
