import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { publicAPI } from '../api'
import ResumePreview from '../components/builder/ResumePreview'
import { exportToPDF } from '../utils/exportPDF'

export default function PublicResume() {
  const { slug } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    publicAPI.getResume(slug)
      .then(res => setResume(res.resume))
      .catch(() => setError('Resume not found or is no longer publicly shared.'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleDownload = async () => {
    setExporting(true)
    try {
      await exportToPDF('public-resume-preview', `${resume?.title || 'resume'}.pdf`)
    } catch {
      alert('PDF export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="3" opacity="0.3"/>
          <path fill="var(--accent)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading resume...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-4xl">🔍</div>
      <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Resume Not Found</h1>
      <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
      <Link to="/" className="btn-primary text-sm">Go to ResumeAI →</Link>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-12"
        style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent)', color: '#0d0c0a' }}>R</div>
          <span className="font-display text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>ResumeAI</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{resume?.title}</span>
          <button onClick={handleDownload} className="btn-primary text-xs py-1" disabled={exporting}>
            {exporting ? '⟳' : '⬇'} Download PDF
          </button>
          <Link to="/register" className="btn-ghost text-xs py-1">Build yours free →</Link>
        </div>
      </div>

      {/* Resume */}
      <div className="pt-16 pb-12 flex justify-center px-4">
        <div className="w-full" style={{ maxWidth: 794 }}>
          <ResumePreview resume={{ content: resume?.content, template: resume?.template }} id="public-resume-preview" />
        </div>
      </div>
    </div>
  )
}
