import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const { items, addItem, clearCart } = useCart()

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Cart</h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => addItem({ id: Date.now(), name: 'Sample Item', quantity: 1 })}
          >
            Add Sample Item
          </button>
          <button className="btn btn-outline-danger" type="button" onClick={clearCart}>Clear</button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {items.length === 0 ? (
            <p className="text-muted mb-0">Your cart is empty.</p>
          ) : (
            <>
              <ul className="list-group list-group-flush mb-3">
                {items.map((item) => (
                  <li key={item.id} className="list-group-item px-0">
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
              <Link to="/order/confirm" className="btn btn-dark">Proceed to Confirmation</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
