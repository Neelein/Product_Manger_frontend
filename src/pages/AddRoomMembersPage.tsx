import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { addRoomMembers, listAvailableMembers } from '../api/chat'
import type { Member } from '../types'

export function AddRoomMembersPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    listAvailableMembers(roomId!)
      .then(res => setMembers(res.members))
      .catch(() => setError('載入成員失敗'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!roomId || selectedIds.size === 0) return
    setSubmitting(true)
    try {
      await addRoomMembers(roomId, Array.from(selectedIds))
      navigate(`/chat/rooms/${roomId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加入失敗')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-members-page">
      <Link to={`/chat/rooms/${roomId}`} className="back-link">← 返回聊天室</Link>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <input
        className="add-members-search"
        type="text"
        placeholder="搜尋會員..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="page-loading">載入中...</div>
      ) : (
        <div className="add-members-list">
          {filtered.map(m => (
            <div
              key={m.id}
              className="add-members-item"
              onClick={() => toggle(m.id)}
            >
              <input
                type="checkbox"
                className="add-members-item-checkbox"
                checked={selectedIds.has(m.id)}
                onChange={() => toggle(m.id)}
              />
              <div className="add-members-avatar">
                {m.name.charAt(0)}
              </div>
              <div className="add-members-info">
                <div className="add-members-name">{m.name}</div>
                <div className="add-members-email">{m.email}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">無符合的會員</div>
          )}
        </div>
      )}

      <div className="add-members-bar">
        <span className="add-members-count">
          已選擇 {selectedIds.size} 位成員
        </span>
        <button
          className="add-members-submit"
          disabled={selectedIds.size === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? '加入中...' : '加入聊天室'}
        </button>
      </div>
    </div>
  )
}
