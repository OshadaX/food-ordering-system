import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h1 className="h3 mb-3">Profile</h1>
          <p className="mb-1"><strong>Name:</strong> {user?.name || 'Demo User'}</p>
          <p className="mb-1"><strong>Email:</strong> {user?.email || 'demo@foodordering.local'}</p>
          <p className="mb-0 text-capitalize"><strong>Role:</strong> {user?.role || 'admin'}</p>
        </div>
      </div>
    </div>
  )
}
