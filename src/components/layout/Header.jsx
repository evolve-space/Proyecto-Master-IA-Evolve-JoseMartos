import { useState } from 'react'
import { useAuth } from '../../app/AuthContext'

const tipoLabel = {
  superadmin: 'Super Admin',
  admin:      'Administrador',
  normal:     'Usuario',
}

export default function Header({ title = 'Dashboard', onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 bg-[#FCFDF7]/90 backdrop-blur-md border-b border-[#E2E4D9] flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 z-40 gap-4">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="flex-shrink-0 text-slate-500 hover:text-[#62C234] transition-colors"
          aria-label={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-h3 text-h3 text-on-background truncate">{title}</h1>
      </div>

      {/* Barra de acciones */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Buscador — visible en sm+ */}
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#62C234] text-[20px]">
            search
          </span>
          <input
            className="pl-9 pr-4 py-2 bg-white border border-[#E2E4D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#62C234]/40 focus:border-[#62C234] transition-all w-48 lg:w-64 text-sm"
            placeholder="Buscar…"
            type="text"
          />
        </div>

        {/* Buscador móvil — icono que expande */}
        <button
          className="sm:hidden text-slate-500 hover:text-[#62C234] transition-colors"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Buscar"
        >
          <span className="material-symbols-outlined">search</span>
        </button>

        {/* Perfil */}
        <div className="relative pl-2 sm:pl-4 border-l border-[#E2E4D9]">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg hover:bg-slate-50 px-1 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#62C234]/20 flex items-center justify-center font-bold text-[#276c00] text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-right leading-tight">
              <p className="text-sm font-semibold text-on-surface truncate max-w-[120px]">
                {user?.nombre ?? 'Usuario'}
              </p>
              <p className="text-xs text-slate-500">
                {tipoLabel[user?.tipo] ?? 'Usuario'}
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px] hidden md:block">
              expand_more
            </span>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-50 bg-white border border-[#E2E4D9] rounded-xl shadow-lg py-2 min-w-[180px]">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-semibold text-on-surface">{user?.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); logout() }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Buscador móvil expandido */}
      {searchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#E2E4D9] px-4 py-3 sm:hidden z-30">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-[#fafaf3] border border-[#E2E4D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#62C234]/40 focus:border-[#62C234] transition-all"
              placeholder="Buscar…"
              type="text"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  )
}

