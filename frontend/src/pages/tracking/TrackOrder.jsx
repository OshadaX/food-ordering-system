import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveOrders, createTrackingRecord, updateOrderStatus } from '../../services/trackingService'

const workflow = ['Preparing', 'Ready', 'Out for Delivery', 'Delivered']

const statusBadge = {
  Received: 'secondary',
  Preparing: 'warning',
  Ready: 'info',
  'Out for Delivery': 'primary',
  Delivered: 'success',
  Cancelled: 'danger',
}

export default function TrackOrder() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newOrder, setNewOrder] = useState({ orderId: '', customerName: '' })
  const [actionState, setActionState] = useState({})

  async function loadOrders() {
    try {
      setError('')
      setLoading(true)
      const data = await getActiveOrders()
      setOrders(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load tracked orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()

    try {
      setCreating(true)
      setError('')
      await createTrackingRecord({
        orderId: Number(newOrder.orderId),
        customerName: newOrder.customerName.trim() || null,
        updatedBy: 'System',
      })
      setNewOrder({ orderId: '', customerName: '' })
      await loadOrders()
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create tracking record.')
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusUpdate(orderId, status) {
    try {
      setActionState((current) => ({ ...current, [orderId]: status }))
      setError('')
      const updated = await updateOrderStatus(orderId, {
        status,
        updatedBy: 'Kitchen Staff',
        note: `Status updated to ${status}.`,
      })
      setOrders((current) => current.map((order) => (order.orderId === orderId ? updated : order)))
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update order status.')
    } finally {
      setActionState((current) => ({ ...current, [orderId]: null }))
    }
  }

  async function handleCancel(orderId) {
    try {
      setActionState((current) => ({ ...current, [orderId]: 'Cancelled' }))
      setError('')
      await updateOrderStatus(orderId, {
        status: 'Cancelled',
        updatedBy: 'Admin',
        note: 'Order was cancelled by staff.',
      })
      setOrders((current) => current.filter((order) => order.orderId !== orderId))
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to cancel order.')
    } finally {
      setActionState((current) => ({ ...current, [orderId]: null }))
    }
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h4 mb-3">Create Tracking Record</h2>
              <p className="text-muted small">
                This creates the initial <strong>Received</strong> status when a new order enters the system.
              </p>

              <form onSubmit={handleCreate} className="d-grid gap-3">
                <div>
                  <label htmlFor="orderId" className="form-label">Order ID</label>
                  <input
                    id="orderId"
                    className="form-control"
                    type="number"
                    min="1"
                    value={newOrder.orderId}
                    onChange={(event) => setNewOrder((current) => ({ ...current, orderId: event.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="customerName" className="form-label">Customer Name</label>
                  <input
                    id="customerName"
                    className="form-control"
                    type="text"
                    value={newOrder.customerName}
                    onChange={(event) => setNewOrder((current) => ({ ...current, customerName: event.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <button className="btn btn-dark" type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Start Tracking'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h1 className="h3 mb-1">Order Tracking Dashboard</h1>
                  <p className="text-muted mb-0">Kitchen staff and admins can move orders through the workflow here.</p>
                </div>
                <button className="btn btn-outline-secondary" type="button" onClick={loadOrders}>
                  Refresh
                </button>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}

              {loading ? (
                <p className="text-muted mb-0">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="alert alert-light border mb-0">No active tracked orders yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Next Step</th>
                        <th>Tracking</th>
                        <th>Cancel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const currentIndex = workflow.indexOf(order.currentStatus)
                        const nextStatus = order.currentStatus === 'Received'
                          ? workflow[0]
                          : workflow[currentIndex + 1]

                        return (
                          <tr key={order.orderId}>
                            <td className="fw-semibold">#{order.orderId}</td>
                            <td>{order.customerName || 'Walk-in customer'}</td>
                            <td>
                              <span className={`badge text-bg-${statusBadge[order.currentStatus] || 'secondary'}`}>
                                {order.currentStatus}
                              </span>
                            </td>
                            <td>
                              {nextStatus ? (
                                <button
                                  className="btn btn-sm btn-primary"
                                  type="button"
                                  onClick={() => handleStatusUpdate(order.orderId, nextStatus)}
                                  disabled={Boolean(actionState[order.orderId])}
                                >
                                  {actionState[order.orderId] === nextStatus ? 'Updating...' : nextStatus}
                                </button>
                              ) : (
                                <span className="text-muted">Completed</span>
                              )}
                            </td>
                            <td>
                              <Link className="btn btn-sm btn-outline-dark" to={`/tracking/${order.orderId}`}>
                                View
                              </Link>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                type="button"
                                onClick={() => handleCancel(order.orderId)}
                                disabled={Boolean(actionState[order.orderId])}
                              >
                                {actionState[order.orderId] === 'Cancelled' ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
