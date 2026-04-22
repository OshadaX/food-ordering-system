import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('food-ordering-user')
    return saved ? JSON.parse(saved) : { name: 'Demo User', role: 'admin' }
  })

  useEffect(() => {
    localStorage.setItem('food-ordering-user', JSON.stringify(user))
  }, [user])

  const login = (payload) => {
    const nextUser = {
      name: payload?.name || 'Demo User',
      role: payload?.role || 'admin',
      email: payload?.email || 'demo@foodordering.local',
    }
    setUser(nextUser)
    localStorage.setItem('token', 'demo-token')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('food-ordering-user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
