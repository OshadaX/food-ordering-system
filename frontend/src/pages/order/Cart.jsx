import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { placeOrder } from '../../services/orderService'

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const itemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) return
    setLoading(true)
    setError('')
    const orderData = {
      items: cart.map((i) => ({
        menuItemId: i.id,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      totalAmount: cartTotal,
      discount: 0,
    }
    const result = await placeOrder(orderData)
    setLoading(false)
    if (result.status === 'success') {
      clearCart()
      navigate(`/order/confirm?orderId=${result.orderId}`)
    } else {
      setError(result.message || 'Failed to place order. Please try again.')
    }
  }, [cart, cartTotal, clearCart, navigate])

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-surface px-6 py-28">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-surface-container-low p-12 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-3xl font-black text-on-surface mb-2">Your cart is empty</h1>
          <p className="text-on-surface-variant mb-8">Add items from the menu to place an order.</p>
          <Link
            to="/menu"
            className="inline-flex rounded-xl bg-primary px-6 py-3 font-black text-on-primary"
          >
            Browse Menu
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-28 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-black uppercase tracking-widest text-primary">Your Order</p>
        <h1 className="mb-8 text-4xl font-black text-on-surface">Cart</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Items list */}
          <section className="rounded-2xl border border-white/10 bg-surface-container-low overflow-hidden">
            <div className="divide-y divide-white/10">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-on-surface truncate">{item.name}</p>
                    <p className="text-sm text-primary font-bold mt-0.5">Rs. {item.price}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-white/10 bg-surface flex items-center justify-center text-on-surface font-bold hover:border-primary/40"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-black text-on-surface">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-white/10 bg-surface flex items-center justify-center text-on-surface font-bold hover:border-primary/40"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="w-24 text-right font-black text-on-surface font-mono">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 font-bold text-lg ml-1"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Order summary */}
          <aside className="rounded-2xl border border-white/10 bg-surface-container-low p-5 self-start">
            <h2 className="mb-4 text-lg font-black text-on-surface">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Items ({itemCount})</span>
                <span className="font-bold text-on-surface font-mono">Rs. {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Delivery</span>
                <span className="font-bold text-green-400">Free</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mb-5 flex justify-between">
              <span className="font-black text-on-surface">Total</span>
              <span className="font-black text-xl text-primary font-mono">Rs. {cartTotal.toFixed(2)}</span>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full rounded-xl bg-primary px-5 py-3 font-black text-on-primary disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            <Link
              to="/menu"
              className="mt-3 block text-center text-sm font-bold text-on-surface-variant hover:text-primary"
            >
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
