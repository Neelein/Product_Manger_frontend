import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateAnnouncement } from '../hooks/useAnnouncement'
import { ANNOUNCEMENT_IMAGE_ACCEPT, validateAnnouncementImage } from '../imageValidation'

export function AnnouncementCreatePage() {
  const navigate = useNavigate()
  const { create, loading, error: apiError } = useCreateAnnouncement()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !content.trim()) {
      setError('請填寫標題與內容')
      return
    }
    const created = await create({
      title: title.trim(),
      content: content.trim(),
      image: image || undefined,
    })
    if (created) {
      navigate(`/announcements/${created.id}`)
    }
  }

  return (
    <div className="announcement-form-page">
      <div className="page-header">
        <Link to="/announcements" className="back-link">← 返回佈告欄</Link>
      </div>

      <div className="form-card">
        <h1>建立公告</h1>

        {(error || apiError) && <div className="error-banner">⚠️ {error || apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">標題</label>
            <input id="title" type="text" value={title}
              onChange={e => setTitle(e.target.value)} placeholder="公告標題" />
          </div>
          <div className="form-group">
            <label htmlFor="content">內容</label>
            <textarea id="content" rows={8} value={content}
              onChange={e => setContent(e.target.value)} placeholder="公告內容" />
          </div>
          <div className="form-group">
            <label htmlFor="image">圖片（選填）</label>
            <input id="image" type="file" accept={ANNOUNCEMENT_IMAGE_ACCEPT}
              onChange={e => {
                const nextImage = e.target.files?.[0] || null
                setImage(nextImage)
                setError(validateAnnouncementImage(nextImage) || '')
              }} />
            <p className="form-help">僅接受 JPEG、PNG 或 WebP；檔案內容仍由伺服器驗證。</p>
          </div>
          <div className="form-actions">
            <Link to="/announcements" className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary" disabled={loading || Boolean(error)}>
              {loading ? '建立中...' : '發布公告'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
