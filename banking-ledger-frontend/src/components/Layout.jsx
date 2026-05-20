import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard', icon: '◈', path: '/dashboard' },
  { label: 'Accounts', icon: '⬡', path: '/accounts' },
  { label: 'Transfer', icon: '⇄', path: '/transfer' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">₿</div>
            <div>
              <div className="sidebar-logo-text">Ledger</div>
              <div className="sidebar-logo-sub">Banking System</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="divider" style={{ margin: '12px 0' }} />
          <div className="nav-section-label">System</div>
          <button
            className={`nav-link ${location.pathname === '/system' ? 'active' : ''}`}
            onClick={() => navigate('/system')}
          >
            <span className="nav-link-icon">⚙</span>
            System Admin
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button
            className="nav-link btn--ghost"
            style={{ marginTop: 8, color: 'var(--red)', width: '100%' }}
            onClick={handleLogout}
          >
            <span className="nav-link-icon">⎋</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
