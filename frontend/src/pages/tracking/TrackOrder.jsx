import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders, getNotifications, markNotificationsRead } from '../../services/trackingService'

const statusColor = {
  Received: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Preparing: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  Ready: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  'Out for Delivery': 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Delivered: 'bg-green-500/15 text-green-300 border-green-500/25',
  Cancelled: 'bg-red-500/15 text-red-300 border-red-500/25',
}

export default function TrackOrder() {
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications]
  )

  const loadData = useCallback(async () => {
    const [orderData, notificationData] = await Promise.all([
      getMyOrders(),
      getNotifications(),
    ])
    setOrders(orderData)
    setNotifications(notificationData)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    // Always poll — 3 s so the customer sees kitchen updates in near-real-time
    const timer = setInterval(loadData, 3000)
    return () => clearInterval(timer)
  }, [loadData])

  const handleMarkRead = useCallback(async () => {
    await markNotificationsRead()
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [])

  return (
    <main className="min-h-screen bg-surface px-6 py-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-widest text-primary">Order Tracking</p>
            <h1 className="text-4xl font-black tracking-tight text-on-surface">My Orders</h1>
            <p className="mt-2 max-w-2xl text-on-surface-variant">
              Follow your orders from received to delivery. This page refreshes automatically.
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkRead}
              className="self-start rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20"
            >
              Mark notifications read
            </button>
          )}
        </div>

        {unreadNotifications.length > 0 && (
          <section className="mb-8 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5">
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-orange-300">Latest updates</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {unreadNotifications.slice(0, 4).map((notification) => (
                <Link
                  key={notification.id}
                  to={`/tracking/${notification.orderId}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-on-surface transition hover:border-primary/40"
                >
                  <span className="font-bold">Order #{notification.orderId}</span>
                  <p className="mt-1 text-on-surface-variant">{notification.message}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-surface-container-low p-10 text-center text-on-surface-variant">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-surface-container-low p-10 text-center">
            <h2 className="text-2xl font-black text-on-surface">No orders yet</h2>
            <p className="mt-2 text-on-surface-variant">Place an order from the menu to start tracking it here.</p>
            <Link
              to="/menu"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-black text-on-primary transition hover:bg-primary-container"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/tracking/${order.id}`}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-container-low p-5 transition hover:border-primary/40 hover:bg-white/5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-on-surface">Order #{order.id}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusColor[order.status] || 'border-white/10 text-on-surface-variant'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{order.createdAt}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-mono text-lg font-black text-on-surface">Rs. {Number(order.totalAmount).toFixed(2)}</p>
                  <p className="text-sm font-bold text-primary">View timeline</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
