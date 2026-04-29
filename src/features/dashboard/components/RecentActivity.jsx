const orders = [
  {
    id: '#PO-2024-081',
    category: 'Office Equipment',
    providerInitial: 'L',
    provider: 'Logitech Inc.',
    amount: '$1,450.00',
    status: 'Pending',
    statusClass: 'bg-tertiary-fixed text-on-tertiary-container',
  },
  {
    id: '#PO-2024-079',
    category: 'Cloud Services',
    providerInitial: 'A',
    provider: 'AWS Global',
    amount: '$12,890.00',
    status: 'Approved',
    statusClass: 'bg-primary-container text-white',
  },
  {
    id: '#PO-2024-078',
    category: 'Raw Materials',
    providerInitial: 'S',
    provider: 'SteelWorks Co.',
    amount: '$45,000.00',
    status: 'Processing',
    statusClass: 'bg-secondary-container text-secondary',
  },
]

export default function RecentActivity() {
  return (
    <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
      {/* Cabecera */}
      <div className="p-md border-b border-[#E2E4D9] flex justify-between items-center bg-[#FCFDF7]">
        <h3 className="font-h3 text-h3 text-on-surface">Recent Activity</h3>
        <button className="text-primary font-label-md text-label-md hover:underline">
          View All Orders
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Transaction</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E4D9]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-label-md text-on-surface">{order.id}</p>
                  <p className="text-body-sm text-slate-400">{order.category}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                      {order.providerInitial}
                    </div>
                    <span className="text-body-sm">{order.provider}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-label-md">{order.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${order.statusClass}`}>
                    {order.status}
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
  )
}
