import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {

    const { user, logout } = useAuth()
    const { cartCount } = useCart()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">

            {/* brand */}
            <Link className="navbar-brand fw-bold" to="/">
                FoodOrder
            </Link>

            {/* links */}
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/menu">Menu</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/tracking">Track Order</Link>
                    </li>
                </ul>

                {/* right side */}
                <ul className="navbar-nav ms-auto align-items-center gap-3">

                    {/* cart icon with count */}
                    <li className="nav-item">
                        <Link className="nav-link position-relative" to="/cart">
                            Cart
                            {cartCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </li>

                    {/* user info */}
                    {user && (
                        <li className="nav-item">
                            <span className="nav-link text-light">
                                {user.name}
                            </span>
                        </li>
                    )}

                    {/* logout */}
                    <li className="nav-item">
                        <button
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </li>

                </ul>
            </div>

        </nav>
    )
}