import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTrackingDetails } from '../../services/trackingService'

const steps = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']

const statusDescription = {
  Received: 'Your order has reached the kitchen queue.',
  Preparing: 'Kitchen staff are preparing your food.',
  Ready: 'Your food is packed and ready for dispatch.',
  'Out for Delivery': 'Your order is on the way.',
  Delivered: 'Your order has been delivered.',
  Cancelled: 'This order was cancelled.',
}

export default function OrderStatus() {
  const { id } = useParams()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const lastStatus = useRef('')

  const loadDetails = useCallback(async () => {
    const data = await getTrackingDetails(id)
    if (data?.order) {
      if (lastStatus.current && lastStatus.current !== data.order.status) {
        setToast(`Order #${data.order.id} is now ${data.order.status}`)
        setTimeout(() => setToast(''), 3500)
      }
      lastStatus.current = data.order.status
      setDetails(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadDetails()
    // Poll every 3 s — always, so status appears instantly during demos
    const timer = setInterval(loadDetails, 3000)
    return () => clearInterval(timer)
  }, [loadDetails])

  const activeIndex = useMemo(() => {
    if (!details?.order) return 0
    if (details.order.status === 'Cancelled') return -1
    return steps.indexOf(details.order.status)
  }, [details])

  if (loading) {
    return (
      <main className="min-h-screen bg-surface px-6 py-28 text-center text-on-surface-variant">
        Loading tracking details...
      </main>
    )
  }

  if (!details?.order) {
    return (
      <main className="min-h-screen bg-surface px-6 py-28">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-surface-container-low p-10 text-center">
          <h1 className="text-3xl font-black text-on-surface">Order not found</h1>
          <Link to="/tracking" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-black text-on-primary">
            Back to orders
          </Link>
        </div>
      </main>
    )
  }

  const { order, history } = details

  return (
    <main className="min-h-screen bg-surface px-6 py-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {toast && (
          <div className="fixed right-6 top-24 z-50 rounded-xl border border-green-500/20 bg-green-500/15 px-5 py-3 text-sm font-bold text-green-300 shadow-xl">
            {toast}
          </div>
        )}

        <Link to="/tracking" className="mb-6 inline-flex text-sm font-bold text-primary hover:text-primary-container">
          Back to my orders
        </Link>

        <section className="mb-8 rounded-2xl border border-white/10 bg-surface-container-low p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-widest text-primary">Live Tracking</p>
              <h1 className="text-4xl font-black text-on-surface">Order #{order.id}</h1>
              <p className="mt-2 text-on-surface-variant">{statusDescription[order.status]}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-on-surface-variant">Total</p>
              <p className="font-mono text-2xl font-black text-on-surface">Rs. {Number(order.totalAmount).toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-white/10 bg-surface-container-low p-6">
          <h2 className="mb-6 text-xl font-black text-on-surface">Progress</h2>
          {order.status === 'Cancelled' ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
              This order has been cancelled.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-5">
              {steps.map((step, index) => {
                const done = index <= activeIndex
                return (
                  <div
                    key={step}
                    className={`rounded-xl border p-4 ${done ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/10 bg-black/10 text-on-surface-variant'}`}
                  >
                    <div className={`mb-3 h-3 w-3 rounded-full ${done ? 'bg-primary' : 'bg-white/20'}`}></div>
                    <p className="text-sm font-black">{step}</p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface-container-low p-6">
          <h2 className="mb-6 text-xl font-black text-on-surface">Status History</h2>
          <div className="space-y-4">
            {(history || []).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-black text-on-surface">{entry.status}</p>
                  <p className="text-sm text-on-surface-variant">{entry.updatedAt}</p>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Updated by {entry.updatedBy || 'System'}{entry.note ? ` - ${entry.note}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
