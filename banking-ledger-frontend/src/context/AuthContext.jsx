import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('bls_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('bls_token') || null)
  const [loading, setLoading] = useState(false)

  const saveAuth = (userData, tok) => {
    setUser(userData)
    setToken(tok)
    localStorage.setItem('bls_user', JSON.stringify(userData))
    localStorage.setItem('bls_token', tok)
  }

  const clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('bls_user')
    localStorage.removeItem('bls_token')
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const data = await authAPI.register({ name, email, password })
      saveAuth(data.user, data.token)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await authAPI.login({ email, password })
      saveAuth(data.user, data.token)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await authAPI.logout(token) } catch {}
    clearAuth()
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
