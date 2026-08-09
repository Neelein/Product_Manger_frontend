import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { listMessages, sendMessage } from '../api/chat'
import type { ChatMessage } from '../types'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return '剛剛'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} 分鐘前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} 小時前`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay} 天前`
}

export function ChatRoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { member } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    setError('')
    listMessages(roomId)
      .then((res) => {
        setMessages(res.messages.reverse())
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '載入訊息失敗')
      })
      .finally(() => setLoading(false))
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback(async () => {
    if (!roomId || sending) return
    if (!content.trim() && !image && !file) return
    setSending(true)
    setError('')
    try {
      const res = await sendMessage(roomId, content.trim(), image || undefined, file || undefined)
      setMessages((prev) => [...prev, res.message])
      setContent('')
      setImage(null)
      setFile(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '發送失敗')
    } finally {
      setSending(false)
    }
  }, [roomId, content, image, file, sending])

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="chat-room-detail-page">
        <Link to="/chat/rooms" className="back-link">← 返回聊天室列表</Link>
        <div className="page-loading">載入中...</div>
      </div>
    )
  }

  return (
    <div className="chat-room-detail-page">
      <div className="page-header">
        <Link to="/chat/rooms" className="back-link">← 返回聊天室列表</Link>
        <button className="btn-primary" onClick={() => navigate(`/chat/rooms/${roomId}/add-members`)}>
          ＋ 邀請成員
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">尚無訊息</div>
        ) : (
          messages.map((msg) => {
            const isOwn = member?.id === msg.sender_id
            return (
              <div
                key={msg.id}
                className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}
              >
                {!isOwn && (
                  <div className="chat-sender-name">{msg.sender_name}</div>
                )}
                <div
                  className="chat-bubble"
                  style={{
                    background: isOwn ? '#2563eb' : '#f1f5f9',
                    color: isOwn ? '#fff' : '#1e293b',
                  }}
                >
                  <div className="chat-bubble-content">{msg.content}</div>
                  {msg.image_path && (
                    <img src={msg.image_path} alt="" className="chat-message-image" />
                  )}
                  {msg.file_path && (
                    <a
                      href={msg.file_path}
                      className="chat-message-file"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 下載檔案
                    </a>
                  )}
                  <div className={`chat-message-time ${isOwn ? 'chat-message-time-own' : ''}`}>
                    {relativeTime(msg.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="輸入訊息..."
            value={content}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            className="chat-textarea"
          />
          <button
            className="btn-primary chat-send-btn"
            onClick={handleSend}
            disabled={sending || (!content.trim() && !image && !file)}
          >
            {sending ? '傳送中...' : '傳送'}
          </button>
        </div>
        <div className="chat-file-inputs">
          <label className="chat-file-label">
            {image ? image.name : '📷 圖片'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              hidden
            />
          </label>
          <label className="chat-file-label">
            {file ? file.name : '📎 檔案'}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              hidden
            />
          </label>
        </div>
      </div>
    </div>
  )
}
