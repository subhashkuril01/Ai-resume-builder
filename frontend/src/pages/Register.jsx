import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to CVISION')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthColors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981']
  const strengthLabels = ['Critical', 'Moderate', 'Secure', 'Fortified']

  return (
    <div className="min-h-screen flex bg-primary text-text-primary">
      {/* Left Panel: Visuals */}
      <div className="hidden lg:flex flex-col justify-center relative w-[45%] p-20 bg-secondary border-r border-border overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-amber-500/[0.02] -z-10" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full" />
        
        <div className="space-y-12 relative z-10">
          <div>
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tighter text-text-primary">
              The future of <br />
              <span className="text-amber-500">resume building.</span>
            </h1>
            <p className="mt-6 text-text-secondary max-w-sm leading-relaxed">
              Join 50,000+ professionals using AI to land more interviews and accelerate their career growth.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[
              { title: 'Free Pro Templates', desc: 'Industry-validated designs.' },
              { title: 'AI Content Engine', desc: 'Write like a professional.' },
              { title: 'ATS Scoring', desc: 'Know your rank instantly.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-primary">{item.title}</p>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-12 left-20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">© 2026 CVISION</p>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-primary relative overflow-y-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md animate-fade-up relative z-10 py-12">
          <div className="mb-10 text-center lg:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">Get Started Free</p>
            <h2 className="font-display text-3xl font-bold text-text-primary tracking-tight">Create your account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
              <input type="text" className="input h-12 bg-white/[0.03] border-border focus:border-amber-500/50 transition-all" 
                placeholder="Jane Smith"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
              <input type="email" className="input h-12 bg-white/[0.03] border-border focus:border-amber-500/50 transition-all" 
                placeholder="jane@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Password</label>
              <input type="password" className="input h-12 bg-white/[0.03] border-border focus:border-amber-500/50 transition-all"
                placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              
              {form.password && (
                <div className="px-1 pt-1">
                  <div className="flex gap-1.5 mb-1.5">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full transition-all duration-500"
                          style={{ 
                            width: i < strength ? '100%' : '0%',
                            background: strengthColors[strength-1]
                          }} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: strengthColors[strength-1] }}>
                    Security: {strengthLabels[strength-1]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Confirm Password</label>
              <input type="password" className="input h-12 bg-white/[0.03] border-border focus:border-amber-500/50 transition-all"
                placeholder="••••••••"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>

            <button type="submit" className="btn-primary w-full h-12 justify-center glow-orange mt-2" disabled={loading}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : 'Establish Account'}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest mt-10 text-text-secondary">
            Already a member?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 transition-colors ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
