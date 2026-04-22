import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: 'Demo User', role: 'admin', email: 'demo@foodordering.local' })

  function handleSubmit(event) {
    event.preventDefault()
    login(form)
    navigate(location.state?.from?.pathname || '/', { replace: true })
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h1 className="h3 mb-3">Login</h1>
              <p className="text-muted">Use the demo account details below to enter the app.</p>

              <form className="d-grid gap-3" onSubmit={handleSubmit}>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Name"
                />
                <input
                  className="form-control"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email"
                />
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="kitchen staff">Kitchen Staff</option>
                  <option value="customer">Customer</option>
                </select>
                <button className="btn btn-dark" type="submit">Enter App</button>
              </form>

              <p className="small text-muted mt-3 mb-0">
                Need a placeholder registration page? <Link to="/register">Open Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
