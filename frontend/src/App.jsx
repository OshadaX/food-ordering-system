import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import MainLayout from './components/layout/MainLayout'
import PrivateRoute from './components/common/PrivateRoute'

import Register from './pages/customer/Register'
import Login from './pages/customer/Login'
import Profile from './pages/customer/Profile'

import MenuList from './pages/menu/MenuList'
import MenuForm from './pages/menu/MenuForm'

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

            {/* public routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<MenuList />} />
                <Route path="/menu" element={<MenuList />} />
                <Route path="/menu/add" element={<MenuForm />} />
                <Route path="/menu/edit/:id" element={<MenuForm />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order/confirm" element={<OrderConfirm />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/history" element={<PaymentHistory />} />
                <Route path="/tracking" element={<TrackOrder />} />
                <Route path="/tracking/:id" element={<OrderStatus />} />
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