import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Spinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
