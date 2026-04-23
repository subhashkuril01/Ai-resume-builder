import { useState, useEffect } from 'react'
import { resumeAPI, analyzerAPI } from '../api'
import ScoreRing from '../components/common/ScoreRing'
import toast from 'react-hot-toast'

export default function Analyzer() {
  const [resumes, setResumes] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    resumeAPI.getAll()
      .then(res => { setResumes(res.resumes || []); if (res.resumes?.length) setSelectedId(res.resumes[0]._id) })
      .catch(() => toast.error('Failed to load resumes'))
      .finally(() => setFetching(false))
  }, [])

  const handleAnalyze = async () => {
    if (!selectedId) return toast.error('Select a resume first')
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await analyzerAPI.analyzeATS(selectedId)
      setAnalysis(res.analysis)
      toast.success('Analysis complete!')
    } catch (e) {
      toast.error(e.error || 'Analysis failed. Check your OpenAI API key.')
    } finally {
      setLoading(false)
    }
  }

  const priorityColor = { high: 'var(--danger)', medium: 'var(--accent)', low: 'var(--success)' }
  const priorityBg = { high: 'var(--danger-bg)', medium: 'var(--accent-dim)', low: 'var(--success-bg)' }

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-fade-up mb-8">
          <p className="section-title">AI Tools</p>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>ATS Resume Analyzer</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Get an AI-powered ATS compatibility score and actionable improvement suggestions.
          </p>
        </div>

        {/* Select & Run */}
        <div className="card p-5 mb-6 animate-fade-up delay-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="input flex-1" value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={fetching}>
              <option value="">— Select a resume —</option>
              {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
            <button onClick={handleAnalyze} className="btn-primary" disabled={loading || !selectedId}>
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing...
                </>
              ) : '⚡ Analyze Now'}
            </button>
          </div>
          {loading && (
            <div className="mt-4 text-center">
              <p className="text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>
                AI is reading your resume and computing your ATS score...
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-5 animate-fade-up">
            {/* Score + Summary */}
            <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={analysis.atsScore} size={130} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  ATS Score: {analysis.atsScore}/100
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {analysis.overallFeedback}
                </p>
              </div>
            </div>

            {/* Sections assessment */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Strong Sections', items: analysis.sections?.strong || [], type: 'success' },
                { label: 'Weak Sections', items: analysis.sections?.weak || [], type: 'warning' },
                { label: 'Missing Sections', items: analysis.sections?.missing || [], type: 'danger' },
              ].map(({ label, items, type }) => (
                <div key={label} className="card p-4">
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  {items.length === 0 ? <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None</p> : items.map((item, i) => (
                    <div key={i} className={`badge-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'accent'} mb-1.5 block`}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Keyword Analysis</h3>
              <div className="space-y-3">
                {[
                  { label: '✅ Keywords Found', items: analysis.keywords?.found || [], style: { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(66,130,94,0.3)' } },
                  { label: '❌ Missing Keywords', items: analysis.keywords?.missing || [], style: { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(220,38,38,0.2)' } },
                  { label: '💡 Recommended', items: analysis.keywords?.recommended || [], style: { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' } },
                ].map(({ label, items, style }) => items.length > 0 && (
                  <div key={label}>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((kw, i) => <span key={i} className="badge text-xs" style={style}>{kw}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
                  Improvement Suggestions ({analysis.suggestions.length})
                </h3>
                <div className="space-y-3">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg"
                      style={{ background: priorityBg[s.priority], border: `1px solid ${priorityColor[s.priority]}30` }}>
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="badge text-xs" style={{ background: `${priorityColor[s.priority]}20`, color: priorityColor[s.priority] }}>
                          {s.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: priorityColor[s.priority] }}>{s.issue}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
