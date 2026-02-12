import { createContext, useState, useEffect } from 'react'
import { authService } from '../api/services'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser()
      setUser(response.data.data)
    } catch {
      // Don't log auth check failures to avoid spam
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    // Tokens are set as httpOnly cookies by backend
    setUser(response.data.data.user)
    return response.data
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    return response.data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout API failures and clear local auth state.
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
