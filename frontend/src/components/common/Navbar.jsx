import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/builder', label: 'Builder' },
    { to: '/analyzer', label: 'Analyzer' },
    { to: '/job-match', label: 'Job Match' },
    { to: '/templates', label: 'Templates' },
  ] : []

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}
      className="fixed top-0 left-0 right-0 z-50 h-14">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent)', color: '#0d0c0a' }}>C</div>
          <span className="font-display font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            CV<span style={{ color: 'var(--accent)' }}>ISION</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                color: isActive(to) ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive(to) ? 'var(--accent-dim)' : 'transparent'
              }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--accent)', color: '#0d0c0a' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout}
                className="hidden md:block px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                Logout
              </button>
              <button className="md:hidden btn-icon" onClick={() => setMenuOpen(!menuOpen)}>
                <MenuIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-xs py-1.5 px-3 hidden md:inline-flex">Login</Link>
              <Link to="/register" className="btn-primary text-xs py-1.5 px-3">Get Started</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden absolute top-14 left-0 right-0 z-50 p-4"
          style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: isActive(to) ? 'var(--accent)' : 'var(--text-secondary)', background: isActive(to) ? 'var(--accent-dim)' : 'transparent' }}>
                {label}
              </Link>
            ))}
            <div className="divider" />
            <button onClick={handleLogout} className="text-left px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--danger)' }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
