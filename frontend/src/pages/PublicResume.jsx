import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { publicAPI } from '../api'
import ResumePreview from '../components/builder/ResumePreview'
import { exportToPDF } from '../utils/exportPDF'
import BrandLogo from '../components/common/BrandLogo'

export default function PublicResume() {
  const { slug } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    publicAPI.getResume(slug)
      .then(res => setResume(res.resume))
      .catch(() => setError('Artifact access denied or document no longer exists.'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleDownload = async () => {
    setExporting(true)
    try {
      await exportToPDF('public-resume-preview', `${resume?.title || 'resume'}.pdf`)
    } catch {
      toast.error('Artifact export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Syncing Secure Artifact</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-8 p-10">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        🔒
      </div>
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl font-black text-text-primary tracking-tight">Restricted Access</h1>
        <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">{error}</p>
      </div>
      <Link to="/" className="h-14 px-10 rounded-2xl bg-secondary text-text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all hover:scale-105">
        Return to Home →
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-primary">
      {/* Header bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 bg-secondary/80 backdrop-blur-2xl border-b border-border">
        <BrandLogo to="/" compact />
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Document Status</span>
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">● Public Live Artifact</span>
          </div>
          <div className="h-10 w-px bg-white/5" />
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownload} 
              className="h-12 px-8 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
              disabled={exporting}
            >
              {exporting ? 'Processing...' : 'Download PDF'}
            </button>
            <Link to="/register" className="h-12 px-8 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all hidden sm:flex items-center">
              Create Your Own →
            </Link>
          </div>
        </div>
      </nav>

      {/* Resume Container */}
      <div className="pt-32 pb-20 flex flex-col items-center px-6">
        <div className="w-full max-w-[850px] space-y-6 animate-fade-up">
          <div className="flex items-center justify-between px-4">
             <div className="flex flex-col">
                <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Shared Identity</h2>
                <p className="text-sm font-bold text-text-primary uppercase tracking-tighter">{resume?.title}</p>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">A4 Professional Render</span>
             </div>
          </div>
          
          <div className="shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden border border-white/5 bg-white">
            <ResumePreview resume={{ content: resume?.content, template: resume?.template }} id="public-resume-preview" />
          </div>
          
          <div className="py-10 text-center">
             <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em]">Powered by ResumeAI Advanced Systems</p>
          </div>
        </div>
      </div>
    </div>
  )
}
