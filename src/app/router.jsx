import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import DashboardPage  from '../features/dashboard/pages/DashboardPage'
import ProvidersPage  from '../features/proveedores/pages/ProvidersPage'
import ProductsPage   from '../features/productos/pages/ProductsPage'
import OrdersPage     from '../features/pedidos/pages/OrdersPage'
import UsersPage      from '../features/usuarios/pages/UsersPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout headerTitle="Dashboard"><DashboardPage /></MainLayout>,
  },
  {
    path: '/proveedores',
    element: <MainLayout headerTitle="Providers"><ProvidersPage /></MainLayout>,
  },
  {
    path: '/productos',
    element: <MainLayout headerTitle="Products"><ProductsPage /></MainLayout>,
  },
  {
    path: '/pedidos',
    element: <MainLayout headerTitle="Orders"><OrdersPage /></MainLayout>,
  },
  {
    path: '/usuarios',
    element: <MainLayout headerTitle="Users"><UsersPage /></MainLayout>,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
