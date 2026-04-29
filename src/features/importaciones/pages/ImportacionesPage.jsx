const importaciones = [
  { id: 1, fechaDUA: '15/04/2026', fechaFactura: '10/04/2026', proveedor: 'SunFlower Industries', producto: 'Aceite de Girasol', cantidad: 20000, importeEUR: 24000, aranceles: 3.5, costeDespacho: 500, gastoImpKg: 0.03, costeKg: 1.23, importeUSD: 25920, tipoCambio: 1.08, forwarder: 'Maersk',    incoterm: 'CIF', observaciones: '-',                  documentacion: 'Sí' },
  { id: 2, fechaDUA: '05/04/2026', fechaFactura: '01/04/2026', proveedor: 'Palm Oil Co.',          producto: 'Aceite de Palma',   cantidad: 15000, importeEUR: 14700, aranceles: 3.5, costeDespacho: 400, gastoImpKg: 0.03, costeKg: 0.99, importeUSD: 15876, tipoCambio: 1.08, forwarder: 'MSC',       incoterm: 'CFR', observaciones: '-',                  documentacion: 'Sí' },
  { id: 3, fechaDUA: '22/03/2026', fechaFactura: '18/03/2026', proveedor: 'Soja Global S.L.',      producto: 'Aceite de Soja',    cantidad: 30000, importeEUR: 25200, aranceles: 0,   costeDespacho: 350, gastoImpKg: 0.01, costeKg: 0.85, importeUSD: 27216, tipoCambio: 1.08, forwarder: 'CMA CGM',  incoterm: 'EXW', observaciones: 'Sin aranceles UE',   documentacion: 'Sí' },
  { id: 4, fechaDUA: '10/03/2026', fechaFactura: '06/03/2026', proveedor: 'BioOils S.A.',          producto: 'Aceite de Canola',  cantidad: 5000,  importeEUR: 8875,  aranceles: 3.5, costeDespacho: 200, gastoImpKg: 0.05, costeKg: 1.81, importeUSD: 9585,  tipoCambio: 1.08, forwarder: 'Hapag',    incoterm: 'CIP', observaciones: '-',                  documentacion: 'No' },
]

export default function ImportacionesPage() {
  const totalImporteEUR = importaciones.reduce((s, i) => s + i.importeEUR, 0)
  const totalKg = importaciones.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Importaciones</h2>
          <p className="text-body-sm text-slate-500 mt-1">{importaciones.length} importaciones registradas</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Nueva Importación
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-xl">
        {[
          { label: 'Total operaciones', value: importaciones.length,                                     icon: 'local_shipping' },
          { label: 'Total kg',          value: totalKg.toLocaleString('es-ES'),                          icon: 'scale' },
          { label: 'Importe total (€)', value: totalImporteEUR.toLocaleString('es-ES') + ' €',           icon: 'euro' },
          { label: 'Con documentación', value: importaciones.filter(i => i.documentacion === 'Sí').length, icon: 'folder' },
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
                <th className="px-6 py-4">Fecha DUA / Albarán</th>
                <th className="px-6 py-4">Fecha Factura</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Cantidad (kg)</th>
                <th className="px-6 py-4">Importe (€)</th>
                <th className="px-6 py-4">Aranceles (%)</th>
                <th className="px-6 py-4">Coste Despacho</th>
                <th className="px-6 py-4">Gasto Imp/kg</th>
                <th className="px-6 py-4">Coste kg</th>
                <th className="px-6 py-4">Importe ($)</th>
                <th className="px-6 py-4">T. Cambio</th>
                <th className="px-6 py-4">Forwarder</th>
                <th className="px-6 py-4">Incoterm</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {importaciones.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{i.fechaDUA}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500 whitespace-nowrap">{i.fechaFactura}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{i.proveedor[0]}</div>
                      <span className="text-body-sm">{i.proveedor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{i.producto}</td>
                  <td className="px-6 py-4 font-label-md">{i.cantidad.toLocaleString('es-ES')}</td>
                  <td className="px-6 py-4 font-label-md">{i.importeEUR.toLocaleString('es-ES')} €</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{i.aranceles}%</td>
                  <td className="px-6 py-4 text-body-sm">{i.costeDespacho} €</td>
                  <td className="px-6 py-4 text-body-sm">{i.gastoImpKg.toFixed(2)} €</td>
                  <td className="px-6 py-4 font-label-md text-primary">{i.costeKg.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-body-sm">{i.importeUSD.toLocaleString('es-ES')} $</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{i.tipoCambio}</td>
                  <td className="px-6 py-4 text-body-sm">{i.forwarder}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{i.incoterm}</td>
                  <td className="px-6 py-4 text-body-sm">{i.documentacion}</td>
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
