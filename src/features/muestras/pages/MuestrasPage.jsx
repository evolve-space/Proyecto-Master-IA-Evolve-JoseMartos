const muestras = [
  { id: 1, fecha: '20/04/2026', proveedor: 'BioOils S.A.',          estado: 'Análisis',  idLote: 'LOT-2026-001', producto: 'Aceite de Canola',   observaciones: 'Pendiente resultado laboratorio', grado: 'BIO',       documentacion: 'Sí' },
  { id: 2, fecha: '18/04/2026', proveedor: 'SunFlower Industries',  estado: 'Compra',    idLote: 'LOT-2026-002', producto: 'Aceite de Girasol',  observaciones: '-',                               grado: 'Food Grade', documentacion: 'Sí' },
  { id: 3, fecha: '15/04/2026', proveedor: 'Palm Oil Co.',          estado: 'Pendiente', idLote: 'LOT-2026-003', producto: 'Aceite de Palma',    observaciones: 'En tránsito desde origen',        grado: 'HALAL',      documentacion: 'No' },
  { id: 4, fecha: '10/04/2026', proveedor: 'KosherFats Ltd.',       estado: 'Análisis',  idLote: 'LOT-2026-004', producto: 'Aceite de Coco',     observaciones: 'Análisis KOSHER en curso',        grado: 'KOSHER',     documentacion: 'Sí' },
  { id: 5, fecha: '05/04/2026', proveedor: 'Soja Global S.L.',      estado: 'Compra',    idLote: 'LOT-2026-005', producto: 'Aceite de Soja',     observaciones: '-',                               grado: 'FOOD',       documentacion: 'Sí' },
]

const estadoStyle = {
  'Análisis':  'bg-secondary-container text-secondary',
  'Compra':    'bg-primary-container/20 text-primary',
  'Pendiente': 'bg-tertiary-fixed text-on-tertiary-container',
}

const estadoIcon = {
  'Análisis':  'biotech',
  'Compra':    'check_circle',
  'Pendiente': 'schedule',
}

export default function MuestrasPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Muestras</h2>
          <p className="text-body-sm text-slate-500 mt-1">{muestras.length} muestras registradas</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Nueva Muestra
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter mb-xl">
        {['Análisis', 'Compra', 'Pendiente'].map((estado) => (
          <div key={estado} className="bg-white border border-[#E2E4D9] p-md rounded-xl shadow-sm flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">{estadoIcon[estado]}</span>
            <div>
              <p className="text-body-sm text-slate-500">{estado}</p>
              <p className="font-h3 text-h3 text-on-surface">
                {muestras.filter(m => m.estado === estado).length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Id Lote</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Observaciones</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {muestras.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{m.fecha}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{m.proveedor[0]}</div>
                      <span className="text-body-sm">{m.proveedor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${estadoStyle[m.estado]}`}>{m.estado}</span>
                  </td>
                  <td className="px-6 py-4 font-label-md text-on-surface">{m.idLote}</td>
                  <td className="px-6 py-4 text-body-sm">{m.producto}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{m.grado}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-400 max-w-[200px] truncate">{m.observaciones}</td>
                  <td className="px-6 py-4 text-body-sm">{m.documentacion}</td>
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
    </div>
  )
}
