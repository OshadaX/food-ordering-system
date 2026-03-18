import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import MainLayout from './components/layout/MainLayout'
import PrivateRoute from './components/common/PrivateRoute'

// Member 1
import Register from './pages/customer/Register'
import Login    from './pages/customer/Login'
import Profile  from './pages/customer/Profile'

// Member 2
import MenuList from './pages/menu/MenuList'
import MenuForm from './pages/menu/MenuForm'

// Member 3
import Cart         from './pages/order/Cart'
import OrderConfirm from './pages/order/OrderConfirm'

// Member 4
import Payment        from './pages/payment/Payment'
import PaymentHistory from './pages/payment/PaymentHistory'

// Member 5
import TrackOrder  from './pages/tracking/TrackOrder'
import OrderStatus from './pages/tracking/OrderStatus'

// Member 6
import DeliveryList   from './pages/delivery/DeliveryList'
import DeliveryAssign from './pages/delivery/DeliveryAssign'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            {/* Public routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login"    element={<Login />} />

            {/* Protected routes — wrapped in MainLayout */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/"                 element={<MenuList />} />
                <Route path="/profile"          element={<Profile />} />
                <Route path="/menu"             element={<MenuList />} />
                <Route path="/menu/add"         element={<MenuForm />} />
                <Route path="/cart"             element={<Cart />} />
                <Route path="/order/confirm"    element={<OrderConfirm />} />
                <Route path="/payment"          element={<Payment />} />
                <Route path="/payment/history"  element={<PaymentHistory />} />
                <Route path="/tracking"         element={<TrackOrder />} />
                <Route path="/tracking/:id"     element={<OrderStatus />} />
                <Route path="/delivery"         element={<DeliveryList />} />
                <Route path="/delivery/assign"  element={<DeliveryAssign />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}