import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { member, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/home" className="navbar-brand">
            <span className="navbar-logo">📋</span>
            <span>產品管理系統</span>
          </Link>

          <nav className="navbar-nav">
            <Link to="/home" className="nav-link">產品</Link>
            <Link to="/messages" className="nav-link">訊息</Link>
            <Link to="/events" className="nav-link">事件管理</Link>
            {member?.role === 'admin' && (
              <Link to="/admin/registration-codes" className="nav-link">註冊代碼</Link>
            )}
          </nav>

          <div className="navbar-right">
            {member ? (
              <>
                <Link to="/profile" className="nav-link">{member.name}</Link>
                <button className="nav-btn" onClick={handleLogout}>登出</button>
              </>
            ) : (
              <Link to="/login" className="nav-link">登入</Link>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
