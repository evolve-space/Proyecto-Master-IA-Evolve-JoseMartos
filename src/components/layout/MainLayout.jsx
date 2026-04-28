import './MainLayout.css'

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="layout__sidebar">
        <h2 className="layout__sidebar-title">CRM Aceites</h2>
        {[
          { label: 'Dashboard',   href: '/' },
          { label: 'Proveedores', href: '/proveedores' },
          { label: 'Productos',   href: '/productos' },
          { label: 'Pedidos',     href: '/pedidos' },
          { label: 'Usuarios',    href: '/usuarios' },
        ].map(({ label, href }) => (
          <a key={href} href={href} className="layout__nav-link">
            {label}
          </a>
        ))}
      </aside>

      {/* Contenido principal */}
      <div className="layout__content">
        <header className="layout__header">
          <span className="layout__header-spacer" />
          <span className="layout__header-user">Admin</span>
        </header>

        <main className="layout__main">
          {children}
        </main>
      </div>
    </div>
  )
}
