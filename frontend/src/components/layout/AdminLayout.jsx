import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'

export default function AdminLayout() {
    return (
        <div style={{ minHeight: '100vh', background: '#0f172a' }}>
            <Navbar />
            <div style={{ paddingTop: '0' }}>
                <Outlet />
            </div>
        </div>
    )
}
