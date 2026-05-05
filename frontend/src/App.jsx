import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import ProtectedAdminRoute from './components/common/ProtectedAdminRoute'
import Navbar from './components/common/Navbar'

// Pages
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
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminResumes from './pages/AdminResumes'
import AdminAnalytics from './pages/AdminAnalytics'

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
                background: "#121210",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "Cabinet Grotesk, sans-serif",
                backdropFilter: "blur(12px)",
              },
              success: { iconTheme: { primary: "#f59e0b", secondary: "black" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
            }}
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/r/:slug" element={<PublicResume />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/analyzer" element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
            <Route path="/job-match" element={<ProtectedRoute><JobMatch /></ProtectedRoute>} />
            <Route path="/resume-test" element={<ProtectedRoute><ResumeTest /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
            <Route path="/admin/resumes" element={<ProtectedAdminRoute><AdminResumes /></ProtectedAdminRoute>} />
            <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
