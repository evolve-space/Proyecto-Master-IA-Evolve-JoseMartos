import './DashboardPage.css'

const stats = [
  { label: 'Proveedores', value: '0', key: 'proveedores' },
  { label: 'Productos',   value: '0', key: 'productos'   },
  { label: 'Pedidos',     value: '0', key: 'pedidos'     },
  { label: 'Usuarios',    value: '0', key: 'usuarios'    },
]

export default function DashboardPage() {
  return (
    <div>
      <h1 className="dashboard__title">Dashboard</h1>

      {/* Tarjetas de resumen */}
      <div className="dashboard__stats">
        {stats.map(({ label, value, key }) => (
          <div key={key} className={`dashboard__stat-card dashboard__stat-card--${key}`}>
            <p className="dashboard__stat-label">{label}</p>
            <p className="dashboard__stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Panel de actividad reciente */}
      <div className="dashboard__activity">
        <h2 className="dashboard__activity-title">Actividad reciente</h2>
        <p className="dashboard__activity-empty">Aún no hay actividad registrada.</p>
      </div>
    </div>
  )
}
