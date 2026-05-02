import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import BrandLogo from './components/common/BrandLogo'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import Analyzer from './pages/Analyzer'
import JobMatch from './pages/JobMatch'
import ResumeTest from './pages/ResumeTest'
import Templates from './pages/Templates'
import Profile from './pages/Profile'
import PublicResume from './pages/PublicResume'

function ShellNav() {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const location = useLocation()

  if (!user && !['/', '/login', '/register'].includes(location.pathname)) return null

  const links = user ? [
    ['/dashboard', 'Dashboard'],
    ['/builder', 'Builder'],
    ['/analyzer', 'Analyzer'],
    ['/job-match', 'Job Match'],
    ['/resume-test', 'Resume Test'],
    ['/templates', 'Templates'],
  ] : []

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        <BrandLogo to={user ? "/dashboard" : "/"} compact={true} />
        <div className="hidden md:flex items-center gap-1">
          {links.map(([to, label]) => (
            <Link key={to} to={to} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: location.pathname.startsWith(to) ? "var(--accent)" : "var(--text-secondary)", background: location.pathname.startsWith(to) ? "var(--accent-dim)" : "transparent" }}>{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-ghost text-xs py-1.5 px-3" title={dark ? "Light mode" : "Dark mode"}>{dark ? "☀️" : "🌙"}</button>
          {user ? (
            <>
              <Link to="/profile" className="hidden md:inline-flex btn-ghost text-xs py-1.5 px-3">Profile</Link>
              <button onClick={logout} className="hidden md:inline-flex btn-ghost text-xs py-1.5 px-3">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:inline-flex btn-ghost text-xs py-1.5 px-3">Login</Link>
              <Link to="/register" className="btn-primary text-xs py-1.5 px-3">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function Layout({ children, showNav = true }) {
  return <>{showNav && <ShellNav />}{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "Cabinet Grotesk, sans-serif",
              },
              success: { iconTheme: { primary: "var(--success)", secondary: "white" } },
              error: { iconTheme: { primary: "var(--danger)", secondary: "white" } },
            }}
          />
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/r/:slug" element={<PublicResume />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/builder" element={<ProtectedRoute><Layout><Builder /></Layout></ProtectedRoute>} />
            <Route path="/builder/:id" element={<ProtectedRoute><Layout><Builder /></Layout></ProtectedRoute>} />
            <Route path="/analyzer" element={<ProtectedRoute><Layout><Analyzer /></Layout></ProtectedRoute>} />
            <Route path="/job-match" element={<ProtectedRoute><Layout><JobMatch /></Layout></ProtectedRoute>} />
            <Route path="/resume-test" element={<ProtectedRoute><Layout><ResumeTest /></Layout></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Layout><Templates /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
