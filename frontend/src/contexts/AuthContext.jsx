import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token and fetch user
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      // For MVP, we'll just decode the token (in production, verify with backend)
      const userData = JSON.parse(localStorage.getItem('user') || 'null')
      if (userData) {
        setUser(userData)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    if (API_URL === 'MISSING_API_URL') {
      return {
        success: false,
        error: 'API URL not configured. Please set VITE_API_URL in Netlify environment variables.',
      }
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      })
      
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setToken(access_token)
      setUser(userData)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      }
    }
  }

  const signup = async (email, password, fullName, role = 'client') => {
    if (API_URL === 'MISSING_API_URL') {
      return {
        success: false,
        error: 'API URL not configured. Please set VITE_API_URL in Netlify environment variables.',
      }
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        email,
        password,
        full_name: fullName,
        role,
      })
      
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setToken(access_token)
      setUser(userData)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Signup failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

