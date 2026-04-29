export default function Header({ title = 'Dashboard', onToggleSidebar, sidebarOpen }) {
  return (
    <header className="sticky top-0 bg-[#FCFDF7]/80 backdrop-blur-md border-b border-[#E2E4D9] flex justify-between items-center h-16 px-8 z-40">
      {/* Título de página + toggle sidebar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-slate-500 hover:text-[#62C234] transition-colors"
          aria-label={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-h3 text-h3 text-on-background">{title}</h1>
      </div>

      {/* Barra de acciones */}
      <div className="flex items-center gap-6">
        {/* Buscador */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#62C234]">
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-white border border-[#E2E4D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#62C234] focus:border-[#62C234] transition-all w-64 text-body-sm font-body-sm"
            placeholder="Search orders, providers..."
            type="text"
          />
        </div>

        {/* Perfil de usuario */}
        <div className="flex items-center gap-3 pl-6 border-l border-[#E2E4D9]">
          <div className="text-right">
            <p className="font-label-md text-label-md text-on-surface">Alex Thompson</p>
            <p className="text-body-sm font-body-sm text-slate-500">Procurement Manager</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
            <img
              alt="User Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuARgqBJlkAJsvA8oQ2XFpayYB_O5jfI2QwkyNXO-0XuMB9B4szhGd-A2kk4o1nqW-bsMYQkuWq_YjvYbrd1nQ4cRprCySMvKKw7-Zz6E84PtBcxfJaDPuXh39G54hNQndnS0AcECUw6rZE8az3u9O0ZAg8ccRRaoJ6WgGyPV4xXjQSwBq1Bql53adAj24LUgf2lbsDyUpyckcFAiF9nEnWXlHztbduWDUqqSKVA9PFA5H6jA1s5PcmtNYjHTgMJ_f9BgUuCJTnSQoQ"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
