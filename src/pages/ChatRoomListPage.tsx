import { Link } from 'react-router-dom'
import { useChatRooms } from '../hooks/useChat'
import { useAuth } from '../hooks/useAuth'

export function ChatRoomListPage() {
  const { rooms, loading, error } = useChatRooms()
  const { member } = useAuth()

  return (
    <div className="chat-room-list-page">
      <div className="page-header">
        <div>
          <h1>私人訊息</h1>
          <p className="page-subtitle">共 {rooms.length} 個聊天室</p>
        </div>
        {member && (
          <div className="header-actions">
            <Link to="/chat/rooms/new" className="btn-primary">建立聊天室</Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="page-loading">載入中...</div>
      ) : rooms.length > 0 ? (
        <div className="chat-room-list">
          {rooms.map(room => (
            <Link key={room.id} to={`/chat/rooms/${room.id}`} className="chat-room-card">
              <div className="chat-room-card-top">
                <h2 className="chat-room-card-title">{room.name}</h2>
              </div>
              <div className="chat-room-card-meta">
                <span>{new Date(room.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : error ? (
        <div className="error-banner">⚠️ {error}</div>
      ) : (
        <div className="empty-state">
          <p>目前尚無聊天室</p>
        </div>
      )}
    </div>
  )
}
