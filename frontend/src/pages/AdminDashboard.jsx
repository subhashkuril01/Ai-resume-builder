import { useEffect, useState } from 'react'
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
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 rounded-lg bg-red-100 text-red-700">
          Error: {error}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {user?.name}!
        </h2>

        {/* Key Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="👥"
              label="Total Users"
              value={stats.totalUsers}
              color="#3B82F6"
            />
            <StatCard
              icon="📄"
              label="Total Resumes"
              value={stats.totalResumes}
              color="#10B981"
            />
            <StatCard
              icon="✨"
              label="Active Users (7d)"
              value={stats.activeUsers}
              color="#F59E0B"
            />
            <StatCard
              icon="🚀"
              label="AI Requests (7d)"
              value={stats.aiUsageStats.reduce((acc, item) => acc + item.count, 0)}
              color="#8B5CF6"
            />
          </div>
        )}

        {/* AI Usage by Type */}
        {stats?.aiUsageStats.length > 0 && (
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              AI Usage Breakdown (Last 7 Days)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.aiUsageStats.map(item => (
                <div key={item._id} className="p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                  </p>
                  <p className="text-2xl font-bold mt-2" style={{ color: 'var(--accent)' }}>
                    {item.count}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {item.tokensUsed} tokens • ${item.totalCost.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {recentActivities && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div
              className="p-6 rounded-lg border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Recent Users
              </h3>
              <div className="space-y-3">
                {recentActivities.users.map(u => (
                  <div
                    key={u._id}
                    className="p-3 rounded-lg flex items-center justify-between"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {u.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {u.email}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: u.role === 'admin' ? '#8B5CF6' : 'transparent',
                        color: u.role === 'admin' ? 'white' : 'var(--text-secondary)',
                        border: u.role === 'admin' ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Resumes */}
            <div
              className="p-6 rounded-lg border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Recent Resumes
              </h3>
              <div className="space-y-3">
                {recentActivities.resumes.map(r => (
                  <div
                    key={r._id}
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {r.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      By {r.userId?.name} • {new Date(r.createdAt).toLocaleDateString()}
                    </p>
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
    <div
      className="p-6 rounded-lg border"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: color }}
        ></div>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  )
}
