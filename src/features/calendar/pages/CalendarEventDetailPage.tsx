import { useState, useEffect, type FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useCalendarEventViewers,
} from '../hooks/useCalendar'
import { addEventViewer, removeEventViewer } from '../api/events'

function toDatetimeLocal(s: string) {
  const d = new Date(s)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CalendarEventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useCalendarEvent(id!)
  const { update } = useUpdateCalendarEvent()
  const { remove } = useDeleteCalendarEvent()
  const { viewers, refetch: refetchViewers } = useCalendarEventViewers(id!)

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [newViewerInput, setNewViewerInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionErr, setActionErr] = useState('')

  useEffect(() => {
    if (event) {
      setEditTitle(event.title)
      setEditDesc(event.description)
      setEditStart(toDatetimeLocal(event.start_time))
      setEditEnd(toDatetimeLocal(event.end_time))
      setEditStatus(event.status)
    }
  }, [event])

  const handleDelete = async () => {
    if (!confirm('確定刪除此事件？')) return
    setActionErr('')
    const ok = await remove(id!)
    if (ok) navigate('/calendar', { replace: true })
  }

  function toRfc3339(v: string) {
    return v.includes('T') ? v + ':00Z' : v
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setActionErr('')
    try {
      const updated = await update(id!, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        start_time: toRfc3339(editStart),
        end_time: toRfc3339(editEnd),
        status: editStatus,
      })
      if (updated) setEditing(false)
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : '更新失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleAddViewer = async () => {
    if (!newViewerInput.trim()) return
    setActionErr('')
    try {
      await addEventViewer(id!, newViewerInput.trim())
      setNewViewerInput('')
      refetchViewers()
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : '新增檢視者失敗')
    }
  }

  const handleRemoveViewer = async (memberId: string) => {
    setActionErr('')
    try {
      await removeEventViewer(id!, memberId)
      refetchViewers()
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : '移除檢視者失敗')
    }
  }

  if (loading) return <div className="page-loading">載入中...</div>
  if (error || !event) return (
    <div className="error-banner">
      ⚠️ {error || '事件不存在'}
      <br />
      <Link to="/calendar" className="back-link">← 回到行事曆</Link>
    </div>
  )

  const fmt = (s: string) => new Date(s).toLocaleString()

  return (
    <div className="event-detail-page">
      <div className="page-header">
        <Link to="/calendar" className="back-link">← 回到行事曆</Link>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setEditing(!editing)}>
            {editing ? '取消編輯' : '編輯'}
          </button>
          <button className="btn-danger" onClick={handleDelete}>刪除</button>
        </div>
      </div>

      {actionErr && <div className="error-banner">⚠️ {actionErr}</div>}

      {editing ? (
        <div className="form-card">
          <h1>編輯事件</h1>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="edit-title">標題</label>
              <input id="edit-title" type="text" value={editTitle}
                onChange={e => setEditTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-desc">描述</label>
              <textarea id="edit-desc" rows={4} value={editDesc}
                onChange={e => setEditDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="edit-start">開始時間</label>
              <input id="edit-start" type="datetime-local" value={editStart}
                onChange={e => setEditStart(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-end">結束時間</label>
              <input id="edit-end" type="datetime-local" value={editEnd}
                onChange={e => setEditEnd(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-status">狀態</label>
              <select id="edit-status" value={editStatus}
                onChange={e => setEditStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>取消</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </form>
        </div>
      ) : (
          <div className="event-detail-card">
            <h1 className="event-detail-title">{event.title}</h1>
            <div className="event-detail-creator">建立者: {event.creator_name}</div>
            <div className="event-detail-section">
              <label>開始時間</label>
              <p>{fmt(event.start_time)}</p>
            </div>
            <div className="event-detail-section">
              <label>結束時間</label>
              <p>{fmt(event.end_time)}</p>
            </div>
            <div className="event-detail-section">
              <label>狀態</label>
              <p><span className={`status-badge status-${event.status}`}>{event.status === 'active' ? '啟用' : '已取消'}</span></p>
            </div>
            {event.description && (
              <div className="event-detail-description">{event.description}</div>
            )}
          </div>
      )}

      <div className="event-viewers-section">
        <div className="event-viewers-header">
          <h3>檢視者</h3>
        </div>
        {viewers.map(v => (
          <div key={v.member_id} className="event-viewer-item">
            <div>
              <div className="event-viewer-name">{v.member_name}</div>
              <div className="event-viewer-time">加入於 {fmt(v.created_at)}</div>
            </div>
            <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleRemoveViewer(v.member_id)}>移除</button>
          </div>
        ))}
        <div className="event-viewer-add">
          <input type="text" placeholder="輸入成員 ID" value={newViewerInput}
            onChange={e => setNewViewerInput(e.target.value)} />
          <button className="btn-primary" onClick={handleAddViewer} style={{ whiteSpace: 'nowrap' }}>新增檢視者</button>
        </div>
      </div>
    </div>
  )
}
