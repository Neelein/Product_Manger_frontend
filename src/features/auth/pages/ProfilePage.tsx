import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { changePassword, updateMember } from '../api/members'
import { validatePasswordChange } from '../passwordValidation'

export function ProfilePage() {
  const { member, clearSession } = useAuth()
  const [name, setName] = useState(member?.name || '')
  const [email, setEmail] = useState(member?.email || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const navigate = useNavigate()

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

  const handlePasswordSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    const validationError = validatePasswordChange({ currentPassword, newPassword, confirmNewPassword })
    if (validationError) {
      setPasswordError(validationError)
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordSuccess('密碼已更新，請重新登入')
      window.setTimeout(() => {
        clearSession()
        navigate('/login', { replace: true })
      }, 800)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : '修改密碼失敗')
    } finally {
      setPasswordLoading(false)
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

      <section className="form-card password-change-card" aria-labelledby="change-password-title">
        <h2 id="change-password-title">修改密碼</h2>
        {passwordError && <div className="error-banner" role="alert">⚠️ {passwordError}</div>}
        {passwordSuccess && <div className="success-banner" role="status">✅ {passwordSuccess}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="current-password">目前密碼</label>
            <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">新密碼</label>
            <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">確認新密碼</label>
            <input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? '修改中...' : '修改密碼'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
