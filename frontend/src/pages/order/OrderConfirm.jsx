import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function OrderConfirm() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so the checkmark animation feels intentional
    const t = setTimeout(() => setShow(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="min-h-screen bg-surface px-6 py-28 flex items-center justify-center">
      <div className="mx-auto max-w-md w-full rounded-2xl border border-white/10 bg-surface-container-low p-10 text-center">
        {/* Checkmark */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500/30 bg-green-500/10"
          style={{ opacity: show ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-green-400"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-on-surface mb-2">Order Placed!</h1>
        <p className="text-on-surface-variant mb-1">
          Your order has been received by the kitchen.
        </p>
        {orderId && (
          <p className="text-sm font-bold text-primary mb-8">Order #{orderId}</p>
        )}

        <div className="space-y-3">
          {orderId && (
            <Link
              to={`/tracking/${orderId}`}
              className="block w-full rounded-xl bg-primary px-5 py-3 font-black text-on-primary"
            >
              Track Order
            </Link>
          )}
          <Link
            to="/tracking"
            className="block w-full rounded-xl border border-white/10 px-5 py-3 font-bold text-on-surface-variant hover:text-primary"
          >
            My Orders
          </Link>
          <Link
            to="/menu"
            className="block w-full rounded-xl border border-white/10 px-5 py-3 font-bold text-on-surface-variant hover:text-primary"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </main>
  )
}
