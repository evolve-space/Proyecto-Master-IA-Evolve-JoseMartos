import AppRouter from './router'
import { AuthProvider } from './AuthContext'

export default function Providers() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
