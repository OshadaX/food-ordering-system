import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute() {
    const { user } = useAuth()

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Logged in → show the page
    return <Outlet />
}