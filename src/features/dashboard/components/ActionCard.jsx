import { useNavigate } from 'react-router-dom'

const ACTIONS = [
  { label: 'Nueva Oferta',      icon: 'local_offer',    to: '/ofertas',       cls: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' },
  { label: 'Nuevo Contrato',    icon: 'description',    to: '/contratos',     cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
  { label: 'Nueva Muestra',     icon: 'science',        to: '/muestras',      cls: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
  { label: 'Nueva Importación', icon: 'local_shipping', to: '/importaciones', cls: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200' },
  { label: 'Proveedores',       icon: 'factory',        to: '/proveedores',   cls: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200' },
  { label: 'Usuarios',          icon: 'group',          to: '/usuarios',      cls: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200' },
]

export default function ActionCard() {
  const navigate = useNavigate()
  return (
    <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl shadow-sm">
      <h3 className="font-label-md text-label-md text-on-surface mb-md">Acceso rápido</h3>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(({ label, icon, to, cls }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95 ${cls}`}
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
