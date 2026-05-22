const CFG = {
  warning: { icon: 'warning',      bg: 'bg-amber-50 border-amber-100',     txt: 'text-amber-600' },
  info:    { icon: 'info',          bg: 'bg-blue-50 border-blue-100',        txt: 'text-blue-500' },
  ok:      { icon: 'check_circle',  bg: 'bg-primary/5 border-primary/10',   txt: 'text-primary' },
}

export default function SystemMessage({ alerts = [], totalEurYear = 0 }) {
  return (
    <div className="flex flex-col gap-2">
      {totalEurYear > 0 && (
        <div className="bg-primary p-md rounded-xl text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl">euro</span>
          <div>
            <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wide">Gasto total año</p>
            <p className="font-bold text-lg leading-tight">
              {totalEurYear.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}
      {alerts.map((a, i) => {
        const { icon, bg, txt } = CFG[a.type] ?? CFG.info
        return (
          <div key={i} className={`p-3 rounded-xl border flex items-start gap-2 ${bg}`}>
            <span className={`material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5 ${txt}`}>{icon}</span>
            <p className="text-[12px] text-slate-700 leading-snug">{a.text}</p>
          </div>
        )
      })}
    </div>
  )
}
