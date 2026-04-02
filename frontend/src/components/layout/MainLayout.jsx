import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'

export default function MainLayout() {
    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <Outlet />
            </div>
        </div>
    )
}