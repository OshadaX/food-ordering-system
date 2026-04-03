import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { cartCount } = useCart()
    const navigate = useNavigate()
    const location = useLocation()

    const isAdmin = user?.role === 'admin'
    const isCustomer = user?.role === 'customer'

    const handleLogout = () => {
        logout()
        navigate('/menu')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0_40px_60px_rgba(229,226,221,0.06)]">
            <div className="flex justify-between items-center px-8 py-4 w-full max-w-none font-['Inter'] tracking-tight antialiased">
                {/* Brand Logo */}
                <Link to="/menu" className="text-2xl font-black text-[#e5e2e1] tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
                    <span className="text-[#FF8C00]">🔥</span> FoodOrder 
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link 
                        to="/menu" 
                        className={`${isActive('/menu') ? 'text-[#FF8C00] border-b-2 border-[#FF8C00] font-bold pb-1' : 'text-[#e5e2e1] font-medium opacity-80 hover:opacity-100 hover:text-[#ffb77d]'} transition-all duration-300 active:scale-95 transform`}
                    >
                        Menu
                    </Link>

                    {/* Customer-only links */}
                    {isCustomer && (
                        <>
                            <Link 
                                to="/tracking" 
                                className={`${isActive('/tracking') ? 'text-[#FF8C00] border-b-2 border-[#FF8C00] font-bold pb-1' : 'text-[#e5e2e1] font-medium opacity-80 hover:opacity-100 hover:text-[#ffb77d]'} transition-all duration-300 active:scale-95 transform`}
                            >
                                Track Order
                            </Link>
                            <Link 
                                to="/payment/history" 
                                className={`${isActive('/payment/history') ? 'text-[#FF8C00] border-b-2 border-[#FF8C00] font-bold pb-1' : 'text-[#e5e2e1] font-medium opacity-80 hover:opacity-100 hover:text-[#ffb77d]'} transition-all duration-300 active:scale-95 transform`}
                            >
                                My Orders
                            </Link>
                        </>
                    )}

                    {/* Admin-only links */}
                    {isAdmin && (
                        <>
                            <Link to="/admin/menu" className="text-[#f97316] text-sm font-bold bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">Admin Menu</Link>
                            <Link to="/admin/categories" className="text-[#f97316] text-sm font-bold bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">Categories</Link>
                            <Link to="/delivery" className="text-[#e5e2e1] font-medium opacity-80 hover:opacity-100 hover:text-[#ffb77d] transition-all">Delivery</Link>
                        </>
                    )}
                </div>

                {/* Trailing Actions */}
                <div className="flex items-center space-x-6">
                    {/* Cart */}
                    {isCustomer && (
                        <Link to="/cart" className="relative cursor-pointer active:scale-95 transition-transform group">
                            <span className="material-symbols-outlined text-[#e5e2e1] text-2xl group-hover:text-primary transition-colors">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <>
                            <div className="hidden sm:flex items-center space-x-3 border-l border-outline-variant/30 pl-6">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {isAdmin ? '🛡️' : 'A'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-on-surface font-medium text-sm leading-tight">{user.name}</span>
                                    {isAdmin && <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Admin</span>}
                                </div>
                            </div>

                            {/* Profile (Customer) */}
                            {isCustomer && (
                                <Link to="/profile" className="text-on-surface opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">settings</span>
                                </Link>
                            )}

                            <button onClick={handleLogout} className="px-4 py-1.5 border border-[#FF8C00] text-[#FF8C00] rounded-xl text-sm font-bold hover:bg-[#FF8C00] hover:text-[#131313] transition-all active:scale-95">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex space-x-3">
                            <Link to="/login" className="px-4 py-1.5 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-all">Sign In</Link>
                            <Link to="/register" className="px-5 py-1.5 bg-gradient-to-tr from-[#ffb77d] to-[#FF8C00] text-[#131313] rounded-xl text-sm font-bold hover:shadow-lg shadow-primary/20 transition-all">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}