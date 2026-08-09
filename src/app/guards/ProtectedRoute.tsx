import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth()

  if (loading) {
    return <div className="page-loading">載入中...</div>
  }

  if (!member) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
