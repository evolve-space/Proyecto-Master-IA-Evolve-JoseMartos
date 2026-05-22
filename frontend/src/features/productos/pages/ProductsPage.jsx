const products = [
  { id: 1, name: 'Logitech MX Master 3', sku: 'LOG-MX3-001', category: 'Office Equipment', stock: 124, price: '$99.00',  status: 'In Stock' },
  { id: 2, name: 'EC2 Reserved Instance',  sku: 'AWS-EC2-R01', category: 'Cloud Services',   stock: 999, price: '$150.00', status: 'In Stock' },
  { id: 3, name: 'Steel Rod 10mm',          sku: 'STL-ROD-010', category: 'Raw Materials',    stock: 12,  price: '$4.50',   status: 'Low Stock' },
  { id: 4, name: 'A4 Copy Paper (500s)',     sku: 'OFF-PAP-A4',  category: 'Office Supplies',  stock: 340, price: '$6.99',   status: 'In Stock' },
  { id: 5, name: 'Ergonomic Chair',          sku: 'FUR-CHR-001', category: 'Furniture',        stock: 0,   price: '$320.00', status: 'Out of Stock' },
]

const statusStyle = {
  'In Stock':     'bg-primary-container/20 text-primary',
  'Low Stock':    'bg-tertiary-fixed text-on-tertiary-container',
  'Out of Stock': 'bg-error-container text-error',
}

export default function ProductsPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Products</h2>
          <p className="text-body-sm text-slate-500 mt-1">{products.length} products in catalog</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </button>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length,                            icon: 'inventory_2' },
          { label: 'In Stock',       value: products.filter(p => p.status === 'In Stock').length,     icon: 'check_circle' },
          { label: 'Low Stock',      value: products.filter(p => p.status === 'Low Stock').length,    icon: 'warning' },
          { label: 'Out of Stock',   value: products.filter(p => p.status === 'Out of Stock').length, icon: 'cancel' },
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
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-base">inventory_2</span>
                      </div>
                      <span className="font-label-md text-on-surface">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm font-mono text-slate-500">{p.sku}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.category}</td>
                  <td className="px-6 py-4 font-label-md text-on-surface">{p.stock}</td>
                  <td className="px-6 py-4 font-label-md text-on-surface">{p.price}</td>
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
