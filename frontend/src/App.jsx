import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import Analyzer from './pages/Analyzer'
import JobMatch from './pages/JobMatch'
import Templates from './pages/Templates'
import Profile from './pages/Profile'
import PublicResume from './pages/PublicResume'

// Pages that show the Navbar
const NAVBAR_ROUTES = ['/', '/login', '/register', '/dashboard', '/builder', '/analyzer', '/job-match', '/templates', '/profile']

function Layout({ children, showNav = true }) {
  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  )
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
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: 'Cabinet Grotesk, sans-serif',
              },
              success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
              error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />

            {/* Public resume sharing - no nav */}
            <Route path="/r/:slug" element={<PublicResume />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/builder" element={
              <ProtectedRoute><Layout><Builder /></Layout></ProtectedRoute>
            } />
            <Route path="/builder/:id" element={
              <ProtectedRoute><Layout><Builder /></Layout></ProtectedRoute>
            } />
            <Route path="/analyzer" element={
              <ProtectedRoute><Layout><Analyzer /></Layout></ProtectedRoute>
            } />
            <Route path="/job-match" element={
              <ProtectedRoute><Layout><JobMatch /></Layout></ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute><Layout><Templates /></Layout></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
