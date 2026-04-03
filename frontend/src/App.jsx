import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import PrivateRoute from './components/common/PrivateRoute'
import AdminRoute from './components/common/AdminRoute'

// Auth pages
import Register from './pages/customer/Register'
import Login from './pages/customer/Login'
import Profile from './pages/customer/Profile'

// Customer menu (public)
import MenuList from './pages/menu/MenuList'

// Admin menu
import AdminMenuList from './pages/admin/AdminMenuList'
import AdminCategoryList from './pages/admin/AdminCategoryList'
import MenuForm from './pages/menu/MenuForm'

// Customer pages
import Cart from './pages/order/Cart'
import OrderConfirm from './pages/order/OrderConfirm'
import Payment from './pages/payment/Payment'
import PaymentHistory from './pages/payment/PaymentHistory'
import TrackOrder from './pages/tracking/TrackOrder'
import OrderStatus from './pages/tracking/OrderStatus'
import DeliveryList from './pages/delivery/DeliveryList'
import DeliveryAssign from './pages/delivery/DeliveryAssign'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            {/* ─── Public: Auth pages (no layout) ─── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ─── Public + Customer: Menu page (always visible) ─── */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="/menu" element={<MenuList />} />
            </Route>

            {/* ─── Customer-only protected routes ─── */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order/confirm" element={<OrderConfirm />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/history" element={<PaymentHistory />} />
                <Route path="/tracking" element={<TrackOrder />} />
                <Route path="/tracking/:id" element={<OrderStatus />} />
              </Route>
            </Route>

            {/* ─── Admin-only protected routes ─── */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/menu" element={<AdminMenuList />} />
                <Route path="/admin/categories" element={<AdminCategoryList />} />
                <Route path="/admin/menu/add" element={<MenuForm />} />
                <Route path="/admin/menu/edit/:id" element={<MenuForm />} />
                <Route path="/delivery" element={<DeliveryList />} />
                <Route path="/delivery/assign" element={<DeliveryAssign />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}