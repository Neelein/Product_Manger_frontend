import { Link } from 'react-router-dom'

const FEATURES = [
  {
    to: '/products',
    icon: '📦',
    title: '產品列表',
    description: '瀏覽與管理所有產品',
  },
  {
    to: '/inventory',
    icon: '📊',
    title: '庫存管理',
    description: '管理產品庫存與庫存項目',
  },
]

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>產品管理系統</h1>
        <p className="page-subtitle">請選擇功能</p>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-grid">
          {FEATURES.map(f => (
            <Link key={f.to} to={f.to} className="dashboard-card">
              <span className="dashboard-card-icon">{f.icon}</span>
              <span className="dashboard-card-title">{f.title}</span>
              <span className="dashboard-card-desc">{f.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
