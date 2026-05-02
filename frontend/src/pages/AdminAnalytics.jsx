import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/admin/AdminLayout'
import { adminDashboardAPI } from '../api/adminAPI'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await adminDashboardAPI.getAnalytics(days)
      setAnalytics(data.analytics)
    } catch (err) {
      setError(err.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Analytics
          </h2>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-100 text-red-700">
            Error: {error}
          </div>
        ) : !analytics ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)' }}>No data available</p>
          </div>
        ) : (
          <>
            {/* Usage by Type */}
            {analytics.usageByType.length > 0 && (
              <div
                className="p-6 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  AI Usage by Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.usageByType.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 rounded-lg"
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                      </p>
                      <p className="text-3xl font-bold mt-2" style={{ color: 'var(--accent)' }}>
                        {item.count}
                      </p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="block">Tokens: {item.tokensUsed}</span>
                        <span className="block">Cost: ${item.totalCost.toFixed(2)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Usage Chart */}
            {analytics.dailyUsage.length > 0 && (
              <div
                className="p-6 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Daily Usage Trend
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{
                          background: 'var(--bg-primary)',
                          borderBottom: '1px solid var(--border)'
                        }}
                      >
                        <th
                          className="px-4 py-2 text-left font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Date
                        </th>
                        <th
                          className="px-4 py-2 text-left font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Requests
                        </th>
                        <th
                          className="px-4 py-2 text-left font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Tokens Used
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dailyUsage.map((item) => (
                        <tr
                          key={item._id}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: 'var(--bg-card)'
                          }}
                        >
                          <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>
                            {item._id}
                          </td>
                          <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 rounded"
                                style={{
                                  background: 'var(--accent)',
                                  width: `${(item.count / Math.max(...analytics.dailyUsage.map(d => d.count))) * 100}px`
                                }}
                              ></div>
                              {item.count}
                            </div>
                          </td>
                          <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>
                            {item.tokensUsed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Users */}
            {analytics.topUsers.length > 0 && (
              <div
                className="p-6 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Top AI Users
                </h3>
                <div className="space-y-2">
                  {analytics.topUsers.map((user, index) => (
                    <div
                      key={user.userId}
                      className="p-4 rounded-lg flex items-center justify-between"
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-lg font-bold px-2 py-0.5 rounded"
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                              minWidth: '28px',
                              textAlign: 'center'
                            }}
                          >
                            {index + 1}
                          </span>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {user.userName}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {user.userEmail}
                          </p>
                        </div>
                        <div className="ml-10 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {user.count} requests • {user.tokensUsed} tokens • ${user.totalCost.toFixed(2)}
                        </div>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {user.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.topUsers.length === 0 && analytics.usageByType.length === 0 && (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>No analytics data available for this period</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
