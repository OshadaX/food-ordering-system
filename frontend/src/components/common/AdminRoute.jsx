import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute() {
    const { user } = useAuth()

    // Not logged in → go to login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Logged in but not admin → send back to customer menu
    if (user.role !== 'admin') {
        return <Navigate to="/menu" replace />
    }

    // Admin → show the page
    return <Outlet />
}
