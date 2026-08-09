import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth()

  if (loading) {
    return <div className="page-loading">載入中...</div>
  }

  if (!member) {
    return <Navigate to="/login" replace />
  }

  if (member.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
