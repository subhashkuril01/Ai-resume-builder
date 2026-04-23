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
      toast.success('Account created! Welcome to ResumeAI')
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

  const strengthColors = ['var(--danger)', '#f97316', '#f59e0b', 'var(--success)']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            style={{ background: 'var(--accent)', color: '#0d0c0a' }}>R</div>
          <span className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>ResumeAI</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Free forever. No credit card required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Full name</label>
            <input type="text" className="input" placeholder="Jane Smith"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i < strength ? strengthColors[strength-1] : 'var(--border)' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColors[strength-1] || 'var(--text-muted)' }}>
                  {strengthLabels[strength-1] || 'Enter password'}
                </p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="label">Confirm password</label>
            <input type="password" className="input" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : 'Create free account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
