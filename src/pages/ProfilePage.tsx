import { useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateMember } from '../api/members'

export function ProfilePage() {
  const { member } = useAuth()
  const [name, setName] = useState(member?.name || '')
  const [email, setEmail] = useState(member?.email || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim()) {
      setError('請填寫所有欄位')
      return
    }

    setLoading(true)
    try {
      await updateMember({ email, name })
      setSuccess('個人資料已更新')
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>個人檔案</h1>
      </div>

      <div className="form-card">
        {error && <div className="error-banner">⚠️ {error}</div>}
        {success && <div className="success-banner">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input id="name" type="text" value={name}
              onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="email">電子郵件</label>
            <input id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '儲存中...' : '更新資料'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
