import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import MainLayout        from '../components/layout/MainLayout'
import LoginPage         from '../features/auth/pages/LoginPage'
import DashboardPage     from '../features/dashboard/pages/DashboardPage'
import OfertasPage       from '../features/ofertas/pages/OfertasPage'
import ContratosPage     from '../features/contratos/pages/ContratosPage'
import MuestrasPage      from '../features/muestras/pages/MuestrasPage'
import ImportacionesPage from '../features/importaciones/pages/ImportacionesPage'
import ProvidersPage     from '../features/proveedores/pages/ProvidersPage'
import UsersPage         from '../features/usuarios/pages/UsersPage'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf3]">
      <span className="material-symbols-outlined animate-spin text-[#62C234] text-4xl">progress_activity</span>
    </div>
  )
  if (!token) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (token) return <Navigate to="/" replace />
  return children
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout headerTitle="Inicio"><DashboardPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/ofertas',
    element: <ProtectedRoute><MainLayout headerTitle="Ofertas"><OfertasPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/contratos',
    element: <ProtectedRoute><MainLayout headerTitle="Contratos"><ContratosPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/muestras',
    element: <ProtectedRoute><MainLayout headerTitle="Muestras"><MuestrasPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/importaciones',
    element: <ProtectedRoute><MainLayout headerTitle="Importaciones"><ImportacionesPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/proveedores',
    element: <ProtectedRoute><MainLayout headerTitle="Proveedores"><ProvidersPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/usuarios',
    element: <ProtectedRoute><MainLayout headerTitle="Usuarios"><UsersPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
