import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import DashboardPage from '../features/dashboard/pages/DashboardPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout><DashboardPage /></MainLayout>,
  },
  // { path: '/proveedores', element: <MainLayout><ProveedoresPage /></MainLayout> },
  // { path: '/productos',   element: <MainLayout><ProductosPage /></MainLayout> },
  // { path: '/pedidos',     element: <MainLayout><PedidosPage /></MainLayout> },
  // { path: '/usuarios',    element: <MainLayout><UsuariosPage /></MainLayout> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
