import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderTracking } from '../../services/trackingService'

const timeline = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']

export default function OrderStatus() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        setError('')
        const data = await getOrderTracking(id)
        setOrder(data)
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load order status.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  if (loading) {
    return <div className="container py-4 text-muted">Loading order status...</div>
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <Link to="/tracking" className="btn btn-outline-dark">Back to Tracking</Link>
      </div>
    )
  }

  const currentIndex = timeline.indexOf(order.currentStatus)

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h1 className="h3 mb-1">Order #{order.orderId}</h1>
              <p className="text-muted mb-0">
                Customer view of the latest real-time order progress.
              </p>
            </div>
            <Link to="/tracking" className="btn btn-outline-dark">Back</Link>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">Current Status</h2>
          <div className="alert alert-info mb-4">
            <strong>{order.currentStatus}</strong>
            {order.currentStatus === 'Cancelled' ? ' - this order was cancelled.' : ' - your order is moving through the workflow.'}
          </div>

          <div className="row g-3">
            {timeline.map((step, index) => {
              const completed = currentIndex >= index
              const active = order.currentStatus === step

              return (
                <div key={step} className="col-12 col-md-6 col-xl-2">
                  <div className={`card h-100 border-${active ? 'primary' : completed ? 'success' : 'light'}`}>
                    <div className="card-body">
                      <div className="small text-uppercase text-muted mb-2">Step {index + 1}</div>
                      <div className="fw-semibold">{step}</div>
                      <div className={`small mt-2 ${active ? 'text-primary' : completed ? 'text-success' : 'text-muted'}`}>
                        {active ? 'Current step' : completed ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="h5 mb-3">Status History</h2>
          {order.history?.length ? (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Updated By</th>
                    <th>Note</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {order.history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.status}</td>
                      <td>{entry.updatedBy || 'System'}</td>
                      <td>{entry.note || '-'}</td>
                      <td>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No history entries are available for this order yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
