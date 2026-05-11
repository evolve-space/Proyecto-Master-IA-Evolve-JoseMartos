import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('token'))
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback((tok) => {
    localStorage.setItem('token', tok)
    setToken(tok)
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('unauthorized')
        return r.json()
      })
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false))
  }, [token, logout])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
