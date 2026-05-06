import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()
  const location = useLocation()

  const menuItems = [
    { icon: '📊', label: 'Overview', path: '/admin' },
    { icon: '👥', label: 'User Base', path: '/admin/users' },
    { icon: '📄', label: 'Resumes', path: '/admin/resumes' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-24'} transition-all duration-500 ease-in-out relative flex flex-col border-r border-border bg-secondary/50 backdrop-blur-3xl z-40`}
      >
        {/* Brand */}
        <div className="h-24 px-6 flex items-center justify-between border-b border-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-display font-black text-[10px] shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                CV
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Admin</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500/80">Control Panel</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-display font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              CV
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto pt-8">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  active ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'text-text-secondary hover:text-text-primary hover:bg-secondary'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-border bg-white/[0.01]">
          <div className={`flex items-center gap-4 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center text-text-primary font-bold text-sm">
              {user?.name?.[0]}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <p className="text-[10px] font-bold text-text-primary uppercase tracking-widest truncate">{user?.name}</p>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Master Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-32 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] shadow-xl hover:scale-110 transition-transform z-50"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-primary/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">System / <span className="text-text-primary">{menuItems.find(m => isActive(m.path))?.label || 'Dashboard'}</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="px-5 py-2 rounded-xl bg-white/5 border border-border text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-text-primary hover:border-white/20 transition-all">
              Back to Portal
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="animate-fade-up max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
