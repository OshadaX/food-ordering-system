import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute() {
    const { user } = useAuth()

    // if not logged in → redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // if logged in → show the page
    return <Outlet />
}