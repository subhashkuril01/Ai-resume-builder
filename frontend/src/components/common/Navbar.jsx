import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const location = useLocation()

  // Only show nav on specific public pages or if logged in
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname)
  if (!user && !isPublicPage) return null

  const links = user ? [
    ['/dashboard', 'Dashboard'],
    ['/builder', 'Builder'],
    ['/analyzer', 'Auditor'],
    ['/job-match', 'Matching'],
    ['/resume-test', 'Assessment'],
    ['/templates', 'Library'],
    ...(user.role === 'admin' ? [['/admin', 'Admin']] : [])
  ] : []

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/60 backdrop-blur-2xl border-b border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
        <BrandLogo to={user ? "/dashboard" : "/"} compact={true} />
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-full">
          {links.map(([to, label]) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <Link key={to} to={to} 
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'text-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                {label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-sm hover:bg-white/10 transition-all group" title={dark ? "Light mode" : "Dark mode"}>
            <span className="group-hover:scale-110 transition-transform">{dark ? "☀️" : "🌙"}</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center font-display font-bold text-xs text-amber-500 hover:border-amber-500/30 transition-all">
                {user.name?.[0]?.toUpperCase()}
              </Link>
              <button onClick={logout} className="hidden md:flex px-5 py-2.5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2.5 px-6">
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
