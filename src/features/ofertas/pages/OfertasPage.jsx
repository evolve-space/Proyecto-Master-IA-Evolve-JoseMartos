const ofertas = [
  { id: 1, fecha: '28/04/2026', proveedor: 'SunFlower Industries', producto: 'Aceite de Girasol',  grado: 'Food Grade', cantidad: 20000, precio: 1.25, moneda: 'EUR', incoterm: 'CIF', muestra: 'No', tipo: 'Contrato', documentacion: 'Sí' },
  { id: 2, fecha: '27/04/2026', proveedor: 'Palm Oil Co.',          producto: 'Aceite de Palma',    grado: 'HALAL',      cantidad: 15000, precio: 0.98, moneda: 'USD', incoterm: 'CFR', muestra: 'Sí', tipo: 'Pedido',   documentacion: 'No' },
  { id: 3, fecha: '25/04/2026', proveedor: 'Soja Global S.L.',      producto: 'Aceite de Soja',     grado: 'Feed Grade', cantidad: 30000, precio: 0.85, moneda: 'USD', incoterm: 'EXW', muestra: 'No', tipo: 'Contrato', documentacion: 'Sí' },
  { id: 4, fecha: '22/04/2026', proveedor: 'BioOils S.A.',          producto: 'Aceite de Canola',   grado: 'BIO',        cantidad: 10000, precio: 1.80, moneda: 'EUR', incoterm: 'CIP', muestra: 'Sí', tipo: 'Pedido',   documentacion: 'Sí' },
  { id: 5, fecha: '18/04/2026', proveedor: 'KosherFats Ltd.',       producto: 'Aceite de Coco',     grado: 'KOSHER',     cantidad: 5000,  precio: 2.10, moneda: 'EUR', incoterm: 'CIF', muestra: 'Sí', tipo: 'Contrato', documentacion: 'No' },
]

const tipoStyle = {
  Contrato: 'bg-primary-container/20 text-primary',
  Pedido:   'bg-secondary-container text-secondary',
}

export default function OfertasPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Ofertas</h2>
          <p className="text-body-sm text-slate-500 mt-1">{ofertas.length} ofertas registradas</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Nueva Oferta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-xl">
        {[
          { label: 'Total Ofertas',   value: ofertas.length,                                    icon: 'local_offer' },
          { label: 'Contratos',       value: ofertas.filter(o => o.tipo === 'Contrato').length,  icon: 'description' },
          { label: 'Pedidos',         value: ofertas.filter(o => o.tipo === 'Pedido').length,    icon: 'shopping_cart' },
          { label: 'Con Muestra',     value: ofertas.filter(o => o.muestra === 'Sí').length,     icon: 'science' },
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
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Cantidad (kg)</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Moneda</th>
                <th className="px-6 py-4">Incoterm</th>
                <th className="px-6 py-4">Muestra</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {ofertas.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{o.fecha}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{o.proveedor[0]}</div>
                      <span className="text-body-sm font-label-md">{o.proveedor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{o.producto}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.grado}</td>
                  <td className="px-6 py-4 font-label-md">{o.cantidad.toLocaleString('es-ES')}</td>
                  <td className="px-6 py-4 font-label-md">{o.precio.toFixed(2)}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.moneda}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.incoterm}</td>
                  <td className="px-6 py-4 text-body-sm">{o.muestra}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${tipoStyle[o.tipo]}`}>{o.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{o.documentacion}</td>
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
