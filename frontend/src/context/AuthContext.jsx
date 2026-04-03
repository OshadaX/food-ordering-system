import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    // Load from localStorage on first render
    const getInitialUser = () => {
        try {
            const storedUser = localStorage.getItem('user')
            return storedUser ? JSON.parse(storedUser) : null
        } catch {
            return null
        }
    }

    const [user, setUser] = useState(getInitialUser)

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    const isAdmin = () => user?.role === 'admin'
    const isCustomer = () => user?.role === 'customer'

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isCustomer }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}