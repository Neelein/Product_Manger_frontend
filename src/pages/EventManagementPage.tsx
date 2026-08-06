import { Link } from 'react-router-dom'

export function EventManagementPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>事件管理</h1>
        <p className="page-subtitle">請選擇功能</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/calendar" className="dashboard-card">
          <span className="dashboard-card-icon">📅</span>
          <span className="dashboard-card-title">日曆</span>
          <span className="dashboard-card-desc">查看行事曆與管理事件</span>
        </Link>
      </div>
    </div>
  )
}
