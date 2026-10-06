import { Link } from 'react-router-dom'
import { isAdminMember, useAuth } from '../../auth'

export function DepartmentEntryPage() {
  const { member } = useAuth()

  return <div className="department-entry-page">
    <div className="page-header">
      <div>
        <Link to="/home" className="back-link">← 返回首頁</Link>
      </div>
    </div>
    <div className="dashboard-grid department-entry-grid">
      {isAdminMember(member) && <Link to="/admin/departments" className="dashboard-card">
        <span className="dashboard-card-icon">⚙️</span>
        <span className="dashboard-card-title">部門管理</span>
        <span className="dashboard-card-desc">建立、編輯部門並指派員工</span>
      </Link>}
      <Link to="/admin/departments/1/employees" className="dashboard-card">
        <span className="dashboard-card-icon">👥</span>
        <span className="dashboard-card-title">部門瀏覽</span>
        <span className="dashboard-card-desc">瀏覽部門員工名單</span>
      </Link>
    </div>
  </div>
}
