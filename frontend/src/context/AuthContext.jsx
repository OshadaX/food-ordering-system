import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const testAdminUser = { id: 1, name: 'Test Admin', role: 'admin' }
    const testCustomerUser = { id: 2, name: 'Test Customer', role: 'customer' }

    // Change to testAdminUser if you want to test the admin pages
    const [user, setUser] = useState(testCustomerUser)
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