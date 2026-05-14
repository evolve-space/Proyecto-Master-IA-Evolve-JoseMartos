import { NavLink } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'

const navItems = [
  { icon: 'dashboard',      label: 'Inicio',         to: '/' },
  { icon: 'local_offer',    label: 'Ofertas',         to: '/ofertas' },
  { icon: 'description',    label: 'Contratos',       to: '/contratos' },
  { icon: 'science',        label: 'Muestras',        to: '/muestras' },
  { icon: 'local_shipping', label: 'Importaciones',   to: '/importaciones' },
  { icon: 'factory',        label: 'Proveedores',     to: '/proveedores' },
  { icon: 'group',          label: 'Usuarios',        to: '/usuarios', superAdminOnly: true },
]

export default function Sidebar({ open = true, onClose }) {
  const { logout, user } = useAuth()
  const isSuperAdmin = user?.tipo === 'superadmin'

  const visibleItems = navItems.filter(item => !item.superAdminOnly || isSuperAdmin)

  return (
    <aside
      className={`fixed left-0 top-0 w-[280px] h-screen border-r border-[#E2E4D9] bg-white flex flex-col z-50 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo + botón cerrar */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[#E2E4D9]">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#62C234] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">inventory_2</span>
          </span>
          <span className="text-[#276c00] font-extrabold text-lg tracking-tight">ProcureFlow</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors lg:hidden"
          aria-label="Cerrar sidebar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-0.5 py-4 px-3 overflow-y-auto">
        {visibleItems.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => { if (window.innerWidth < 1024) onClose() }}
            className={({ isActive }) =>
              isActive
                ? 'text-[#276c00] font-semibold bg-[#62C234]/15 rounded-lg py-2.5 px-4 flex items-center gap-3 transition-all duration-150'
                : 'text-slate-500 hover:text-[#276c00] hover:bg-slate-50 rounded-lg py-2.5 px-4 flex items-center gap-3 transition-all duration-150'
            }
          >
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Pie — cerrar sesión */}
      <div className="border-t border-[#E2E4D9] p-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-lg py-2.5 px-4 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
