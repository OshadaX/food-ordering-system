import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function StaffRoute() {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'admin' && user.role !== 'kitchen') {
        return <Navigate to="/menu" replace />
    }

    return <Outlet />
}
