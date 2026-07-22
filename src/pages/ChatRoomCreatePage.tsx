import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createChatRoom } from '../api/chat'

export function ChatRoomCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('請輸入聊天室名稱'); return }

    setLoading(true)
    setError('')
    try {
      await createChatRoom({ name: name.trim() })
      navigate('/chat/rooms')
    } catch (e) {
      setError(e instanceof Error ? e.message : '建立失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="announcement-form-page">
      <Link to="/chat/rooms" className="back-link">← 返回聊天室列表</Link>

      <div className="form-card" style={{ marginTop: 16 }}>
        <h1>建立聊天室</h1>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>聊天室名稱</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="輸入聊天室名稱"
            />
          </div>

          <div className="form-actions">
            <Link to="/chat/rooms" className="btn-secondary">取消</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '建立中...' : '建立聊天室'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
