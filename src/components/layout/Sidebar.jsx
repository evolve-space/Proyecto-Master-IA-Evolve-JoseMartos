import { NavLink } from 'react-router-dom'

const navItems = [
  { icon: 'dashboard',      label: 'Inicio',         to: '/' },
  { icon: 'local_offer',    label: 'Ofertas',         to: '/ofertas' },
  { icon: 'description',    label: 'Contratos',       to: '/contratos' },
  { icon: 'science',        label: 'Muestras',        to: '/muestras' },
  { icon: 'local_shipping', label: 'Importaciones',   to: '/importaciones' },
  { icon: 'factory',        label: 'Proveedores',     to: '/proveedores' },
  { icon: 'group',          label: 'Usuarios',        to: '/usuarios' },
]

export default function Sidebar({ open = true, onClose }) {
  return (
    <aside
      className={`fixed left-0 top-0 w-[280px] h-screen border-r border-[#E2E4D9] bg-white flex flex-col z-50 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo + botón cerrar */}
      <div className="px-8 py-8 flex items-center justify-between">
        <span className="text-[#62C234] font-extrabold text-xl tracking-tight">
          ProcureFlow
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Cerrar sidebar"
        >
          <span className="material-symbols-outlined">menu_open</span>
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-1 py-4">
        {navItems.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              isActive
                ? 'text-[#62C234] font-bold bg-[#62C234]/10 border-r-4 border-[#62C234] py-3 px-8 flex items-center gap-4 transition-all duration-200'
                : 'text-slate-500 hover:text-[#62C234] hover:bg-slate-50 py-3 px-8 flex items-center gap-4 transition-all duration-200'
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-label-md text-label-md">{label}</span>
          </NavLink>
        ))}
      </nav>      
    </aside>
  )
}
