import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { adminDashboardAPI } from '../api/adminAPI'

export default function AdminResumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchResumes()
  }, [page, search])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      const data = await adminDashboardAPI.getResumes(page, limit, search)
      setResumes(data.data)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteResume = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      await adminDashboardAPI.deleteResume(id)
      toast.success('Resume deleted successfully')
      fetchResumes()
    } catch (err) {
      toast.error(err.error || err.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Document Management</p>
            <h2 className="font-display text-4xl font-black text-white">System <span className="text-zinc-600">Artifacts</span></h2>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Resumes: </span>
            <span className="text-sm font-black text-white">{total}</span>
          </div>
        </div>

        {/* Search */}
        <div className="animate-fade-up">
           <div className="relative group max-w-2xl">
             <input
                type="text"
                placeholder="Search by resume title or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 pl-12 text-sm text-white focus:border-amber-500/50 transition-all outline-none group-hover:bg-white/[0.05]"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-opacity">📄</span>
           </div>
        </div>

        {/* Resumes Table */}
        <div className="card border-white/5 overflow-hidden animate-fade-up delay-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Analyzing Archive...</p>
            </div>
          ) : error ? (
            <div className="m-6 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              Archival Error: {error}
            </div>
          ) : resumes.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No artifacts found in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Document Title</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ownership</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Creation Date</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resumes.map((resume) => (
                    <tr key={resume._id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <p className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{resume.title}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">UUID: {resume._id}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <p className="font-bold text-[11px] text-zinc-300 uppercase tracking-wide">{resume.userId?.name || 'Deactivated User'}</p>
                            <p className="text-[10px] font-medium text-zinc-600 mt-0.5">{resume.userId?.email || 'N/A'}</p>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                          {new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => deleteResume(resume._id)}
                            disabled={actionLoading[resume._id]}
                            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {actionLoading[resume._id] ? '•••' : 'Purge'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 animate-fade-up">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:border-amber-500/50 hover:text-amber-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = page > 3 ? page - 2 + i : i + 1
                if (pageNum > totalPages || pageNum < 1) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-12 h-12 rounded-2xl text-[10px] font-bold transition-all border ${page === pageNum ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:border-white/20'}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:border-amber-500/50 hover:text-amber-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
