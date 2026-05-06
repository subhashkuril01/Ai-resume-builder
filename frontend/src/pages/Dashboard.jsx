import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumeAPI, resumeTestAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

function ResumeCard({ resume, onDelete, onDuplicate }) {
  const navigate = useNavigate()
  const score = resume.atsScore || 0
  const status = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low'
  const statusColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="card group relative p-6 transition-all duration-500 hover:border-amber-500/40 bg-white/[0.02]"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/builder/${resume._id}`)}>
      
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Live Artifact</p>
          </div>
          <h3 className="font-display font-bold text-xl text-text-primary group-hover:text-amber-500 transition-colors">
            {resume.title}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
            {resume.template || 'Modern'} Template
          </p>
        </div>
        <div className="relative w-16 h-20 bg-black/40 rounded-xl border border-white/5 overflow-hidden group-hover:border-amber-500/20 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
          <div className="absolute inset-x-3 top-3 h-0.5 bg-white/10 rounded-full" />
          <div className="absolute inset-x-3 top-5 h-0.5 bg-white/5 rounded-full" />
          <div className="absolute inset-x-3 top-7 h-8 bg-white/[0.02] rounded-sm" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500/30" />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ATS Match Probability</span>
            <span className="text-xs font-bold text-text-primary">{score}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
            {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => onDuplicate(resume._id)} className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all" title="Duplicate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button onClick={() => onDelete(resume._id)} className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([
      resumeAPI.getAll(),
      resumeTestAPI.getAll()
    ]).then(([resData, testData]) => {
      setResumes(resData.resumes || [])
      setTests(testData.tests || [])
    }).catch(() => toast.error('Failed to load dashboard data'))
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
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                {user?.role === 'admin' ? 'Elite Admin Access' : 'Pro Member Workspace'}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-text-primary tracking-tight leading-[0.9]">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0] || 'friend'}</span>.
            </h1>
            <p className="text-zinc-500 text-sm mt-6 font-medium max-w-md leading-relaxed">
              Your professional command center. Manage your artifacts, track AI analysis, and prep for your next big move.
            </p>
          </div>

          <div className="flex items-center gap-4 animate-fade-up delay-100">
             <button onClick={handleCreate} disabled={creating}
              className="btn-primary h-14 px-8 glow-orange flex items-center gap-3">
              <span className="text-lg">+</span>
              {creating ? 'Initializing...' : 'Create New Artifact'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up delay-200">
              {[
                { to: '/analyzer', icon: '⚡', label: 'ATS Auditor', sub: 'Check Score' },
                { to: '/job-match', icon: '🎯', label: 'Role Match', sub: 'Sync Skills' },
                { to: '/resume-test', icon: '🧠', label: 'Assessment', sub: 'Mock Interview' },
              ].map(({ to, icon, label, sub }) => (
                <Link key={to} to={to} className="card p-6 flex items-center gap-5 hover:border-amber-500/30 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{label}</p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Resumes List */}
            <div className="animate-fade-up delay-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-text-primary">Your Artifacts</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-1">Recently modified documents</p>
                </div>
                <Link to="/templates" className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors">View All Templates →</Link>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="card h-64 animate-pulse bg-white/[0.02]" />)}
                </div>
              ) : resumes.length === 0 ? (
                <div className="card p-20 text-center bg-white/[0.01] border-dashed border-border">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </div>
                  <h3 className="text-text-primary font-bold mb-2">No resumes found</h3>
                  <p className="text-zinc-600 text-xs mb-8 max-w-xs mx-auto">Start by choosing a professional template and let AI help you build the perfect resume.</p>
                  <button onClick={handleCreate} className="btn-primary px-8">Start Building</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resumes.map(resume => (
                    <ResumeCard key={resume._id} resume={resume} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8 animate-fade-up delay-400">
            
            {/* Insights Module */}
            <div className="card p-8 bg-gradient-to-br from-amber-500 to-amber-600 border-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">Pro Insights</p>
                <h3 className="font-display text-2xl font-bold text-black mb-6 leading-tight">Your Resume is in the <br/> top 15% of candidates.</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black">ATS Readiness</p>
                    <p className="text-xl font-bold text-black">88%</p>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full">
                    <div className="h-full bg-[#1a1a1a] w-[88%] rounded-full shadow-sm" />
                  </div>
                </div>

                <button className="w-full mt-8 py-3 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all">
                  Run Full Audit
                </button>
              </div>
            </div>

            {/* Assessment History */}
            <div className="card p-6 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Assessment Feed</h3>
                <Link to="/resume-test" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Tests</Link>
              </div>
              
              <div className="space-y-4">
                {tests.length === 0 ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 py-4 text-center">No assessments taken</p>
                ) : tests.slice(0, 3).map(test => (
                  <div key={test._id} className="p-4 rounded-xl bg-white/[0.02] border border-border flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer"
                    onClick={() => navigate(`/resume-test`)}>
                    <div>
                      <p className="text-xs font-bold text-text-primary mb-1 line-clamp-1">{test.title || 'Skills Assessment'}</p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Score: <span className={test.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}>{test.score || 0}%</span></p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-white transition-colors">
                      →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="px-4 py-2 flex items-center justify-between border-t border-white/5 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">AI Cluster Online</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">v4.2.0-stable</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
