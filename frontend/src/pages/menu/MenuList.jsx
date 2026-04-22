import { Link } from 'react-router-dom'

const sampleItems = [
  { id: 1, name: 'Margherita Pizza', price: 'LKR 2200' },
  { id: 2, name: 'Chicken Burger', price: 'LKR 1400' },
  { id: 3, name: 'Pasta Alfredo', price: 'LKR 1850' },
]

export default function MenuList() {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">Menu</h1>
          <p className="text-muted mb-0">Placeholder menu view so the app can navigate end-to-end.</p>
        </div>
        <Link to="/menu/add" className="btn btn-outline-dark">Add Menu Item</Link>
      </div>

      <div className="row g-3">
        {sampleItems.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-xl-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h2 className="h5">{item.name}</h2>
                <p className="text-muted mb-0">{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
