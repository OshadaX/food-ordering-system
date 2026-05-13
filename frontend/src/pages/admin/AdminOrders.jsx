import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  archiveOrder,
  cancelOrder,
  getAllOrders,
  getTrackingDetails,
  updateOrderStatus,
} from '../../services/trackingService'
import { useAuth } from '../../context/AuthContext'

// ─── Status workflow definition (single source of truth) ────────────────────
const STATUS_FLOW = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']
const TERMINAL_STATUSES = ['Delivered', 'Cancelled']

// Returns the ONE valid next status from the normal flow, or null
function getNextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current)
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[idx + 1]
}

// Frontend validation: returns error string or null
function validateTransition(current, next) {
  if (TERMINAL_STATUSES.includes(current)) {
    return `Order is already "${current}". Terminal orders cannot be changed.`
  }
  if (next === current) {
    return `Order is already set to "${current}".`
  }
  if (next === 'Cancelled') return null // always allowed for active orders
  const currentIdx = STATUS_FLOW.indexOf(current)
  const nextIdx = STATUS_FLOW.indexOf(next)
  if (nextIdx < currentIdx) {
    return `Cannot go back from "${current}" to "${next}". Status can only move forward.`
  }
  if (nextIdx > currentIdx + 1) {
    return `Cannot skip from "${current}" to "${next}". Must go through "${STATUS_FLOW[currentIdx + 1]}" first.`
  }
  return null
}

const badgeClass = {
  Received: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Preparing: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  Ready: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  'Out for Delivery': 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Delivered: 'bg-green-500/15 text-green-300 border-green-500/25',
  Cancelled: 'bg-red-500/15 text-red-300 border-red-500/25',
}

export default function AdminOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ text: '', type: 'success' }) // type: 'success' | 'error'
  const [filter, setFilter] = useState('active')
  const [showRules, setShowRules] = useState(false)
  const isAdmin = user?.role === 'admin'
  const toastTimer = useRef(null)

  // ─── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((text, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ text, type })
    toastTimer.current = setTimeout(() => setToast({ text: '', type: 'success' }), 4000)
  }, [])

  // ─── Load orders — always poll every 3 s (no document.hidden skip) ─────────
  const selectedIdRef = useRef(null)

  const loadOrders = useCallback(async () => {
    const data = await getAllOrders()
    if (data) {
      setOrders(data)
      setLoading(false)
      // Auto-refresh the history panel if an order is selected
      if (selectedIdRef.current) {
        const details = await getTrackingDetails(selectedIdRef.current)
        if (details) setSelected(details)
      }
    }
  }, [])

  useEffect(() => {
    loadOrders()
    // 3-second poll, always running — no document.hidden skip
    const timer = setInterval(loadOrders, 3000)
    return () => {
      clearInterval(timer)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [loadOrders])

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((o) => !TERMINAL_STATUSES.includes(o.status))
  }, [orders, filter])

  // ─── Status change with frontend validation + optimistic update ────────────
  const handleStatusChange = useCallback(async (order, nextStatus) => {
    // 1. Frontend validation first — show error immediately, no API call needed
    const validationError = validateTransition(order.status, nextStatus)
    if (validationError) {
      showToast(`⚠ Validation: ${validationError}`, 'error')
      return
    }

    // 2. Optimistically update the local list so the badge flips immediately
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    )

    // 3. Call API
    const result = await updateOrderStatus(order.id, nextStatus, `Moved to ${nextStatus}`)

    if (result.status === 'success') {
      showToast(`✓ Order #${order.id} updated to "${nextStatus}"`, 'success')
    } else {
      // Rollback optimistic update on API error
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: order.status } : o))
      )
      showToast(`✗ ${result.message || 'Status update failed'}`, 'error')
    }

    // Refresh both list and history panel
    await loadOrders()
  }, [loadOrders, showToast])

  // ─── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = useCallback(async (order) => {
    if (TERMINAL_STATUSES.includes(order.status)) {
      showToast(`⚠ Validation: Cannot cancel — order is already "${order.status}".`, 'error')
      return
    }
    if (!window.confirm(`Cancel order #${order.id}? This cannot be undone.`)) return
    const result = await cancelOrder(order.id, 'Cancelled from order dashboard')
    showToast(
      result.status === 'success'
        ? `✓ Order #${order.id} has been cancelled.`
        : `✗ ${result.message}`,
      result.status === 'success' ? 'success' : 'error'
    )
    await loadOrders()
  }, [loadOrders, showToast])

  // ─── Archive ──────────────────────────────────────────────────────────────
  const handleArchive = useCallback(async (order) => {
    if (!TERMINAL_STATUSES.includes(order.status)) {
      showToast(`⚠ Validation: Only Delivered or Cancelled orders can be archived.`, 'error')
      return
    }
    const result = await archiveOrder(order.id)
    showToast(
      result.status === 'success'
        ? `✓ Order #${order.id} archived.`
        : `✗ ${result.message}`,
      result.status === 'success' ? 'success' : 'error'
    )
    selectedIdRef.current = null
    setSelected(null)
    await loadOrders()
  }, [loadOrders, showToast])

  // ─── History panel ────────────────────────────────────────────────────────
  const openDetails = useCallback(async (order) => {
    selectedIdRef.current = order.id
    const details = await getTrackingDetails(order.id)
    if (details) setSelected(details)
  }, [])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface px-6 py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-widest text-primary">Order Control</p>
            <h1 className="text-4xl font-black text-on-surface">Order Tracking Dashboard</h1>
            <p className="mt-2 max-w-2xl text-on-surface-variant text-sm">
              Real-time order management. Status updates apply immediately.
              Polling every 3 seconds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRules((v) => !v)}
              className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
            >
              {showRules ? 'Hide' : 'Show'} Status Rules
            </button>
            <div className="inline-flex rounded-xl border border-white/10 bg-surface-container-low p-1">
              <button
                onClick={() => setFilter('active')}
                className={`rounded-lg px-4 py-2 text-sm font-black ${filter === 'active' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-4 py-2 text-sm font-black ${filter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* ── Validation / Status Rules Panel ── */}
        {showRules && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-surface-container-low p-5">
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-primary">Status Transition Rules</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-green-400">✓ Valid Transitions</p>
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-on-surface">
                  {STATUS_FLOW.map((s, i) => (
                    <span key={s} className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass[s]}`}>{s}</span>
                      {i < STATUS_FLOW.length - 1 && <span className="text-on-surface-variant">→</span>}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-green-400">Any active order can also be moved to → <span className={`rounded-full border px-2 py-0.5 ${badgeClass['Cancelled']}`}>Cancelled</span></p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-red-400">✗ Blocked Transitions</p>
                <ul className="space-y-1 text-xs text-red-300">
                  <li>• Cannot skip steps (e.g. Received → Ready)</li>
                  <li>• Cannot go backward (e.g. Ready → Received)</li>
                  <li>• Cannot change Delivered or Cancelled orders</li>
                  <li>• Cannot archive an active/preparing order</li>
                  <li>• Cannot cancel already terminal orders</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast notification ── */}
        {toast.text && (
          <div
            className={`mb-6 rounded-xl border px-5 py-3 text-sm font-bold ${
              toast.type === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-300'
                : 'border-green-500/30 bg-green-500/10 text-green-300'
            }`}
          >
            {toast.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          {/* ── Orders table ── */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Order</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Customer</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Update Status</th>
                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-widest text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center text-on-surface-variant">Loading orders...</td>
                    </tr>
                  ) : visibleOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center text-on-surface-variant">No orders found.</td>
                    </tr>
                  ) : (
                    visibleOrders.map((order) => {
                      const isTerminal = TERMINAL_STATUSES.includes(order.status)
                      const nextAllowed = getNextStatus(order.status)
                      return (
                        <tr key={order.id} className="hover:bg-white/5">
                          {/* Order ID */}
                          <td className="px-5 py-4">
                            <button onClick={() => openDetails(order)} className="font-black text-primary">
                              #{order.id}
                            </button>
                            <p className="mt-1 text-xs text-on-surface-variant">{order.createdAt}</p>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4 text-sm font-bold text-on-surface">{order.customerName}</td>

                          {/* Current status badge */}
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-3 py-1 text-xs font-black ${badgeClass[order.status] || 'border-white/10 text-on-surface-variant'}`}>
                              {order.status}
                            </span>
                            {nextAllowed && (
                              <p className="mt-1 text-xs text-on-surface-variant">Next: {nextAllowed}</p>
                            )}
                          </td>

                          {/* Status dropdown */}
                          <td className="px-5 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              disabled={isTerminal}
                              title={isTerminal ? `This order is ${order.status} and cannot be changed.` : 'Select new status'}
                              className="min-w-[170px] rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm font-bold text-on-surface outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {/* Only show current + valid next options to prevent confusion */}
                              {STATUS_FLOW.concat(['Cancelled']).map((s) => {
                                const sIdx = STATUS_FLOW.indexOf(s)
                                const curIdx = STATUS_FLOW.indexOf(order.status)
                                const isCurrent = s === order.status
                                const isValidNext = s === 'Cancelled'
                                  ? !isTerminal
                                  : sIdx === curIdx + 1
                                if (!isCurrent && !isValidNext) return null
                                return (
                                  <option key={s} value={s}>{s}</option>
                                )
                              })}
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openDetails(order)}
                                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-on-surface-variant hover:border-primary/40 hover:text-primary"
                              >
                                History
                              </button>
                              {!isTerminal ? (
                                <button
                                  onClick={() => handleCancel(order)}
                                  className="rounded-xl border border-red-500/20 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10"
                                >
                                  Cancel
                                </button>
                              ) : (
                                isAdmin && (
                                  <button
                                    onClick={() => handleArchive(order)}
                                    className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-on-surface-variant hover:text-primary"
                                  >
                                    Archive
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── History panel ── */}
          <aside className="rounded-2xl border border-white/10 bg-surface-container-low p-5">
            <h2 className="mb-4 text-xl font-black text-on-surface">Order History</h2>
            {!selected ? (
              <p className="text-sm text-on-surface-variant">Click an order ID or History to review its lifecycle.</p>
            ) : (
              <div>
                <div className="mb-5 rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="font-black text-on-surface">Order #{selected.order.id}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{selected.order.customerName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-black ${badgeClass[selected.order.status]}`}>
                      {selected.order.status}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-lg font-black text-primary">
                    Rs. {Number(selected.order.totalAmount).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-3">
                  {(selected.history || []).length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No history entries yet.</p>
                  ) : (
                    (selected.history || []).map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-black ${badgeClass[entry.status] || 'border-white/10 text-on-surface-variant'}`}>
                            {entry.status}
                          </span>
                          <p className="text-xs text-on-surface-variant">{entry.updatedAt}</p>
                        </div>
                        <p className="mt-2 text-xs text-on-surface-variant">
                          {entry.updatedBy || 'System'}{entry.note ? ` — ${entry.note}` : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
