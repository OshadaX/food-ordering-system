import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { cartCount } = useCart()
    const navigate = useNavigate()

    const isAdmin = user?.role === 'admin'
    const isCustomer = user?.role === 'customer'

    const handleLogout = () => {
        logout()
        navigate('/menu')
    }

    return (
        <nav style={styles.nav}>
            {/* Brand */}
            <Link to="/menu" style={styles.brand}>
                <span style={styles.brandIcon}>🍔</span>
                FoodOrder
            </Link>

            {/* Nav Links */}
            <div style={styles.links}>
                {/* Always visible */}
                <Link to="/menu" style={styles.link}>Menu</Link>

                {/* Customer-only links */}
                {isCustomer && (
                    <>
                        <Link to="/tracking" style={styles.link}>Track Order</Link>
                        <Link to="/payment/history" style={styles.link}>My Orders</Link>
                    </>
                )}

                {/* Admin-only links */}
                {isAdmin && (
                    <>
                        <Link to="/admin/menu" style={styles.adminLink}>Admin Menu</Link>
                        <Link to="/admin/categories" style={styles.adminLink}>Categories</Link>
                        <Link to="/delivery" style={styles.link}>Delivery</Link>
                    </>
                )}
            </div>

            {/* Right side */}
            <div style={styles.rightSide}>
                {/* Cart — customer only */}
                {isCustomer && (
                    <Link to="/cart" style={styles.cartBtn}>
                        🛒
                        {cartCount > 0 && (
                            <span style={styles.cartBadge}>{cartCount}</span>
                        )}
                    </Link>
                )}

                {user ? (
                    <>
                        {/* User badge */}
                        <div style={styles.userBadge}>
                            <span style={styles.userIcon}>
                                {isAdmin ? '🛡️' : '👤'}
                            </span>
                            <span style={styles.userName}>{user.name}</span>
                            {isAdmin && (
                                <span style={styles.rolePill}>Admin</span>
                            )}
                        </div>

                        {/* Profile link for customer */}
                        {isCustomer && (
                            <Link to="/profile" style={styles.iconBtn} title="Profile">
                                ⚙️
                            </Link>
                        )}

                        {/* Logout */}
                        <button style={styles.logoutBtn} onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    /* Guest: show login/register */
                    <>
                        <Link to="/login" style={styles.loginBtn}>Sign In</Link>
                        <Link to="/register" style={styles.registerBtn}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: '64px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Inter', sans-serif",
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '16px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#f97316',
        fontSize: '20px',
        fontWeight: '800',
        textDecoration: 'none',
        flexShrink: 0,
    },
    brandIcon: {
        fontSize: '22px',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
        paddingLeft: '24px',
    },
    link: {
        color: 'rgba(255,255,255,0.65)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        padding: '6px 12px',
        borderRadius: '8px',
        transition: 'color 0.2s, background 0.2s',
    },
    adminLink: {
        color: '#f97316',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
        padding: '6px 12px',
        borderRadius: '8px',
        background: 'rgba(249,115,22,0.12)',
        border: '1px solid rgba(249,115,22,0.2)',
    },
    rightSide: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
    },
    cartBtn: {
        position: 'relative',
        color: 'rgba(255,255,255,0.8)',
        textDecoration: 'none',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: '-6px',
        right: '-8px',
        background: '#ef4444',
        color: '#fff',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        fontSize: '10px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '5px 12px',
    },
    userIcon: { fontSize: '14px' },
    userName: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: '13px',
        fontWeight: '500',
    },
    rolePill: {
        background: 'rgba(249,115,22,0.2)',
        color: '#f97316',
        borderRadius: '10px',
        padding: '1px 8px',
        fontSize: '11px',
        fontWeight: '700',
        marginLeft: '2px',
    },
    iconBtn: {
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        fontSize: '18px',
    },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.6)',
        borderRadius: '8px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    loginBtn: {
        color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        padding: '6px 14px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
    },
    registerBtn: {
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        color: '#fff',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
        padding: '7px 16px',
        borderRadius: '8px',
    },
}