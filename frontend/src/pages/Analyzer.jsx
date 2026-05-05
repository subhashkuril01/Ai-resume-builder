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
      .then(res => { 
        setResumes(res.resumes || [])
        if (res.resumes?.length) setSelectedId(res.resumes[0]._id) 
      })
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

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#080807]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="animate-fade-up mb-16 text-center lg:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-3">AI Intelligence</p>
          <h1 className="font-display text-5xl lg:text-6xl font-black text-white tracking-tight">
            ATS <span className="text-zinc-700">Analyzer</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-4 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Audit your resume against modern Applicant Tracking Systems. Our AI identifies gaps, missing keywords, and structural issues to ensure you pass the first filter.
          </p>
        </div>

        {/* Selection Area */}
        <div className="card p-8 lg:p-10 mb-12 animate-fade-up delay-100 bg-white/[0.02] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl group-hover:scale-110 transition-transform duration-700">🧠</div>
          <div className="flex flex-col lg:flex-row items-end gap-6 relative z-10">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">Target Artifact</label>
              <div className="relative group/select">
                <select 
                  className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer"
                  value={selectedId} 
                  onChange={e => setSelectedId(e.target.value)} 
                  disabled={fetching}
                >
                  <option value="">Select a document...</option>
                  {resumes.map(r => <option key={r._id} value={r._id} className="bg-[#121210]">{r.title}</option>)}
                </select>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs transition-transform group-hover/select:translate-y-[-40%]">▼</span>
              </div>
            </div>
            <button 
              onClick={handleAnalyze} 
              className="w-full lg:w-auto h-14 px-10 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] glow-orange transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale"
              disabled={loading || !selectedId}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Analyzing
                </span>
              ) : '⚡ Start Audit'}
            </button>
          </div>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-10 animate-fade-up">
            {/* Score & Summary */}
            <div className="card p-10 lg:p-12 border-white/5 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden bg-amber-500/[0.01]">
              <div className="relative flex-shrink-0 animate-scale-in">
                <div className="w-44 h-44 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="82" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.02]" />
                    <circle 
                      cx="88" cy="88" r="82" fill="none" stroke="currentColor" strokeWidth="8" 
                      className="text-amber-500 transition-all duration-[2000ms] ease-out"
                      strokeDasharray={515}
                      strokeDashoffset={515 * (1 - analysis.atsScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-6xl font-black text-white">{analysis.atsScore}</span>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">ATS Score</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left space-y-4">
                <h2 className="font-display text-3xl font-bold text-white tracking-tight">Executive Summary</h2>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  {analysis.overallFeedback}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                   <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Pass Probability</p>
                      <p className="text-sm font-black text-white">{analysis.atsScore > 75 ? 'HIGH' : 'MEDIUM'}</p>
                   </div>
                   <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Keywords</p>
                      <p className="text-sm font-black text-white">{analysis.keywords?.found.length || 0} / {(analysis.keywords?.found.length || 0) + (analysis.keywords?.missing.length || 0)}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Strategic Pillars', items: analysis.sections?.strong || [], accent: 'emerald-500' },
                { label: 'Structural Gaps', items: analysis.sections?.weak || [], accent: 'amber-500' },
                { label: 'Critical Missing', items: analysis.sections?.missing || [], accent: 'red-500' },
              ].map(({ label, items, accent }) => (
                <div key={label} className="card p-8 border-white/5 group hover:border-white/10 transition-all">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">{label}</p>
                  <div className="space-y-3">
                    {items.length === 0 ? (
                      <p className="text-[10px] font-bold text-zinc-700 italic uppercase">No data detected</p>
                    ) : items.map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 transition-all group-hover:bg-white/[0.04]`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-${accent} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div className="card p-10 border-white/5 bg-white/[0.01]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h3 className="font-display text-2xl font-bold text-white tracking-tight">Vocabulary Audit</h3>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Industry Relevance & Keyword Density</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {[
                  { label: 'Found in Artifact', items: analysis.keywords?.found || [], color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Missing Critical', items: analysis.keywords?.missing || [], color: 'text-red-500', bg: 'bg-red-500/10' },
                  { label: 'AI Recommended', items: analysis.keywords?.recommended || [], color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map(({ label, items, color, bg }) => (
                  <div key={label} className="space-y-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-l-2 border-white/10 pl-3">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((kw, i) => (
                        <span key={i} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${bg} ${color} border border-white/5 hover:scale-105 transition-transform cursor-default`}>
                          {kw}
                        </span>
                      ))}
                      {items.length === 0 && <p className="text-[10px] font-bold text-zinc-700 italic uppercase">None</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="card p-10 border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-2 h-8 bg-amber-500 rounded-full" />
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">Strategic Fixes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 border border-white/10`} 
                          style={{ color: priorityColor[s.priority] }}>
                          {s.priority} Impact
                        </span>
                      </div>
                      <p className="text-base font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">{s.issue}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">{s.suggestion}</p>
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
