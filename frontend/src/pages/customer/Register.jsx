import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h1 className="h3 mb-3">Register</h1>
          <p className="text-muted mb-0">
            This workspace does not include the final registration flow yet. Use the <Link to="/login">login page</Link> to enter the app and test the tracking module.
          </p>
        </div>
      </div>
    </div>
  )
}
