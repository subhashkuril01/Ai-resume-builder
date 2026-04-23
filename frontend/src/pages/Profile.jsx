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
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="animate-fade-up">
          <p className="section-title">Account</p>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
        </div>

        {/* Avatar + info */}
        <div className="card p-6 animate-fade-up delay-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--accent)', color: '#0d0c0a' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              <span className="badge-accent text-xs mt-1 inline-flex capitalize">{user?.plan || 'free'} plan</span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="label">Email (read-only)</label>
              <input className="input opacity-60" value={user?.email || ''} disabled />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card p-6 animate-fade-up delay-200">
          <h3 className="font-display font-semibold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
              { key: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="label">{f.label}</label>
                <input type="password" className="input" placeholder={f.placeholder}
                  value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button type="submit" className="btn-primary" disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card p-5 animate-fade-up delay-300" style={{ borderColor: 'rgba(220,38,38,0.2)' }}>
          <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--danger)' }}>Sign Out</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Sign out of your ResumeAI account on this device.</p>
          <button onClick={handleLogout} className="btn-danger">Sign Out</button>
        </div>
      </div>
    </div>
  )
}
