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

    const login = (userData, token) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        if (token) {
            localStorage.setItem('token', token)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    const isAdmin = () => user?.role === 'admin'
    const isKitchen = () => user?.role === 'kitchen'
    const isStaff = () => user?.role === 'admin' || user?.role === 'kitchen'
    const isCustomer = () => user?.role === 'customer'

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isKitchen, isStaff, isCustomer }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
