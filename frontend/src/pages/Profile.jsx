import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI, resumeAPI } from '../api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [stats, setStats] = useState({ count: null, avg: null })

  useEffect(() => {
    resumeAPI.getAll()
      .then(res => {
        const resumes = res.resumes || []
        const count = resumes.length
        const avg = count ? Math.round(resumes.reduce((s, r) => s + (r.atsScore || 0), 0) / count) : null
        setStats({ count, avg })
      })
      .catch(() => setStats({ count: null, avg: null }))
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authAPI.updateProfile({ name })
      updateUser(res.user)
      toast.success('Profile updated!')
    } catch (e) {
      toast.error(e.error || 'Update failed')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setPwSaving(true)
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e) {
      toast.error(e.error || 'Password change failed')
    } finally { setPwSaving(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/[0.04] blur-[140px] rounded-full -z-10" />
      <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] bg-indigo-500/[0.02] blur-[100px] rounded-full -z-10" />

      {/* Grid Background */}
      <div
        className="absolute inset-0 z-[-5] opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 space-y-8 relative z-10">
        {/* Header */}
        <div className="animate-fade-up space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Account Settings</p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-text-primary tracking-tight">Your Profile</h1>
        </div>

        {/* Avatar Banner */}
        <div className="card p-8 md:p-10 animate-fade-up delay-100 border-border/50 bg-white/[0.02] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] blur-[80px] rounded-full" />
          <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
            {/* Avatar with status ring */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl brand-mark relative overflow-hidden group ring-4 ring-amber-500/20">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-black">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-primary ring-2 ring-emerald-500/20 animate-pulse" />
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-3xl font-bold text-text-primary leading-none">{user?.name}</h2>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-text-muted" />
                  Member since {new Date().getFullYear()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Account Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up delay-200">
          {[
            { icon: '📄', label: 'Resumes', value: stats.count ?? '—' },
            { icon: '⚡', label: 'ATS Average', value: stats.avg !== null ? `${stats.avg}%` : '—' },
            { icon: '🔒', label: 'Authentication', value: 'Active' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card p-5 flex items-center gap-4 hover:border-amber-500/30 group bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Profile Edit Card */}
          <div className="lg:col-span-3 card p-8 animate-fade-up delay-300 border-border/50 bg-white/[0.02]">
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold text-text-primary mb-1">Personal Information</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Update your display name and details</p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input"
                    value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input !text-text-muted cursor-not-allowed"
                    value={user?.email || ''} disabled />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button type="submit" className="btn-primary px-8 py-3.5" disabled={saving}>
                  {saving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Changes take effect immediately
                </p>
              </div>
            </form>
          </div>

          {/* Security Card */}
          <div className="lg:col-span-2 card p-8 animate-fade-up delay-300 border-border/50 bg-white/[0.02] h-fit">
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold text-text-primary mb-1">Security</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Update credentials</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              {[
                { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
                { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="password" className="input"
                    placeholder={f.placeholder}
                    value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}

              <button type="submit"
                className="w-full py-3.5 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all"
                disabled={pwSaving}>
                {pwSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-8 animate-fade-up delay-400 border-red-500/10 bg-red-500/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-red-500 mb-1">Sign Out</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-relaxed max-w-md">
                  End your current session on this device. You will be redirected to the homepage.
                </p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="px-8 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all shrink-0">
              SIGN OUT NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
