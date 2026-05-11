const orders = [
  { id: '#PO-2024-081', product: 'Office Equipment',  provider: 'Logitech Inc.',  date: 'Apr 28, 2026', amount: '$1,450.00',  status: 'Pending' },
  { id: '#PO-2024-079', product: 'Cloud Services',    provider: 'AWS Global',     date: 'Apr 27, 2026', amount: '$12,890.00', status: 'Approved' },
  { id: '#PO-2024-078', product: 'Raw Materials',     provider: 'SteelWorks Co.', date: 'Apr 26, 2026', amount: '$45,000.00', status: 'Processing' },
  { id: '#PO-2024-075', product: 'Office Supplies',   provider: 'OfficeMax',      date: 'Apr 24, 2026', amount: '$780.00',    status: 'Delivered' },
  { id: '#PO-2024-072', product: 'Logistics Services', provider: 'FastShip Ltd.', date: 'Apr 22, 2026', amount: '$3,200.00',  status: 'Cancelled' },
]

const statusStyle = {
  Pending:    'bg-tertiary-fixed text-on-tertiary-container',
  Approved:   'bg-primary-container text-white',
  Processing: 'bg-secondary-container text-secondary',
  Delivered:  'bg-primary-container/20 text-primary',
  Cancelled:  'bg-error-container text-error',
}

const statusIcon = {
  Pending:    'schedule',
  Approved:   'check_circle',
  Processing: 'autorenew',
  Delivered:  'local_shipping',
  Cancelled:  'cancel',
}

export default function OrdersPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Orders</h2>
          <p className="text-body-sm text-slate-500 mt-1">{orders.length} purchase orders</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          New Order
        </button>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter mb-xl">
        {Object.keys(statusStyle).map((s) => (
          <div key={s} className="bg-white border border-[#E2E4D9] p-md rounded-xl shadow-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">{statusIcon[s]}</span>
            <div>
              <p className="text-body-sm text-slate-500">{s}</p>
              <p className="font-h3 text-h3 text-on-surface">
                {orders.filter((o) => o.status === s).length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-label-md text-on-surface">{o.id}</p>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.product}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                        {o.provider[0]}
                      </div>
                      <span className="text-body-sm">{o.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{o.date}</td>
                  <td className="px-6 py-4 font-label-md text-on-surface">{o.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${statusStyle[o.status]}`}>
                      {o.status}
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
