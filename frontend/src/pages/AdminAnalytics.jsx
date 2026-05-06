import { useEffect, useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import { adminDashboardAPI } from '../api/adminAPI'
import Spinner from '../components/common/Spinner'

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
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Resource Analytics</p>
            <h2 className="font-display text-4xl font-black text-text-primary">Usage <span className="text-text-muted">Metrics</span></h2>
          </div>
          <div className="flex items-center gap-3">
             {[7, 30, 90].map(d => (
               <button 
                 key={d} 
                 onClick={() => setDays(d)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${days === d ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-border text-text-secondary hover:text-text-primary'}`}
               >
                 {d} Days
               </button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <Spinner label="Gathering Intelligence..." />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            Analysis Failed: {error}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-up">
            {/* Top Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="card p-8 border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Total Tokens</p>
                  <p className="text-4xl font-black text-text-primary">
                    {analytics.usageByType.reduce((acc, curr) => acc + curr.tokensUsed, 0).toLocaleString()}
                  </p>
               </div>
               <div className="card p-8 border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Estimated Cost</p>
                  <p className="text-4xl font-black text-emerald-500">
                    ${analytics.usageByType.reduce((acc, curr) => acc + curr.totalCost, 0).toFixed(2)}
                  </p>
               </div>
               <div className="card p-8 border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Total Requests</p>
                  <p className="text-4xl font-black text-text-primary">
                    {analytics.usageByType.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Usage By Type */}
              <div className="card p-8 border-border/50">
                <h3 className="font-display text-xl font-bold text-text-primary mb-8">Request Distribution</h3>
                <div className="space-y-6">
                  {analytics.usageByType.map(item => (
                    <div key={item._id} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text-secondary">{item._id.replace('_', ' ')}</span>
                        <span className="text-text-primary">{item.count} reqs</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500" 
                          style={{ width: `${(item.count / analytics.usageByType.reduce((acc, c) => acc + c.count, 0)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Users */}
              <div className="card p-8 border-border/50">
                <h3 className="font-display text-xl font-bold text-text-primary mb-8">Top Consumers</h3>
                <div className="space-y-4">
                  {analytics.topUsers.map((user, i) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-border/50 group hover:border-amber-500/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-[10px] font-bold text-text-secondary border border-border">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary uppercase tracking-tight">{user.userName}</p>
                          <p className="text-[9px] font-medium text-text-muted">{user.userEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-text-primary">{user.count} Reqs</p>
                        <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest">{user.tokensUsed.toLocaleString()} Tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Usage Trend */}
            <div className="card p-8 border-border/50">
               <h3 className="font-display text-xl font-bold text-text-primary mb-8">Activity Timeline</h3>
               <div className="h-64 flex items-end gap-1 px-4">
                  {analytics.dailyUsage.map((day, i) => (
                    <div key={day._id} className="flex-1 group relative">
                       <div 
                         className="w-full bg-amber-500/20 border-t border-amber-500/40 rounded-t-sm group-hover:bg-amber-500/40 transition-all"
                         style={{ height: `${(day.count / Math.max(...analytics.dailyUsage.map(d => d.count))) * 100}%` }}
                       />
                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-secondary border border-border px-3 py-2 rounded-lg z-50 whitespace-nowrap shadow-2xl">
                          <p className="text-[9px] font-black text-text-primary uppercase tracking-widest mb-1">{new Date(day._id).toLocaleDateString()}</p>
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{day.count} Requests</p>
                          <p className="text-[9px] font-medium text-text-muted uppercase tracking-widest">{day.tokensUsed.toLocaleString()} Tokens</p>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-6 px-4">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">{new Date(analytics.dailyUsage[0]?._id).toLocaleDateString()}</span>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">{new Date(analytics.dailyUsage[analytics.dailyUsage.length-1]?._id).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
