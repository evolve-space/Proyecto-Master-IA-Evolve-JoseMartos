import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout        from '../components/layout/MainLayout'
import DashboardPage     from '../features/dashboard/pages/DashboardPage'
import OfertasPage       from '../features/ofertas/pages/OfertasPage'
import ContratosPage     from '../features/contratos/pages/ContratosPage'
import MuestrasPage      from '../features/muestras/pages/MuestrasPage'
import ImportacionesPage from '../features/importaciones/pages/ImportacionesPage'
import ProvidersPage     from '../features/proveedores/pages/ProvidersPage'
import UsersPage         from '../features/usuarios/pages/UsersPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout headerTitle="Inicio"><DashboardPage /></MainLayout>,
  },
  {
    path: '/ofertas',
    element: <MainLayout headerTitle="Ofertas"><OfertasPage /></MainLayout>,
  },
  {
    path: '/contratos',
    element: <MainLayout headerTitle="Contratos"><ContratosPage /></MainLayout>,
  },
  {
    path: '/muestras',
    element: <MainLayout headerTitle="Muestras"><MuestrasPage /></MainLayout>,
  },
  {
    path: '/importaciones',
    element: <MainLayout headerTitle="Importaciones"><ImportacionesPage /></MainLayout>,
  },
  {
    path: '/proveedores',
    element: <MainLayout headerTitle="Proveedores"><ProvidersPage /></MainLayout>,
  },
  {
    path: '/usuarios',
    element: <MainLayout headerTitle="Usuarios"><UsersPage /></MainLayout>,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
