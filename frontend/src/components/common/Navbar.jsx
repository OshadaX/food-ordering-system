import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/menu', label: 'Menu' },
  { to: '/cart', label: 'Cart' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/payment', label: 'Payment' },
]

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">Food Ordering System</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="main-nav">
          <div className="navbar-nav me-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3 text-white">
            <div className="small">
              <div className="fw-semibold">{user?.name || 'Guest'}</div>
              <div className="text-white-50 text-capitalize">{user?.role || 'visitor'}</div>
            </div>
            <button className="btn btn-outline-light btn-sm" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
