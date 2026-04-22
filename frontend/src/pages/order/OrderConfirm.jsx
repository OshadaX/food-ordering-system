import { Link } from 'react-router-dom'

export default function OrderConfirm() {
  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h1 className="h3 mb-3">Order Confirmation</h1>
          <p className="text-muted">
            This page is a placeholder. After your real order flow is connected, it should create a tracking record automatically.
          </p>
          <Link to="/tracking" className="btn btn-dark">Open Tracking</Link>
        </div>
      </div>
    </div>
  )
}
