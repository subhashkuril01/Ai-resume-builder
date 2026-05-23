import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-primary text-text-primary">
      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-center relative w-[45%] p-20 bg-secondary border-r border-border overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-amber-500/[0.02] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full" />
        
        <div className="space-y-12 relative z-10">
          <div>
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tighter text-text-primary">
              Elevate your <br />
              <span className="text-amber-500">career journey.</span>
            </h1>
            <p className="mt-6 text-text-secondary max-w-sm leading-relaxed">
              Sign in to access your AI-powered resume suite and track your application progress.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { label: 'ATS Optimization', icon: '⚡' },
              { label: 'GPT-4o Intelligence', icon: '🤖' },
              { label: 'Real-time Job Matching', icon: '🎯' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center text-lg group-hover:border-amber-500/50 transition-all">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-12 left-20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">© 2026 CVISION</p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex flex-col p-8 pt-24 pb-12 bg-primary relative overflow-y-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md animate-fade-up relative z-10 my-auto mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">Welcome Back</p>
            <h2 className="font-display text-3xl font-bold text-text-primary tracking-tight">Login to Dashboard</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
              <input type="email" className="input h-12 bg-white/[0.03] border-border focus:border-amber-500/50 transition-all" 
                placeholder="name@company.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Password</label>
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 hover:text-amber-500 transition-colors">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input type={showPass ? 'text' : 'password'} className="input h-12 bg-white/[0.03] border-border focus:border-amber-500/50 transition-all"
                placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>

            <button type="submit" className="btn-primary w-full h-12 justify-center glow-orange mt-2" disabled={loading}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : 'Access Account'}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest mt-10 text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-500 hover:text-amber-400 transition-colors ml-1">
              Register Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
