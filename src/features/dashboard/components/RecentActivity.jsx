const ofertas = [
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

export default function RecentActivity() {
  return (
    <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
      {/* Cabecera */}
      <div className="p-md border-b border-[#E2E4D9] flex justify-between items-center bg-[#FCFDF7]">
        <h3 className="font-h3 text-h3 text-on-surface">Actividad reciente</h3>
        <button className="text-primary font-label-md text-label-md hover:underline">
          Ver todas las ofertas
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Oferta</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E4D9]">
            {ofertas.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-label-md text-on-surface">{o.id}</p>
                  <p className="text-body-sm text-slate-400">{o.categoria}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                      {o.proveedorInicial}
                    </div>
                    <span className="text-body-sm">{o.proveedor}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-label-md">{o.precio}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${o.statusClass}`}>
                    {o.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
