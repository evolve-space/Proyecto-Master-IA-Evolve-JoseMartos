const contratos = [
  { id: 1, fecha: '01/03/2026', numeroContrato: 'CTR-2026-001', producto: 'Aceite de Girasol', proveedor: 'SunFlower Industries', precio: 1.20, grado: 'FOOD',      cantidad: 50000, cantidadPedida: 20000, cantidadPendiente: 30000, fechaCaducidad: '01/09/2026', documentacion: 'Sí' },
  { id: 2, fecha: '15/02/2026', numeroContrato: 'CTR-2026-002', producto: 'Aceite de Palma',   proveedor: 'Palm Oil Co.',          precio: 0.95, grado: 'HALAL',     cantidad: 30000, cantidadPedida: 15000, cantidadPendiente: 15000, fechaCaducidad: '15/08/2026', documentacion: 'Sí' },
  { id: 3, fecha: '10/01/2026', numeroContrato: 'CTR-2026-003', producto: 'Aceite de Soja',    proveedor: 'Soja Global S.L.',      precio: 0.82, grado: 'FOOD',      cantidad: 60000, cantidadPedida: 60000, cantidadPendiente: 0,     fechaCaducidad: '10/07/2026', documentacion: 'No' },
  { id: 4, fecha: '20/03/2026', numeroContrato: 'CTR-2026-004', producto: 'Aceite de Canola',  proveedor: 'BioOils S.A.',          precio: 1.75, grado: 'BIO',       cantidad: 20000, cantidadPedida: 5000,  cantidadPendiente: 15000, fechaCaducidad: '20/09/2026', documentacion: 'Sí' },
  { id: 5, fecha: '05/04/2026', numeroContrato: 'CTR-2026-005', producto: 'Aceite de Coco',    proveedor: 'KosherFats Ltd.',       precio: 2.05, grado: 'KOSHER',    cantidad: 10000, cantidadPedida: 3000,  cantidadPendiente: 7000,  fechaCaducidad: '05/10/2026', documentacion: 'Sí' },
]

export default function ContratosPage() {
  const totalTm = contratos.reduce((s, c) => s + c.cantidad, 0)
  const pendienteTm = contratos.reduce((s, c) => s + c.cantidadPendiente, 0)

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Contratos</h2>
          <p className="text-body-sm text-slate-500 mt-1">{contratos.length} contratos activos</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Nuevo Contrato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-xl">
        {[
          { label: 'Contratos activos', value: contratos.length,                                                   icon: 'description' },
          { label: 'Kg totales',        value: totalTm.toLocaleString('es-ES'),                                    icon: 'scale' },
          { label: 'Kg pendientes',     value: pendienteTm.toLocaleString('es-ES'),                               icon: 'pending' },
          { label: 'Con documentación', value: contratos.filter(c => c.documentacion === 'Sí').length,            icon: 'folder' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-[#E2E4D9] p-md rounded-xl shadow-sm flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <div>
              <p className="text-body-sm text-slate-500">{label}</p>
              <p className="font-h3 text-h3 text-on-surface">{value}</p>
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
                <th className="px-6 py-4">Nº Contrato</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Cantidad (kg)</th>
                <th className="px-6 py-4">Pedido (kg)</th>
                <th className="px-6 py-4">Pendiente (kg)</th>
                <th className="px-6 py-4">Vencimiento</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {contratos.map((c) => {
                const pct = Math.round((c.cantidadPedida / c.cantidad) * 100)
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-label-md text-primary">{c.numeroContrato}</td>
                    <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{c.fecha}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{c.proveedor[0]}</div>
                        <span className="text-body-sm">{c.proveedor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm">{c.producto}</td>
                    <td className="px-6 py-4 text-body-sm text-slate-500">{c.grado}</td>
                    <td className="px-6 py-4 font-label-md">{c.precio.toFixed(2)} €</td>
                    <td className="px-6 py-4 text-body-sm">{c.cantidad.toLocaleString('es-ES')}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-body-sm">{c.cantidadPedida.toLocaleString('es-ES')}</span>
                        <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm font-label-md text-on-surface">{c.cantidadPendiente.toLocaleString('es-ES')}</td>
                    <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{c.fechaCaducidad}</td>
                    <td className="px-6 py-4 text-body-sm">{c.documentacion}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
