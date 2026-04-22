import { Link } from 'react-router-dom'

export default function DeliveryList() {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">Delivery List</h1>
          <p className="text-muted mb-0">Delivery module placeholder.</p>
        </div>
        <Link to="/delivery/assign" className="btn btn-outline-dark">Assign Delivery</Link>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body text-muted">
          No delivery assignments are configured in this demo workspace yet.
        </div>
      </div>
    </div>
  )
}
