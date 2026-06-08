import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [username, setUsername]   = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Credenciales incorrectas')
      }
      const { token } = await res.json()
      login(token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }} className="bg-[#fafaf3] flex items-center justify-center px-4 py-8">
      <div style={{ width: '100%', maxWidth: '26rem' }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[#62C234] font-extrabold text-3xl tracking-tight">ProcureFlow</span>
          <p className="text-slate-500 text-sm mt-2">Sistema de Gestión de Compras</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E2E4D9] rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-bold text-on-surface mb-1">Iniciar sesión</h1>
          <p className="text-sm text-slate-500 mb-6">Introduce tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E2E4D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#62C234]/40 focus:border-[#62C234] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-[#E2E4D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#62C234]/40 focus:border-[#62C234] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPwd ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#276c00] text-white font-semibold py-2.5 rounded-lg hover:bg-[#276c00]/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Iniciando sesión…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Credenciales de prueba: <span className="font-mono">superadmin / superadmin</span>
          </p>
        </div>
      </div>
    </div>
  )
}
