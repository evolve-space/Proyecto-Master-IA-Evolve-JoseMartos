// ── MonthlyImportsChart ──────────────────────────────────────────────────────
export function MonthlyImportsChart({ importaciones = [] }) {
  const now = new Date()
  const meses = Array.from({ length: 8 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const items = importaciones.filter(x => x.fechaDuaAlbaran?.startsWith(key))
    return {
      key,
      label: d.toLocaleString('es-ES', { month: 'short' }),
      kg:    items.reduce((s, x) => s + parseFloat(x.cantidad  ?? 0), 0),
      eur:   items.reduce((s, x) => s + parseFloat(x.importeEur ?? 0), 0),
    }
  })

  const maxKg = Math.max(...meses.map(m => m.kg), 1)
  const W = 420, H = 90, BOT = 18, PAD = 8
  const bw = (W - PAD * 2) / meses.length - 4
  const lastWithData = [...meses].reverse().find(m => m.kg > 0)

  return (
    <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-label-md text-label-md text-on-surface">Importaciones por mes</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Kilogramos importados · últimos 8 meses</p>
        </div>
        {lastWithData && (
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Último mes</p>
            <p className="text-sm font-bold text-on-surface">
              {lastWithData.kg.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg
            </p>
            <p className="text-[11px] text-primary">
              {lastWithData.eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </p>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H + BOT}`} className="w-full" style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={PAD} x2={W - PAD} y1={H - f * H} y2={H - f * H}
            stroke="#f1f5f9" strokeWidth={1} />
        ))}
        {meses.map((m, i) => {
          const barH = Math.max(2, (m.kg / maxKg) * H)
          const x = PAD + i * ((W - PAD * 2) / meses.length) + 2
          const isLast = i === meses.length - 1
          const hasData = m.kg > 0
          return (
            <g key={m.key}>
              <rect x={x} y={H - barH} width={bw} height={barH}
                fill="#62C234" rx={3}
                opacity={isLast ? 1 : hasData ? 0.45 : 0.12}
              />
              {hasData && (
                <text x={x + bw / 2} y={H - barH - 5}
                  textAnchor="middle" fontSize={8} fill="#64748b">
                  {m.kg >= 1000 ? `${(m.kg / 1000).toFixed(0)}k` : m.kg.toFixed(0)}
                </text>
              )}
              <text x={x + bw / 2} y={H + BOT - 1}
                textAnchor="middle" fontSize={9} fill="#94a3b8"
                fontWeight={isLast ? 'bold' : 'normal'}>
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Total row */}
      <div className="flex gap-6 mt-3 pt-3 border-t border-slate-100">
        <div>
          <p className="text-[11px] text-slate-400">Total kg (período)</p>
          <p className="text-sm font-bold text-on-surface">
            {meses.reduce((s, m) => s + m.kg, 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Total EUR (período)</p>
          <p className="text-sm font-bold text-primary">
            {meses.reduce((s, m) => s + m.eur, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Meses con actividad</p>
          <p className="text-sm font-bold text-on-surface">
            {meses.filter(m => m.kg > 0).length} / 8
          </p>
        </div>
      </div>
    </div>
  )
}

// ── MuestrasDonut ────────────────────────────────────────────────────────────
export function MuestrasDonut({ muestras = [] }) {
  const SEGS = [
    { label: 'Pendiente', color: '#94a3b8', count: muestras.filter(m => m.estado === 'Pendiente').length },
    { label: 'Análisis',  color: '#7c3aed', count: muestras.filter(m => m.estado === 'Análisis').length },
    { label: 'Compra',    color: '#62C234', count: muestras.filter(m => m.estado === 'Compra').length },
  ]
  const total = SEGS.reduce((s, x) => s + x.count, 0) || 1
  const R = 34, CX = 44, CY = 44, SW = 13
  const circ = 2 * Math.PI * R
  let cum = 0

  return (
    <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl shadow-sm h-full flex flex-col">
      <h3 className="font-label-md text-label-md text-on-surface mb-md">Muestras</h3>
      <div className="flex items-center gap-5 flex-1">
        <svg viewBox="0 0 88 88" className="w-24 h-24 flex-shrink-0">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
          {SEGS.map((seg, i) => {
            const dash = (seg.count / total) * circ
            const gap  = circ - dash
            const offset = -(cum - circ / 4)
            const el = (
              <circle key={i} cx={CX} cy={CY} r={R} fill="none"
                stroke={seg.color} strokeWidth={SW}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            )
            cum += dash
            return el
          })}
          <text x={CX} y={CY - 4}  textAnchor="middle" fontSize={15} fontWeight="bold" fill="#1e293b">{total}</text>
          <text x={CX} y={CY + 11} textAnchor="middle" fontSize={8}  fill="#94a3b8">total</text>
        </svg>

        <div className="flex flex-col gap-3 flex-1">
          {SEGS.map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[12px] text-slate-600">{s.label}</span>
                </div>
                <span className="text-[12px] font-bold text-on-surface">{s.count}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.round(s.count / total * 100)}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
