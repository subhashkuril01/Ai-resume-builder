import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import { PersonalInfoStep, EducationStep, ExperienceStep, SkillsStep, ProjectsStep } from '../components/builder/FormSteps'
import ResumePreview from '../components/builder/ResumePreview'
import { exportToPDF } from '../utils/exportPDF'
import toast from 'react-hot-toast'

const TEMPLATES = [
  { id: 'modern', label: 'Modern', color: '#0f766e' },
  { id: 'classic', label: 'Classic', color: '#1e3a5f' },
  { id: 'minimal', label: 'Minimal', color: '#64748b' },
  { id: 'executive', label: 'Executive', color: '#8B0000' },
  { id: 'creative', label: 'Creative', color: '#7c3aed' },
  { id: 'tech', label: 'Tech', color: '#00b4d8' },
]

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
]

export default function Builder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [content, setContent] = useState({})
  const [template, setTemplate] = useState('modern')
  const [title, setTitle] = useState('Untitled Resume')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState([])
  const [titleEditing, setTitleEditing] = useState(false)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    resumeAPI.getOne(id)
      .then(res => {
        setResume(res.resume)
        setContent(res.resume.content || {})
        setTemplate(res.resume.template || 'modern')
        setTitle(res.resume.title || 'Untitled Resume')
        setShareUrl(res.resume.isPublic ? `${window.location.origin}/r/${res.resume.publicSlug}` : null)
      })
      .catch(() => { toast.error('Resume not found'); navigate('/dashboard') })
      .finally(() => setLoading(false))
  }, [id])

  // Auto-save debounce
  const triggerAutoSave = useCallback((newContent, newTemplate, newTitle) => {
    if (!id) return
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    const timer = setTimeout(async () => {
      setSaving(true)
      try {
        await resumeAPI.update(id, { content: newContent, template: newTemplate, title: newTitle, autoSave: true })
        setLastSaved(new Date())
      } catch { /* silent */ }
      finally { setSaving(false) }
    }, 1500)
    setAutoSaveTimer(timer)
  }, [id, autoSaveTimer])

  const updateContent = (key, val) => {
    const newContent = { ...content, [key]: val }
    setContent(newContent)
    triggerAutoSave(newContent, template, title)
  }

  const handleTemplateChange = (t) => {
    setTemplate(t)
    triggerAutoSave(content, t, title)
  }

  const handleTitleSave = () => {
    setTitleEditing(false)
    triggerAutoSave(content, template, title)
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await resumeAPI.update(id, { content, template, title })
      setLastSaved(new Date())
      toast.success('Resume saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      setShowPreview(true)
      await new Promise(r => setTimeout(r, 500))
      await exportToPDF('resume-preview', `${title.replace(/\s+/g, '_')}.pdf`)
      toast.success('PDF exported!')
    } catch { toast.error('PDF export failed') }
    finally { setExporting(false) }
  }

  const handleShare = async () => {
    try {
      const res = await resumeAPI.toggleShare(id)
      if (res.isPublic) {
        setShareUrl(res.shareUrl)
        navigator.clipboard.writeText(res.shareUrl).catch(() => {})
        toast.success('Share link copied!')
      } else {
        setShareUrl(null)
        toast.success('Resume made private')
      }
    } catch { toast.error('Share toggle failed') }
  }

  const handleSaveVersion = async () => {
    const label = prompt('Version label (optional):') || undefined
    try {
      await resumeAPI.saveVersion(id, label)
      toast.success('Version saved!')
    } catch { toast.error('Failed to save version') }
  }

  const handleLoadVersions = async () => {
    try {
      const res = await resumeAPI.getVersions(id)
      setVersions(res.versions)
      setShowVersions(true)
    } catch { toast.error('Failed to load versions') }
  }

  const handleRestoreVersion = async (versionId, vLabel) => {
    if (!confirm(`Restore "${vLabel}"? Current content will be saved first.`)) return
    try {
      const res = await resumeAPI.restoreVersion(id, versionId)
      setContent(res.resume.content)
      setTemplate(res.resume.template)
      setShowVersions(false)
      toast.success('Version restored!')
    } catch { toast.error('Restore failed') }
  }

  if (loading) return (
    <div className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="3" opacity="0.3"/>
          <path fill="var(--accent)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading resume...</p>
      </div>
    </div>
  )

  const stepContent = [
    <PersonalInfoStep data={content.personalInfo} onChange={v => updateContent('personalInfo', v)} />,
    <ExperienceStep data={content.experience} onChange={v => updateContent('experience', v)} />,
    <EducationStep data={content.education} onChange={v => updateContent('education', v)} />,
    <SkillsStep data={content.skills} onChange={v => updateContent('skills', v)} />,
    <ProjectsStep data={content.projects} onChange={v => updateContent('projects', v)} />,
  ]

  return (
    <div className="min-h-screen pt-14 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-icon"
            title="Back to dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          {titleEditing ? (
            <input value={title} onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleSave} onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
              className="input text-sm py-1 px-2 h-8 w-48" autoFocus />
          ) : (
            <button onClick={() => setTitleEditing(true)}
              className="text-sm font-medium flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}>
              {title}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {saving ? '⟳ Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="btn-ghost text-xs py-1.5">
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={handleSaveVersion} className="btn-ghost text-xs py-1.5">💾 Snapshot</button>
          <button onClick={handleLoadVersions} className="btn-ghost text-xs py-1.5">🕐 History</button>
          <button onClick={handleShare} className="btn-ghost text-xs py-1.5">
            {shareUrl ? '🔒 Make Private' : '🔗 Share'}
          </button>
          <button onClick={handleExportPDF} className="btn-ghost text-xs py-1.5" disabled={exporting}>
            {exporting ? '⟳' : '⬇'} PDF
          </button>
          <button onClick={handleSave} className="btn-primary text-xs py-1.5" disabled={saving}>
            Save
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="px-4 py-2 flex items-center gap-2 text-xs" style={{ background: 'var(--success-bg)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--success)' }}>🔗 Public link:</span>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--success)' }}>{shareUrl}</a>
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Copied!') }}
            className="ml-1 text-xs px-2 py-0.5 rounded" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}>
            Copy
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Form */}
        <div className="w-full md:w-[420px] flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ borderRight: '1px solid var(--border)' }}>

          {/* Template selector */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="section-title">Template</p>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleTemplateChange(t.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: template === t.id ? `${t.color}20` : 'var(--bg-secondary)',
                    border: `1px solid ${template === t.id ? t.color : 'var(--border)'}`,
                    color: template === t.id ? t.color : 'var(--text-secondary)',
                  }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step tabs */}
          <div className="flex px-4 py-2 gap-1 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: step === i ? 'var(--accent-dim)' : 'transparent',
                  color: step === i ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="animate-scale-in">
              {stepContent[step]}
            </div>
          </div>

          {/* Step nav */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} className="btn-ghost text-xs py-1.5" disabled={step === 0}>
              ← Previous
            </button>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{step + 1} / {STEPS.length}</span>
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className="btn-primary text-xs py-1.5" disabled={step === STEPS.length - 1}>
              Next →
            </button>
          </div>
        </div>

        {/* Right panel - Preview */}
        {(showPreview || window.innerWidth >= 1024) && (
          <div className="flex-1 overflow-y-auto flex items-start justify-center py-8 px-4"
            style={{ background: 'var(--bg-secondary)' }}>
            <div className="w-full" style={{ maxWidth: '794px' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Live Preview</p>
                <span className="badge-muted text-xs capitalize">{template}</span>
              </div>
              <div className="overflow-hidden rounded-lg shadow-2xl" style={{ transform: 'scale(0.72)', transformOrigin: 'top left', width: '138.9%' }}>
                <ResumePreview resume={{ content, template }} id="resume-preview" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Version history modal */}
      {showVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card w-full max-w-md max-h-[70vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Version History</h3>
              <button onClick={() => setShowVersions(false)} className="btn-icon w-7 h-7">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {versions.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No saved versions yet</p>
              ) : versions.map(v => (
                <div key={v._id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{v.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(v.savedAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleRestoreVersion(v._id, v.label)}
                    className="text-xs px-2.5 py-1 rounded-md font-medium"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
