import { useNavigate } from 'react-router-dom'

function fmtDate(d) {
  if (!d) return '-'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const gradoStyle = {
  'Food Grade': 'bg-green-50 text-green-700',
  'Feed Grade': 'bg-amber-50 text-amber-700',
  'Reach':      'bg-blue-50 text-blue-700',
  'BIO':        'bg-green-50 text-green-700',
  'HALAL':      'bg-blue-50 text-blue-700',
  'KOSHER':     'bg-purple-50 text-purple-700',
  'FOOD':       'bg-slate-100 text-slate-600',
}

const tipoStyle = {
  Contrato: 'bg-primary-container/20 text-primary',
  Pedido:   'bg-secondary-container text-secondary',
}

function Sparkline({ meses }) {
  const max = Math.max(...meses.map(m => m.count), 1)
  const W = 108, H = 28, bw = 12
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-[108px] h-7 flex-shrink-0">
      {meses.map((m, i) => {
        const h = Math.max(3, (m.count / max) * H)
        const x = i * (W / 6) + 2
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={h} fill="#62C234" rx={2}
              opacity={i === meses.length - 1 ? 1 : 0.35} />
            <title>{m.label}: {m.count}</title>
          </g>
        )
      })}
    </svg>
  )
}

const PLACEHOLDER = [
  {
    id: '#OF-2026-024',
    categoria: 'Aceite de Girasol',
    proveedorInicial: 'S',
    proveedor: 'SunFlower Industries',
    precio: '1,25 €/kg',
    estado: 'Pendiente',
    statusClass: 'bg-tertiary-fixed text-on-tertiary-container',
  },
  {
    id: '#OF-2026-023',
    categoria: 'Aceite de Palma',
    proveedorInicial: 'P',
    proveedor: 'Palm Oil Co.',
    precio: '0,98 $/kg',
    estado: 'Aprobada',
    statusClass: 'bg-primary-container text-white',
  },
  {
    id: '#OF-2026-022',
    categoria: 'Aceite de Soja',
    proveedorInicial: 'S',
    proveedor: 'Soja Global S.L.',
    precio: '0,85 $/kg',
    estado: 'En proceso',
    statusClass: 'bg-secondary-container text-secondary',
  },
]

export default function RecentActivity({ ofertas = [] }) {
  const navigate = useNavigate()

  const now = new Date()
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      key,
      label: d.toLocaleString('es-ES', { month: 'short' }),
      count: ofertas.filter(o => o.fecha?.startsWith(key)).length,
    }
  })

  return (
    <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E4D9] flex justify-between items-center bg-[#FCFDF7]">
        <div>
          <h3 className="font-h3 text-h3 text-on-surface">Ofertas recientes</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Últimas {ofertas.length} ofertas</p>
        </div>
        <div className="flex items-center gap-4">
          <Sparkline meses={meses} />
          <button onClick={() => navigate('/ofertas')}
            className="text-primary text-sm font-semibold hover:underline whitespace-nowrap">
            Ver todas →
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Proveedor</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Grado</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Tipo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E4D9]">
            {ofertas.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3 text-[12px] text-slate-400 whitespace-nowrap">{fmtDate(o.fecha)}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{o.proveedorNombre?.[0]}</div>
                    <span className="text-sm">{o.proveedorNombre}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm max-w-[140px] truncate">{o.producto}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${gradoStyle[o.grado] ?? 'bg-slate-100 text-slate-500'}`}>{o.grado}</span>
                </td>
                <td className="px-6 py-3 font-semibold text-sm whitespace-nowrap">
                  {parseFloat(o.precio ?? 0).toFixed(2)} {o.moneda === 'USD' ? '$' : '€'}/kg
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${tipoStyle[o.tipo] ?? 'bg-slate-100 text-slate-500'}`}>{o.tipo}</span>
                </td>
              </tr>
            ))}
            {ofertas.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">Sin ofertas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
