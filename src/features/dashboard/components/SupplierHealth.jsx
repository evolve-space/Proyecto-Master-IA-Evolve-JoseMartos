import { useNavigate } from 'react-router-dom'

export default function SupplierHealth({ proveedores = [], ofertas = [], contratos = [] }) {
  const navigate = useNavigate()

  const top = proveedores.slice(0, 6).map(p => {
    const nOfertas   = ofertas.filter(o   => o.proveedorNombre === p.nombre).length
    const nContratos = contratos.filter(c => c.proveedorNombre === p.nombre).length
    const status = nContratos > 0 ? 'ok' : nOfertas > 0 ? 'warning' : 'inactive'
    return { ...p, nOfertas, nContratos, status }
  })

  return (
    <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-label-md text-label-md text-on-surface">Proveedores</h3>
        <button onClick={() => navigate('/proveedores')} className="text-[11px] text-primary hover:underline">Ver todos →</button>
      </div>
      <div className="space-y-3">
        {top.map(p => (
          <div key={p.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
              {p.nombre?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{p.nOfertas} of.</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold">{p.nContratos} cont.</span>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              p.status === 'ok' ? 'bg-[#62C234]' :
              p.status === 'warning' ? 'bg-amber-400' : 'bg-slate-200'
            }`} />
          </div>
        ))}
        {top.length === 0 && <p className="text-sm text-slate-400">Sin proveedores</p>}
      </div>
    </div>
  )
}
