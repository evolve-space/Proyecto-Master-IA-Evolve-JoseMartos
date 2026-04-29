const providers = [
  { id: 1, name: 'Logitech Inc.',  category: 'Office Equipment', contact: 'sales@logitech.com',  status: 'Active',   rating: 5 },
  { id: 2, name: 'AWS Global',     category: 'Cloud Services',   contact: 'billing@aws.com',     status: 'Active',   rating: 5 },
  { id: 3, name: 'SteelWorks Co.', category: 'Raw Materials',    contact: 'orders@steelworks.io', status: 'Warning',  rating: 3 },
  { id: 4, name: 'OfficeMax',      category: 'Office Supplies',  contact: 'b2b@officemax.com',   status: 'Active',   rating: 4 },
  { id: 5, name: 'FastShip Ltd.',  category: 'Logistics',        contact: 'ops@fastship.net',    status: 'Inactive', rating: 2 },
]

const statusStyle = {
  Active:   'bg-primary-container/20 text-primary',
  Warning:  'bg-tertiary-fixed text-on-tertiary-container',
  Inactive: 'bg-slate-100 text-slate-500',
}

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-base ${i < count ? 'text-[#62C234]' : 'text-slate-200'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </div>
  )
}

export default function ProvidersPage() {
  return (
    <div>
      {/* Cabecera de sección */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Providers</h2>
          <p className="text-body-sm text-slate-500 mt-1">{providers.length} suppliers registered</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Add Provider
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center font-bold text-primary text-sm">
                        {p.name[0]}
                      </div>
                      <span className="font-label-md text-on-surface">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.category}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.contact}</td>
                  <td className="px-6 py-4"><Stars count={p.rating} /></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${statusStyle[p.status]}`}>
                      {p.status}
                    </span>
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
