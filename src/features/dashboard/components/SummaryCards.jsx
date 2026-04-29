export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">

      {/* Ofertas activas */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-container/10 rounded-lg text-[#62C234]">
            <span className="material-symbols-outlined">local_offer</span>
          </div>
          <span className="text-primary font-label-sm text-label-sm flex items-center bg-primary/5 px-2 py-1 rounded">
            +12.5%
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Ofertas activas</p>
        <h2 className="font-h2 text-h2 text-on-surface">24</h2>
        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '65%' }} />
        </div>
      </div>

      {/* Contratos vigentes */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-tertiary-container/10 rounded-lg text-tertiary">
            <span className="material-symbols-outlined">description</span>
          </div>
          <span className="text-on-tertiary-container font-label-sm text-label-sm flex items-center bg-tertiary-container/20 px-2 py-1 rounded">
            3 próximos a vencer
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Contratos vigentes</p>
        <h2 className="font-h2 text-h2 text-on-surface">5</h2>
        <div className="mt-4 flex items-end gap-1 h-8">
          <div className="flex-1 bg-slate-100 rounded-sm h-3" />
          <div className="flex-1 bg-slate-100 rounded-sm h-5" />
          <div className="flex-1 bg-tertiary-container/60 rounded-sm h-8" />
          <div className="flex-1 bg-tertiary rounded-sm h-6" />
          <div className="flex-1 bg-slate-100 rounded-sm h-4" />
        </div>
      </div>

      {/* Muestras pendientes */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-secondary-container/10 rounded-lg text-secondary">
            <span className="material-symbols-outlined">science</span>
          </div>
          <span className="text-secondary font-label-sm text-label-sm flex items-center bg-secondary-container/20 px-2 py-1 rounded">
            2 en análisis
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Muestras pendientes</p>
        <h2 className="font-h2 text-h2 text-on-surface">5</h2>
        <div className="mt-4 flex items-end gap-1 h-8">
          <div className="flex-1 bg-slate-100 rounded-sm h-3" />
          <div className="flex-1 bg-slate-100 rounded-sm h-5" />
          <div className="flex-1 bg-secondary-container rounded-sm h-8" />
          <div className="flex-1 bg-secondary rounded-sm h-6" />
          <div className="flex-1 bg-slate-100 rounded-sm h-4" />
        </div>
      </div>

      {/* Importaciones del mes */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-container/10 rounded-lg text-[#62C234]">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-[#62C234] flex items-center justify-center">
            <span className="text-[#62C234] font-bold text-[10px]">4</span>
          </div>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Importaciones (mes)</p>
        <h2 className="font-h2 text-h2 text-on-surface">4</h2>
        <p className="text-body-sm font-body-sm text-slate-400 mt-4">86.700 kg importados</p>
      </div>

    </div>
  )
}
