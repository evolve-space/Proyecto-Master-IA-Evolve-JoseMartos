export default function SummaryCards({ ofertas, contratos, contratosProxVencer, muestras, muestrasAnalisis, importYear, totalKgYear, totalEurYear = 0 }) {
  const pctConMuestra = ofertas.length ? Math.round(ofertas.filter(o => o.muestra).length / ofertas.length * 100) : 0
  const pctConDoc     = contratos.length ? Math.round(contratos.filter(c => c.documentacion).length / contratos.length * 100) : 0
  const compra        = muestras.filter(m => m.estado === 'Compra').length
  const pendiente     = muestras.filter(m => m.estado === 'Pendiente').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">

      {/* Ofertas */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-container/10 rounded-lg text-[#62C234]">
            <span className="material-symbols-outlined">local_offer</span>
          </div>
          <span className="text-primary font-label-sm text-label-sm flex items-center bg-primary/5 px-2 py-1 rounded">
            {pctConMuestra}% con muestra
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Ofertas totales</p>
        <h2 className="font-h2 text-h2 text-on-surface">{ofertas.length}</h2>
        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pctConMuestra}%` }} />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{ofertas.filter(o => o.muestra).length} con muestra solicitada</p>
      </div>

      {/* Contratos */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-tertiary-container/10 rounded-lg text-tertiary">
            <span className="material-symbols-outlined">description</span>
          </div>
          {contratosProxVencer.length > 0 ? (
            <span className="text-orange-600 font-label-sm text-label-sm flex items-center bg-orange-50 px-2 py-1 rounded">
              {contratosProxVencer.length} por vencer
            </span>
          ) : (
            <span className="text-[#62C234] font-label-sm text-label-sm flex items-center bg-primary/5 px-2 py-1 rounded">
              Al día
            </span>
          )}
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Contratos</p>
        <h2 className="font-h2 text-h2 text-on-surface">{contratos.length}</h2>
        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-tertiary transition-all" style={{ width: `${pctConDoc}%` }} />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{contratos.filter(c => c.documentacion).length} con documentación</p>
      </div>

      {/* Muestras */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-secondary-container/10 rounded-lg text-secondary">
            <span className="material-symbols-outlined">science</span>
          </div>
          <span className="text-secondary font-label-sm text-label-sm flex items-center bg-secondary-container/20 px-2 py-1 rounded">
            {muestrasAnalisis.length} en análisis
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Muestras</p>
        <h2 className="font-h2 text-h2 text-on-surface">{muestras.length}</h2>
        <div className="mt-4 flex items-end gap-1 h-8">
          {[
            { estado: 'Pendiente', count: pendiente,          color: 'bg-slate-300' },
            { estado: 'Análisis',  count: muestrasAnalisis.length, color: 'bg-secondary' },
            { estado: 'Compra',    count: compra,             color: 'bg-primary' },
          ].map(({ estado, count, color }) => {
            const h = muestras.length ? Math.max(4, Math.round(count / muestras.length * 32)) : 4
            return <div key={estado} className={`flex-1 ${color} rounded-sm transition-all`} style={{ height: `${h}px` }} title={`${estado}: ${count}`} />
          })}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{compra} aprobadas · {pendiente} pendientes</p>
      </div>

      {/* Importaciones */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-container/10 rounded-lg text-[#62C234]">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <span className="text-primary font-label-sm text-label-sm flex items-center bg-primary/5 px-2 py-1 rounded">
            {new Date().getFullYear()}
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Importaciones año</p>
        <h2 className="font-h2 text-h2 text-on-surface">{importYear.length}</h2>
        <p className="text-body-sm font-body-sm text-slate-400 mt-2">
          {totalKgYear.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg importados
        </p>
        {totalEurYear > 0 && (
          <p className="text-sm font-semibold text-primary mt-1">
            {totalEurYear.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} gasto acumulado
          </p>
        )}
      </div>

    </div>
  )
}

