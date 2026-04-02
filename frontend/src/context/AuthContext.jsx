import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState({ id: 1, name: 'Test User', role: 'admin' })

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    // check localStorage on first load
    const storedUser = localStorage.getItem('user')
    const initialUser = storedUser ? JSON.parse(storedUser) : null

    return (
        <AuthContext.Provider value={{ user: user || initialUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}