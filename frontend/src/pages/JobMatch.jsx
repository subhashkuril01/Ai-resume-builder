import { useState, useEffect } from 'react'
import { resumeAPI, jobMatchAPI } from '../api'
import toast from 'react-hot-toast'

function MatchMeter({ pct }) {
  const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#f59e0b' : pct >= 35 ? '#f97316' : '#ef4444'
  const glowClass = pct >= 75 ? 'shadow-[0_0_30px_rgba(16,185,129,0.3)]' : pct >= 55 ? 'shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  
  return (
    <div className="flex flex-col items-center gap-8 group">
      <div className={`relative w-56 h-56 rounded-full p-1 bg-white/5 border border-border/50 ${glowClass} transition-all duration-700`}>
        <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
          <circle cx="70" cy="70" r="64" fill="none" stroke="currentColor" strokeWidth="6" className="text-text-primary/5" />
          <circle cx="70" cy="70" r="64" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={402}
            strokeDashoffset={402 * (1 - pct / 100)}
            className="transition-all duration-[2000ms] ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-black text-6xl text-text-primary group-hover:scale-110 transition-transform duration-500">{pct}<span className="text-2xl text-text-secondary">%</span></span>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mt-2">Alignment</p>
        </div>
      </div>
      <div className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all animate-pulse"
        style={{ background: `${color}10`, color: color, borderColor: `${color}20` }}>
        {pct >= 75 ? 'Optimal Strategy' : pct >= 55 ? 'Strong Potential' : pct >= 35 ? 'Needs Optimization' : 'High Risk'}
      </div>
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
      .then(res => { 
        setResumes(res.resumes || [])
        if (res.resumes?.length) setSelectedId(res.resumes[0]._id) 
      })
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
    <div className="min-h-screen pt-32 pb-20 bg-primary">
      <div className="max-w-6xl mx-auto px-6">
        <div className="animate-fade-up mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-3">Matching Engine</p>
          <h1 className="font-display text-5xl lg:text-6xl font-black text-text-primary tracking-tight">
            Job <span className="text-text-muted">Sync</span>
          </h1>
          <p className="text-text-secondary text-sm mt-4 max-w-2xl leading-relaxed">
            AI-powered semantic matching between your resume and job requirements. Understand exactly where you stand and how to pivot.
          </p>
        </div>

        {/* Input area */}
        <div className="card p-8 lg:p-12 mb-12 animate-fade-up delay-100 bg-white/5 border-border/50">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Target Resume</label>
              <div className="relative group/select">
                <select 
                  className="w-full h-14 bg-white/[0.03] border border-border rounded-2xl px-6 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer"
                  value={selectedId} 
                  onChange={e => setSelectedId(e.target.value)}
                >
                  <option value="" className="bg-primary">Select a resume artifact...</option>
                  {resumes.map(r => <option key={r._id} value={r._id} className="bg-secondary">{r.title}</option>)}
                </select>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs transition-transform group-hover/select:translate-y-[-40%]">▼</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Job Description Artifact</label>
              <textarea 
                className="w-full h-64 bg-white/5 border border-border rounded-3xl p-8 text-sm text-text-secondary focus:border-amber-500/50 transition-all outline-none resize-none font-medium custom-scrollbar" 
                placeholder="Paste the full job description here. Include requirements, responsibilities, and company values..."
                value={jobDescription} 
                onChange={e => setJobDescription(e.target.value)} 
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
              <button 
                onClick={handleAnalyze} 
                className="flex-[2] h-14 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] glow-orange transition-all hover:scale-[1.01]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Running Analysis
                  </span>
                ) : '🎯 Analyze Compatibility'}
              </button>
              <button 
                onClick={handleExtractKeywords} 
                className="flex-1 h-14 rounded-2xl bg-white/[0.03] border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all" 
                disabled={kwLoading}
              >
                {kwLoading ? 'Extracting...' : 'Fetch Skills'}
              </button>
            </div>
          </div>
        </div>

        {/* Keywords extracted */}
        {keywords && (
          <div className="card p-10 mb-12 animate-fade-up border-border/50 bg-white/[0.01]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-border/50 gap-6">
              <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight">Requirement Breakdown</h3>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">{keywords.jobLevel}</span>
                <span className="px-4 py-1.5 rounded-xl bg-white/5 text-text-secondary text-[10px] font-black uppercase tracking-widest border border-border/50">{keywords.industry}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { label: 'Technical Core', items: keywords.technicalSkills || [], accent: 'text-amber-500' },
                { label: 'Tools & Stack', items: keywords.tools || [], accent: 'text-indigo-400' },
                { label: 'Human Skills', items: keywords.softSkills || [], accent: 'text-emerald-400' },
                { label: 'Key Phrases', items: keywords.keyPhrases || [], accent: 'text-text-secondary' },
              ].filter(g => g.items.length > 0).map(({ label, items, accent }) => (
                <div key={label} className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted pl-3 border-l-2 border-border">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((kw, i) => (
                      <span key={i} className={`px-2.5 py-1.5 rounded-lg bg-white/5 border border-border/50 ${accent} text-[9px] font-black uppercase tracking-wider`}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results section */}
        {result && (
          <div className="space-y-12 animate-fade-up pb-10">
            {/* Header Score */}
            <div className="card p-10 lg:p-14 border-border/50 flex flex-col lg:flex-row items-center gap-16 bg-white/[0.01] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <MatchMeter pct={result.matchPercentage} />
              <div className="flex-1 text-center lg:text-left space-y-6">
                <h2 className="font-display text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
                  {result.jobTitle}
                </h2>
                <div className="p-6 rounded-3xl bg-white/5 border border-border/50 relative">
                   <div className="absolute top-[-10px] left-8 px-3 py-1 bg-zinc-900 border border-border rounded-full text-[8px] font-black text-text-secondary uppercase tracking-widest">AI EVALUATION</div>
                  <p className="text-text-secondary text-sm leading-relaxed font-medium italic">
                    "{result.overallAssessment}"
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-10 border-emerald-500/10 bg-emerald-500/[0.01] group hover:bg-emerald-500/[0.02] transition-all">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">✅ Semantic Alignment</p>
                  <span className="text-[8px] font-bold text-emerald-500/50 uppercase">Strong Match</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(result.matchedSkills || []).map((s, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card p-10 border-red-500/10 bg-red-500/[0.01] group hover:bg-red-500/[0.02] transition-all">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">❌ Technical Gaps</p>
                  <span className="text-[8px] font-bold text-red-500/50 uppercase">Immediate Action</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(result.missingSkills || []).map((s, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider border border-red-500/20 shadow-lg shadow-red-500/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
               <div className="lg:col-span-3 card p-10 border-border/50 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-lg">💡</div>
                    <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight">Strategic Roadmap</h3>
                  </div>
                  <div className="grid gap-4">
                    {(result.recommendations || []).map((rec, i) => (
                      <div key={i} className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-border/50 hover:bg-white/[0.04] transition-all group border-l-2 border-l-amber-500/30">
                        <span className="text-amber-500/30 font-display font-black text-2xl group-hover:text-amber-500 transition-colors">0{i + 1}</span>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium mt-1">{rec}</p>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="lg:col-span-2 card p-10 border-border/50 bg-indigo-500/[0.01]">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-lg">🎙️</div>
                    <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight text-center lg:text-left">Interview Prep</h3>
                  </div>
                  <div className="space-y-4">
                    {(result.interviewTips || []).map((tip, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-border/50 relative group hover:bg-white/[0.05] transition-all">
                        <div className="absolute top-1/2 left-0 w-1 h-4 bg-indigo-500/50 rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
