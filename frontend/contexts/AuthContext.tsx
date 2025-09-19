'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  clientId: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (clientId: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('compare_bot_token')
    const clientId = localStorage.getItem('compare_bot_client_id')
    
    if (token && clientId) {
      setUser({ clientId, token })
    }
    setIsLoading(false)
  }, [])

  const login = async (clientId: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: clientId, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token
        
        localStorage.setItem('compare_bot_token', token)
        localStorage.setItem('compare_bot_client_id', clientId)
        setUser({ clientId, token })
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('compare_bot_token')
    localStorage.removeItem('compare_bot_client_id')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
