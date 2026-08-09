import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateCalendarEvent } from '../hooks/useCalendar'

export function CalendarEventCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date')

  const defaultStart = dateParam ? `${dateParam}T00:00` : ''
  const defaultEnd = dateParam ? `${dateParam}T23:59` : ''

  const { create, loading, error: hookError } = useCreateCalendarEvent()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [status, setStatus] = useState('active')

  function toRfc3339(v: string) {
    return v.includes('T') ? v + ':00Z' : v
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !startTime || !endTime) {
      return
    }
    const created = await create({
      title: title.trim(),
      description: description.trim(),
      start_time: toRfc3339(startTime),
      end_time: toRfc3339(endTime),
      status,
    })
    if (created) {
      navigate(`/calendar/${created.id}`)
    }
  }

  return (
    <div className="event-create-page">
      <div className="page-header">
        <Link to="/calendar" className="back-link">← 回到行事曆</Link>
      </div>

      <div className="form-card">
        <h1>建立事件</h1>

        {hookError && <div className="error-banner">⚠️ {hookError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">標題</label>
            <input id="title" type="text" value={title}
              onChange={e => setTitle(e.target.value)} placeholder="事件標題" required />
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea id="description" rows={4} value={description}
              onChange={e => setDescription(e.target.value)} placeholder="事件描述（選填）" />
          </div>
          <div className="form-group">
            <label htmlFor="start-time">開始時間</label>
            <input id="start-time" type="datetime-local" value={startTime}
              onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="end-time">結束時間</label>
            <input id="end-time" type="datetime-local" value={endTime}
              onChange={e => setEndTime(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="status">狀態</label>
            <select id="status" value={status}
              onChange={e => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-actions">
            <Link to="/calendar" className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '建立中...' : '建立事件'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
