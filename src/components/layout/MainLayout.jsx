import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ChatBubble from '../ui/ChatBubble'

export default function MainLayout({ children, headerTitle }) {
  // En móvil el sidebar empieza cerrado; en desktop empieza abierto
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)

  // Cierra el sidebar automáticamente al reducir la pantalla a móvil
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => {
      if (!e.matches) setSidebarOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
          sidebarOpen ? 'lg:ml-[280px]' : 'ml-0'
        }`}
      >
        <Header
          title={headerTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </div>

      <ChatBubble />
    </div>
  )
}

