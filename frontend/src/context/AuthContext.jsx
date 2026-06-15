import { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on load
    const storedUser = localStorage.getItem('vv_user')
    const storedToken = localStorage.getItem('vv_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      // Set auth header for subsequent requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/signin', { email, password })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('vv_user', JSON.stringify(data.user))
      localStorage.setItem('vv_token', data.token)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Invalid email or password'
      }
    }
  }

  const signUp = async (name, email, password) => {
    try {
      const { data } = await apiClient.post('/auth/signup', { name, email, password })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('vv_user', JSON.stringify(data.user))
      localStorage.setItem('vv_token', data.token)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to create account'
      }
    }
  }

  const signOut = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('vv_user')
    localStorage.removeItem('vv_token')
    delete apiClient.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: Boolean(token)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
