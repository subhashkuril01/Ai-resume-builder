import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/admin/AdminLayout'
import { adminDashboardAPI } from '../api/adminAPI'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const data = await adminDashboardAPI.getDashboard()
      setStats(data.stats)
      setRecentActivities(data.recentActivities)
    } catch (err) {
      setError(err.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Initializing System...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          System Error: {error}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Management Overview</p>
          <h2 className="font-display text-4xl font-black text-text-primary">
            System <span className="text-text-muted">Health</span>
          </h2>
        </div>

        {/* Key Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="#f59e0b" />
            <StatCard icon="📄" label="Total Resumes" value={stats.totalResumes} color="#10b981" />
            <StatCard icon="✨" label="Active (7d)" value={stats.activeUsers} color="#3b82f6" />
            <StatCard icon="🚀" label="AI Volume" value={stats.aiUsageStats.reduce((acc, item) => acc + item.count, 0)} color="#8b5cf6" />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* AI Usage by Type */}
          <div className="xl:col-span-2 card p-8 border-border/50 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-text-primary">AI Intelligence Breakdown</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Last 7 Days</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.aiUsageStats.map(item => (
                <div key={item._id} className="p-6 rounded-2xl bg-white/[0.02] border border-border/50 hover:border-amber-500/30 transition-all group">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-amber-500 transition-colors">
                    {item._id.replace('_', ' ')}
                  </p>
                  <div className="flex items-end justify-between mt-4">
                    <p className="text-3xl font-black text-text-primary">{item.count}</p>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.tokensUsed.toLocaleString()} Tokens</p>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">${item.totalCost.toFixed(2)} USD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Performance (Placeholder for now) */}
          <div className="card p-8 border-border bg-amber-500/[0.02] flex flex-col justify-between">
             <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-text-primary">Quick Actions</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">Common administrative tasks and system controls.</p>
             </div>
             <div className="space-y-3 mt-8">
                <button className="w-full py-4 rounded-xl bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-amber-500/50 hover:text-amber-500 transition-all text-left px-5 flex items-center justify-between group">
                  Generate Report <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button className="w-full py-4 rounded-xl bg-white/5 border border-border text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-amber-500/50 hover:text-amber-500 transition-all text-left px-5 flex items-center justify-between group">
                  Manage Subscriptions <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button className="w-full py-4 rounded-xl bg-white/5 border border-border text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-amber-500/50 hover:text-amber-500 transition-all text-left px-5 flex items-center justify-between group">
                  System Settings <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
             </div>
          </div>
        </div>

        {/* Recent Activities */}
        {recentActivities && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="card p-8 border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xl font-bold text-text-primary">Latest Onboarding</h3>
                <Link to="/admin/users" className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {recentActivities.users.map(u => (
                  <div key={u._id} className="p-4 rounded-xl flex items-center justify-between bg-white/[0.02] border border-border/50 hover:border-border transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">{u.name[0]}</div>
                      <div>
                        <p className="font-bold text-xs text-text-primary uppercase tracking-wider">{u.name}</p>
                        <p className="text-[10px] font-medium text-text-secondary">{u.email}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-text-secondary'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Resumes */}
            <div className="card p-8 border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xl font-bold text-text-primary">Recent Artifacts</h3>
                <Link to="/admin/resumes" className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {recentActivities.resumes.map(r => (
                  <div key={r._id} className="p-4 rounded-xl bg-white/[0.02] border border-border/50 hover:border-border transition-all group">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-text-primary uppercase tracking-wider">{r.title}</p>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 transition-opacity">Owner: {r.userId?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card p-8 border-border/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black text-text-primary">{value.toLocaleString()}</p>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
        </div>
      </div>
    </div>
  )
}
