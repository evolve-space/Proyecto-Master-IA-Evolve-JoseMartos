import { MONTHS, WEEKDAYS, getMonthGrid, toDateKey, eventOnDate } from '../utils/dateUtils'
import { eventChipStyle } from '../utils/eventStyle'

export default function MonthCalendar({
  year,
  month,
  events = [],
  selectedDate,
  onSelectDate,
  onEventClick,
}) {
  const { cells } = getMonthGrid(year, month)
  const todayKey = toDateKey(new Date())
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null

  const eventsByDay = {}
  for (const ev of events) {
    for (const cell of cells) {
      const key = toDateKey(cell)
      if (eventOnDate(ev, cell)) {
        if (!eventsByDay[key]) eventsByDay[key] = []
        if (!eventsByDay[key].some((e) => e.id === ev.id)) {
          eventsByDay[key].push(ev)
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border border-[#E2E4D9] rounded-xl overflow-hidden min-h-0">
      <div className="grid grid-cols-7 border-b border-[#E2E4D9] bg-slate-50/80 shrink-0">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 min-h-0 auto-rows-fr">
        {cells.map((date) => {
          const key = toDateKey(date)
          const inMonth = date.getMonth() === month
          const isToday = key === todayKey
          const isSelected = key === selectedKey
          const dayEvents = eventsByDay[key] ?? []

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-h-0 h-full border-b border-r border-[#E2E4D9] p-1 sm:p-1.5 text-left transition-colors hover:bg-[#62C234]/5 flex flex-col overflow-hidden ${
                !inMonth ? 'bg-slate-50/50 text-slate-300' : 'text-slate-700'
              } ${isSelected ? 'ring-2 ring-inset ring-[#62C234]/50 bg-[#62C234]/8' : ''}`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-medium shrink-0 ${
                  isToday ? 'bg-[#276c00] text-white' : ''
                }`}
              >
                {date.getDate()}
              </span>

              <div className="flex-1 min-h-0 space-y-0.5 overflow-hidden mt-0.5">
                {dayEvents.slice(0, 4).map((ev) => (
                  <div
                    key={ev.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(ev)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation()
                        onEventClick(ev)
                      }
                    }}
                    className="truncate text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded font-medium"
                    style={eventChipStyle(ev)}
                    title={[ev.subject, ev.categoriaNombre, ev.urgency === 'alta' ? 'Urgente' : null].filter(Boolean).join(' · ')}
                  >
                    {ev.subject}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <p className="text-[10px] text-slate-400 px-1">+{dayEvents.length - 4}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-[#E2E4D9] text-xs text-slate-500 flex gap-4 shrink-0">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[#62C234]/30" /> Local
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-sky-200" /> Outlook
        </span>
        <span className="ml-auto hidden sm:inline">{MONTHS[month]} {year}</span>
      </div>
    </div>
  )
}
