const tipoStyle = {
  'Administrador': 'bg-primary-container/20 text-primary',
  'Gestor':        'bg-secondary-container text-secondary',
  'Consultor':     'bg-slate-100 text-slate-500',
}

const usuarios = [
  { id: 1, nombre: 'Alex Thompson', tipo: 'Administrador' },
  { id: 2, nombre: 'Sara Méndez',   tipo: 'Gestor' },
  { id: 3, nombre: 'James Carter',  tipo: 'Gestor' },
  { id: 4, nombre: 'Linda Wu',      tipo: 'Consultor' },
  { id: 5, nombre: 'Tom Nielsen',   tipo: 'Gestor' },
]

export default function UsersPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Usuarios</h2>
          <p className="text-body-sm text-slate-500 mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Id</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-body-sm text-slate-400">#{u.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold">
                        {u.nombre.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <span className="font-label-md text-on-surface">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${tipoStyle[u.tipo]}`}>{u.tipo}</span>
                  </td>
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
