import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

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
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="animate-fade-up space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Settings</p>
          <h1 className="font-display text-4xl font-black text-text-primary">Your Profile</h1>
        </div>

        {/* Avatar + info */}
        <div className="card p-8 animate-fade-up delay-100 border-border/50 bg-white/[0.02]">
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10 pb-8 border-b border-border/50">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl brand-mark relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-black">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-text-primary leading-none">{user?.name}</h2>
              <p className="text-sm text-zinc-400 font-medium">{user?.email}</p>
              <div className="flex items-center gap-3 pt-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">{user?.plan || 'Free'} Plan</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Member since {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
              <input className="w-full h-12 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
              <input className="w-full h-12 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-secondary cursor-not-allowed" 
                value={user?.email || ''} disabled />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="btn-primary px-8 py-3.5" disabled={saving}>
                {saving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Password */}
          <div className="lg:col-span-3 card p-8 animate-fade-up delay-200 border-border/50">
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold text-text-primary mb-1">Security</h3>
              <p className="text-xs text-text-secondary uppercase tracking-widest">Update your credentials</p>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {[
                { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
                { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">{f.label}</label>
                  <input type="password" 
                    className="w-full h-12 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                    placeholder={f.placeholder}
                    value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-amber-500/50 hover:text-amber-500 transition-all" disabled={pwSaving}>
                  {pwSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger zone */}
          <div className="lg:col-span-2 card p-8 animate-fade-up delay-300 border-red-500/10 bg-red-500/[0.02]">
            <div className="mb-6">
              <h3 className="font-display text-lg font-bold text-red-500 mb-1">Sign Out</h3>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-relaxed">End your current session on this device.</p>
            </div>
            <button onClick={handleLogout} className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all">
              SIGN OUT NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
