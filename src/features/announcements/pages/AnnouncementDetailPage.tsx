import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAnnouncement, useDeleteAnnouncement } from '../hooks/useAnnouncement'
import { useAuth } from '../../auth/hooks/useAuth'
import { AnnouncementImage } from '../components/AnnouncementImage'

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { announcement, loading, error } = useAnnouncement(id!)
  const { remove } = useDeleteAnnouncement()
  const { member } = useAuth()

  const handleDelete = async () => {
    if (!confirm('確定刪除此公告？')) return
    const ok = await remove(id!)
    if (ok) navigate('/announcements', { replace: true })
  }

  if (loading) return <div className="page-loading">載入中...</div>
  if (error || !announcement) return <div className="error-banner">⚠️ {error || '公告不存在'}</div>

  return (
    <div className="announcement-detail-page">
      <div className="page-header">
        <Link to="/announcements" className="back-link">← 返回佈告欄</Link>
        {member && (
          <div className="header-actions">
            <button className="btn-danger" onClick={handleDelete}>刪除</button>
          </div>
        )}
      </div>

      <article className="announcement-detail-card">
        <h1 className="announcement-detail-title">{announcement.title}</h1>
        <div className="announcement-detail-meta">
          <span>發布者：{announcement.publisher_name}</span>
          <span>發布時間：{new Date(announcement.created_at).toLocaleString()}</span>
          {announcement.updated_at !== announcement.created_at && (
            <span>更新時間：{new Date(announcement.updated_at).toLocaleString()}</span>
          )}
        </div>
        {announcement.image_path && (
          <div className="announcement-detail-image">
            <AnnouncementImage src={announcement.image_path} alt={announcement.title} />
          </div>
        )}
        <div className="announcement-detail-content">
          {announcement.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
