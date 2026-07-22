import { Link } from 'react-router-dom'

const MESSAGE_FEATURES = [
  {
    to: '/announcements',
    icon: '📢',
    title: '佈告欄',
    description: '查看與管理系統公告',
  },
  {
    to: '/chat/rooms',
    icon: '💬',
    title: '私人訊息',
    description: '查看與發送私人訊息',
  },
]

export function MessagesPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>訊息</h1>
        <p className="page-subtitle">請選擇功能</p>
      </div>

      <div className="dashboard-grid">
        {MESSAGE_FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="dashboard-card">
            <span className="dashboard-card-icon">{f.icon}</span>
            <span className="dashboard-card-title">{f.title}</span>
            <span className="dashboard-card-desc">{f.description}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
