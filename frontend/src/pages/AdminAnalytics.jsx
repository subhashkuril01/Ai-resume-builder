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
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Business Intelligence</p>
            <h2 className="font-display text-4xl font-black text-white">Advanced <span className="text-zinc-600">Analytics</span></h2>
          </div>
          <div className="relative group">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="h-12 bg-white/[0.03] border border-white/10 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest text-white focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer pr-12"
            >
              <option value={7}>LAST 7 DAYS</option>
              <option value={30}>LAST 30 DAYS</option>
              <option value={90}>LAST 90 DAYS</option>
              <option value={365}>LAST YEAR</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Processing Data Stream...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            Data Retrieval Error: {error}
          </div>
        ) : !analytics ? (
          <div className="py-20 text-center">
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No data streams detected for this period.</p>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-up">
            {/* Usage by Type */}
            <div className="card p-8 border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-white">AI Distribution</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Metric: Requests</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analytics.usageByType.map((item) => (
                  <div key={item._id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-amber-500/30 transition-all">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-amber-500 transition-colors">
                      {item._id.replace('_', ' ')}
                    </p>
                    <p className="text-3xl font-black text-white mt-4">{item.count}</p>
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Tokens</span>
                          <span className="text-[10px] font-bold text-zinc-400">{item.tokensUsed.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Revenue</span>
                          <span className="text-[10px] font-bold text-amber-500">${item.totalCost.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
               {/* Daily Usage Trend */}
               <div className="xl:col-span-3 card p-8 border-white/5">
                 <h3 className="font-display text-xl font-bold text-white mb-8">Performance Trend</h3>
                 <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                          <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">Load Factor</th>
                          <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">Requests</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analytics.dailyUsage.map((item) => {
                          const maxCount = Math.max(...analytics.dailyUsage.map(d => d.count), 1);
                          const percentage = (item.count / maxCount) * 100;
                          return (
                            <tr key={item._id} className="group hover:bg-white/[0.01]">
                              <td className="py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{item._id}</td>
                              <td className="py-4 pr-10">
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 glow-orange transition-all duration-1000" style={{ width: `${percentage}%` }} />
                                </div>
                              </td>
                              <td className="py-4 text-right font-black text-white text-xs">{item.count}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                 </div>
               </div>

               {/* Top Users */}
               <div className="xl:col-span-2 card p-8 border-white/5">
                 <h3 className="font-display text-xl font-bold text-white mb-8">Power Users</h3>
                 <div className="space-y-4">
                    {analytics.topUsers.map((user, index) => (
                      <div key={user.userId} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                             {index + 1}
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-xs text-white truncate uppercase tracking-tight">{user.userName}</p>
                              <p className="text-[10px] font-bold text-zinc-600 truncate">{user.userEmail}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-amber-500 group-hover:scale-110 transition-transform">{user.count}</p>
                           <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">REQ</p>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
