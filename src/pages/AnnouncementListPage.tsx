import { Link } from 'react-router-dom'
import { useAnnouncements } from '../hooks/useAnnouncement'
import { useAuth } from '../hooks/useAuth'

export function AnnouncementListPage() {
  const { announcements, loading, error } = useAnnouncements()
  const { member } = useAuth()

  return (
    <div className="announcement-list-page">
      <div className="page-header">
        <div>
          <h1>佈告欄</h1>
          <p className="page-subtitle">共 {announcements.length} 則公告</p>
        </div>
        {member && (
          <div className="header-actions">
            <Link to="/announcements/new" className="btn-primary">建立佈告</Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="page-loading">載入中...</div>
      ) : error ? (
        <div className="error-banner">⚠️ {error}</div>
      ) : announcements.length === 0 ? (
        <div className="empty-state">
          <p>目前尚無公告</p>
        </div>
      ) : (
        <div className="announcement-list">
          {announcements.map(a => (
            <Link key={a.id} to={`/announcements/${a.id}`} className="announcement-card">
              <div className="announcement-card-top">
                <h2 className="announcement-card-title">{a.title}</h2>
                {a.image_path && (
                  <span className="announcement-card-has-image">📷</span>
                )}
              </div>
              <p className="announcement-card-preview">
                {a.content.length > 200 ? a.content.slice(0, 200) + '...' : a.content}
              </p>
              <div className="announcement-card-meta">
                <span>{a.publisher_name}</span>
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
