import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import { PersonalInfoStep, EducationStep, ExperienceStep, SkillsStep, ProjectsStep } from '../components/builder/FormSteps'
import ResumePreview from '../components/builder/ResumePreview'
import { exportToPDF } from '../utils/exportPDF'
import { BUILDER_TEMPLATES } from '../constants/templateCatalog'
import toast from 'react-hot-toast'

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
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Initializing Workspace</p>
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
    <div className="min-h-screen bg-primary flex flex-col pt-20">
      {/* Top Toolbar */}
      <div className="h-16 flex items-center justify-between px-6 bg-secondary border-b border-border relative z-20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg bg-white/5 border border-border/50 hover:bg-white/10 text-zinc-400 hover:text-text-primary transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex flex-col">
            {titleEditing ? (
              <input value={title} onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleSave} onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                className="bg-white/5 border border-amber-500/50 rounded px-2 py-0.5 text-sm text-text-primary focus:outline-none" autoFocus />
            ) : (
              <h2 onClick={() => setTitleEditing(true)} className="text-sm font-bold text-text-primary flex items-center gap-2 cursor-text group">
                {title}
                <svg className="opacity-0 group-hover:opacity-50 transition-opacity" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </h2>
            )}
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
              {saving ? '⟳ Saving Changes' : lastSaved ? `Last sync at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Draft Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1 p-1 bg-primary rounded-xl border border-border">
            <button onClick={() => setShowPreview(!showPreview)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showPreview ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-text-secondary hover:text-text-primary'}`}>Preview</button>
            <button onClick={handleLoadVersions} className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all">History</button>
          </div>
          <button onClick={handleShare} className={`h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${shareUrl ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-border text-zinc-400 hover:text-text-primary hover:bg-white/10'}`}>
            {shareUrl ? 'Public' : 'Private'}
          </button>
          <button onClick={handleExportPDF} className="h-10 px-5 rounded-xl bg-white/5 border border-border text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-text-primary hover:bg-white/10 transition-all" disabled={exporting}>
            {exporting ? '...' : 'Export'}
          </button>
          <button onClick={handleSave} className="h-10 px-6 rounded-xl bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest glow-orange" disabled={saving}>
            Finish
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Configuration Panel */}
        <div className="w-full lg:w-[480px] flex-shrink-0 flex flex-col bg-secondary border-r border-border z-10">
          
          {/* Step Progress */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Step {step + 1} of {STEPS.length}</p>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-4 bg-amber-500' : 'w-2 bg-white/5'}`} />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {STEPS.map((s, i) => (
                <button key={s.id} onClick={() => setStep(i)} 
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all min-w-[80px] ${step === i ? 'bg-amber-500/5 border-amber-500/30 text-amber-500' : 'bg-white/[0.02] border-border/50 text-text-secondary hover:bg-white/5'}`}>
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Strip */}
          <div className="px-8 py-4 border-y border-border/50 bg-white/[0.01]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary flex-shrink-0">Style:</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {BUILDER_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => handleTemplateChange(t.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${template === t.id ? 'bg-white text-black border-white' : 'bg-white/5 border-border/50 text-text-secondary hover:border-border hover:text-zinc-300'}`}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Form Area */}
          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            <div className="animate-fade-up">
              {stepContent[step]}
            </div>
          </div>

          {/* Footer Nav */}
          <div className="p-6 bg-white/[0.02] border-t border-border/50 flex items-center justify-between">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} 
              className={`px-6 py-3 rounded-xl border border-border/50 text-[10px] font-bold uppercase tracking-widest transition-all ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 text-zinc-400 hover:text-text-primary hover:bg-white/10'}`} 
              disabled={step === 0}>
              Back
            </button>
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} 
              className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${step === STEPS.length - 1 ? 'bg-zinc-800 text-text-secondary' : 'bg-white text-black hover:bg-zinc-200'}`} 
              disabled={step === STEPS.length - 1}>
              Continue
            </button>
          </div>
        </div>

        {/* Right: Real-time Preview */}
        <div className={`flex-1 bg-primary overflow-y-auto flex items-start justify-center p-12 transition-all duration-500 ${showPreview ? 'block' : 'hidden lg:flex'}`}>
          <div className="relative w-full max-w-[850px] animate-scale-in">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">A4 Live Sheet • Professional Render</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary bg-white/5 px-2 py-0.5 rounded border border-border/50">{template}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary bg-white/5 px-2 py-0.5 rounded border border-border/50">Auto-fitted</span>
              </div>
            </div>
            
            <div className="shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-border/50 scale-[0.9] origin-top">
              <ResumePreview resume={{ content, template }} id="resume-preview" />
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg bg-secondary border border-border/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-text-primary tracking-tight">Timeline</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-0.5">Resume snapshots and versions</p>
              </div>
              <button onClick={() => setShowVersions(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
              {versions.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-text-muted text-sm italic">No snapshots available for this document.</p>
                </div>
              ) : versions.map(v => (
                <div key={v._id} className="p-5 rounded-2xl bg-white/[0.02] border border-border/50 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">{v.label || 'Auto-Saved Snapshot'}</p>
                    <p className="text-xs text-text-primary font-medium">{new Date(v.savedAt).toLocaleDateString()} at {new Date(v.savedAt).toLocaleTimeString()}</p>
                  </div>
                  <button onClick={() => handleRestoreVersion(v._id, v.label)}
                    className="h-10 px-5 rounded-xl border border-border/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-text-primary hover:bg-white/5 transition-all">
                    Restore
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/[0.01] border-t border-border/50">
              <button onClick={handleSaveVersion} className="w-full h-12 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">Create New Snapshot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
