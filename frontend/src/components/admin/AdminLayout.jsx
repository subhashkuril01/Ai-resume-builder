import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()
  const location = useLocation()

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '📄', label: 'Resumes', path: '/admin/resumes' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
  ]

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 border-r flex flex-col`}
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--accent)' }}>Admin</h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Panel</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:opacity-75"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-accent-dim text-accent font-medium'
                  : 'text-text-secondary hover:bg-opacity-50'
              }`}
              style={
                isActive(item.path)
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
                  : { color: 'var(--text-secondary)' }
              }
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {sidebarOpen ? (
            <div className="text-xs">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p style={{ color: 'var(--text-secondary)' }}>Admin</p>
            </div>
          ) : (
            <div className="text-center text-lg">👤</div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar */}
        <div
          className="h-14 border-b px-6 flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
        >
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>
          <Link to="/dashboard" className="text-sm px-3 py-1.5 rounded-lg" style={{ color: 'var(--accent)', background: 'var(--accent-dim)' }}>
            Back to App
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
