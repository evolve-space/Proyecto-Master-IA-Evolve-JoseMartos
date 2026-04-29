const users = [
  { id: 1, name: 'Alex Thompson',  email: 'alex@procureflow.io',   role: 'Procurement Manager', department: 'Operations',  status: 'Active',   avatar: 'AT' },
  { id: 2, name: 'Sara Méndez',    email: 'sara@procureflow.io',   role: 'Buyer',               department: 'Purchasing', status: 'Active',   avatar: 'SM' },
  { id: 3, name: 'James Carter',   email: 'james@procureflow.io',  role: 'Approver',            department: 'Finance',    status: 'Active',   avatar: 'JC' },
  { id: 4, name: 'Linda Wu',       email: 'linda@procureflow.io',  role: 'Viewer',              department: 'Logistics',  status: 'Inactive', avatar: 'LW' },
  { id: 5, name: 'Tom Nielsen',    email: 'tom@procureflow.io',    role: 'Buyer',               department: 'Purchasing', status: 'Active',   avatar: 'TN' },
]

const roleStyle = {
  'Procurement Manager': 'bg-primary-container/20 text-primary',
  'Buyer':               'bg-secondary-container text-secondary',
  'Approver':            'bg-tertiary-fixed text-on-tertiary-container',
  'Viewer':              'bg-slate-100 text-slate-500',
}

const statusStyle = {
  Active:   'bg-primary-container/20 text-primary',
  Inactive: 'bg-slate-100 text-slate-500',
}

export default function UsersPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Users</h2>
          <p className="text-body-sm text-slate-500 mt-1">{users.length} team members</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">person_add</span>
          Invite User
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-xl">
        {[
          { label: 'Total Users',   value: users.length,                                     icon: 'group' },
          { label: 'Active',        value: users.filter((u) => u.status === 'Active').length,   icon: 'check_circle' },
          { label: 'Inactive',      value: users.filter((u) => u.status === 'Inactive').length, icon: 'block' },
          { label: 'Departments',   value: new Set(users.map((u) => u.department)).size,        icon: 'corporate_fare' },
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">{u.name}</p>
                        <p className="text-body-sm text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${roleStyle[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{u.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${statusStyle[u.status]}`}>
                      {u.status}
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
