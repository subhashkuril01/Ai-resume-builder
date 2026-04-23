import { useState, useEffect } from 'react'
import { resumeAPI, jobMatchAPI } from '../api'
import toast from 'react-hot-toast'

function MatchMeter({ pct }) {
  const color = pct >= 75 ? '#42825e' : pct >= 55 ? '#f59e0b' : pct >= 35 ? '#f97316' : '#dc2626'
  const label = pct >= 75 ? 'Strong Match' : pct >= 55 ? 'Good Match' : pct >= 35 ? 'Moderate Match' : 'Weak Match'
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 140 140" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="58" fill="none" stroke="var(--bg-secondary)" strokeWidth="12" />
          <circle cx="70" cy="70" r="58" fill="none" stroke={color} strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 8px ${color}60)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-4xl" style={{ color }}>{pct}%</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>match</span>
        </div>
      </div>
      <span className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
        {label}
      </span>
    </div>
  )
}

export default function JobMatch() {
  const [resumes, setResumes] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [keywords, setKeywords] = useState(null)
  const [loading, setLoading] = useState(false)
  const [kwLoading, setKwLoading] = useState(false)

  useEffect(() => {
    resumeAPI.getAll()
      .then(res => { setResumes(res.resumes || []); if (res.resumes?.length) setSelectedId(res.resumes[0]._id) })
      .catch(() => {})
  }, [])

  const handleAnalyze = async () => {
    if (!selectedId || !jobDescription.trim()) return toast.error('Select resume and paste a job description')
    setLoading(true); setResult(null)
    try {
      const res = await jobMatchAPI.analyze(selectedId, jobDescription)
      setResult(res.match)
      toast.success('Match analysis complete!')
    } catch (e) {
      toast.error(e.error || 'Analysis failed')
    } finally { setLoading(false) }
  }

  const handleExtractKeywords = async () => {
    if (!jobDescription.trim()) return toast.error('Paste a job description first')
    setKwLoading(true); setKeywords(null)
    try {
      const res = await jobMatchAPI.extractKeywords(jobDescription)
      setKeywords(res.keywords)
    } catch (e) {
      toast.error(e.error || 'Keyword extraction failed')
    } finally { setKwLoading(false) }
  }

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-fade-up mb-8">
          <p className="section-title">AI Tools</p>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Job Match Engine</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Paste any job description to get your match score, missing skills, and tailored recommendations.
          </p>
        </div>

        {/* Input card */}
        <div className="card p-5 mb-6 animate-fade-up delay-100 space-y-4">
          <div className="form-group">
            <label className="label">Select Resume</label>
            <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">— Select —</option>
              {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Job Description</label>
            <textarea className="textarea w-full" rows={8}
              placeholder="Paste the full job description here — the more detail the better..."
              value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAnalyze} className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
              ) : '🎯 Analyze Match'}
            </button>
            <button onClick={handleExtractKeywords} className="btn-ghost" disabled={kwLoading}>
              {kwLoading ? '⟳' : '🔑'} Extract Keywords
            </button>
          </div>
        </div>

        {/* Keywords */}
        {keywords && (
          <div className="card p-5 mb-5 animate-fade-up">
            <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Extracted Keywords — <span className="badge-muted ml-1">{keywords.jobLevel}</span> · <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{keywords.industry}</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Technical Skills', items: keywords.technicalSkills || [] },
                { label: 'Tools & Technologies', items: keywords.tools || [] },
                { label: 'Soft Skills', items: keywords.softSkills || [] },
                { label: 'Key Phrases', items: keywords.keyPhrases || [] },
              ].filter(g => g.items.length > 0).map(({ label, items }) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((kw, i) => <span key={i} className="badge-muted text-xs">{kw}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match result */}
        {result && (
          <div className="space-y-5 animate-fade-up">
            {/* Score header */}
            <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
              <MatchMeter pct={result.matchPercentage} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {result.jobTitle}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {result.overallAssessment}
                </p>
              </div>
            </div>

            {/* Skills grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--success)' }}>✅ Matched Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.matchedSkills || []).map((s, i) => <span key={i} className="badge-success text-xs">{s}</span>)}
                  {!result.matchedSkills?.length && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None detected</p>}
                </div>
              </div>
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--danger)' }}>❌ Missing Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.missingSkills || []).map((s, i) => <span key={i} className="badge-danger text-xs">{s}</span>)}
                  {!result.missingSkills?.length && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None detected</p>}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>💡 Recommendations</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--accent-dim)' }}>
                      <span style={{ color: 'var(--accent)' }} className="flex-shrink-0 font-bold text-sm">{i + 1}.</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview tips */}
            {result.interviewTips?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>🎤 Interview Preparation Tips</h3>
                <div className="space-y-2">
                  {result.interviewTips.map((tip, i) => (
                    <div key={i} className="flex gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
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
