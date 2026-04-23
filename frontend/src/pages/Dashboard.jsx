import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { SkeletonCard } from '../components/common/Spinner'
import { formatDistanceToNow } from 'date-fns'

const templateColors = {
  modern: '#f59e0b', classic: '#6366f1', minimal: '#64748b',
  executive: '#0ea5e9', creative: '#ec4899', tech: '#10b981'
}

function ResumeCard({ resume, onDelete, onDuplicate }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const color = templateColors[resume.template] || '#f59e0b'

  return (
    <div className="card group relative overflow-hidden transition-all duration-300 hover:border-amber-500/30"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/builder/${resume._id}`)}>
      {/* Top color band */}
      <div className="h-1.5 w-full" style={{ background: color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {resume.title}
            </h3>
            <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
              {resume.template} template
            </p>
          </div>
          <div className="relative ml-2">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-40 rounded-lg shadow-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onClick={e => e.stopPropagation()}>
                {[
                  { label: 'Edit', action: () => navigate(`/builder/${resume._id}`) },
                  { label: 'Duplicate', action: () => { onDuplicate(resume._id); setMenuOpen(false) } },
                  { label: 'Delete', action: () => { onDelete(resume._id); setMenuOpen(false) }, danger: true },
                ].map(({ label, action, danger }) => (
                  <button key={label} onClick={action}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{ color: danger ? 'var(--danger)' : 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {resume.atsScore !== null && resume.atsScore !== undefined && (
              <span className="badge text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: resume.atsScore >= 70 ? 'var(--success-bg)' : 'var(--accent-dim)',
                  color: resume.atsScore >= 70 ? 'var(--success)' : 'var(--accent)',
                }}>
                ATS {resume.atsScore}
              </span>
            )}
            {resume.isPublic && (
              <span className="badge-muted text-xs">Public</span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    resumeAPI.getAll()
      .then(res => setResumes(res.resumes || []))
      .catch(() => toast.error('Failed to load resumes'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await resumeAPI.create({ title: 'Untitled Resume', template: 'modern' })
      navigate(`/builder/${res.resume._id}`)
    } catch (error) {
      toast.error(error?.error || error?.message || 'Failed to create resume')
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return
    try {
      await resumeAPI.delete(id)
      setResumes(r => r.filter(x => x._id !== id))
      toast.success('Resume deleted')
    } catch {
      toast.error('Failed to delete resume')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      const res = await resumeAPI.duplicate(id)
      setResumes(r => [res.resume, ...r])
      toast.success('Resume duplicated')
    } catch {
      toast.error('Failed to duplicate resume')
    }
  }

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {resumes.length === 0 ? 'Create your first resume to get started' : `You have ${resumes.length} resume${resumes.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={handleCreate} className="btn-primary" disabled={creating}>
            {creating ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
            New Resume
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-fade-up delay-100">
          {[
            { to: '/analyzer', icon: '📊', label: 'ATS Analyzer' },
            { to: '/job-match', icon: '🎯', label: 'Job Match' },
            { to: '/templates', icon: '🎨', label: 'Templates' },
            { to: '/profile', icon: '👤', label: 'Profile' },
          ].map(({ to, icon, label }) => (
            <Link key={to} to={to} className="card p-4 flex items-center gap-3 hover:border-amber-500/30 transition-all group">
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Resume grid */}
        <div className="animate-fade-up delay-200">
          <p className="section-title">Your Resumes</p>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : resumes.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No resumes yet</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create your first AI-powered resume</p>
              <button onClick={handleCreate} className="btn-primary mx-auto">
                Create Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map(resume => (
                <ResumeCard key={resume._id} resume={resume}
                  onDelete={handleDelete} onDuplicate={handleDuplicate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
