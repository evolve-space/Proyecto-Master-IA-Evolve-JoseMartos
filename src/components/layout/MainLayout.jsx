import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({ children, headerTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="font-body-md text-on-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-[280px]' : 'ml-0'
        }`}
      >
        <Header
          title={headerTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

