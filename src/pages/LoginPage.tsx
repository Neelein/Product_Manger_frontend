import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { login, register, member } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (member) {
    navigate('/home', { replace: true })
    return null
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setError('')
    setSuccess('')
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    resetForm()
  }

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('請輸入電子郵件')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('請輸入有效的電子郵件格式')
      return false
    }
    if (!password) {
      setError('請輸入密碼')
      return false
    }
    if (password.length < 6) {
      setError('密碼長度至少 6 碼')
      return false
    }
    if (mode === 'register' && !name.trim()) {
      setError('請輸入姓名')
      return false
    }
    return true
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validate()) return

    setLoading(true)

    try {
      if (mode === 'login') {
        await login({ email, password })
        navigate('/home', { replace: true })
      } else {
        await register({ email, password, name })
        setSuccess('註冊成功！請切換至登入頁面')
        setName('')
        setEmail('')
        setPassword('')
        setMode('login')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '請求失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📋</div>
          <h1>產品管理系統</h1>
          <p>登入以繼續管理您的產品</p>
        </div>

        <div className="tab-switcher">
          <button
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            登入
          </button>
          <button
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            註冊
          </button>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}
        {success && <div className="success-banner">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input
                id="name"
                type="text"
                placeholder="請輸入姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">電子郵件</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              placeholder="至少 6 碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading && <span className="spinner" />}
            {mode === 'login' ? '登入' : '註冊'}
          </button>
        </form>
      </div>
    </div>
  )
}
