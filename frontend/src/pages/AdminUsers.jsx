import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { adminDashboardAPI } from '../api/adminAPI'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [page, search, statusFilter, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminDashboardAPI.getUsers(page, limit, search, statusFilter, roleFilter)
      setUsers(data.data)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Are you sure? This will delete the user and all their resumes.')) return

    try {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      await adminDashboardAPI.deleteUser(id)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (err) {
      toast.error(err.error || err.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const updateUserStatus = async (id, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      await adminDashboardAPI.updateUserStatus(id, newStatus)
      toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`)
      fetchUsers()
    } catch (err) {
      toast.error(err.error || err.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const updateUserRole = async (id, newRole) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      await adminDashboardAPI.updateUserRole(id, newRole)
      toast.success(`User role changed to ${newRole}`)
      fetchUsers()
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
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Access Management</p>
            <h2 className="font-display text-4xl font-black text-text-primary">System <span className="text-text-muted">Users</span></h2>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Total Database Size: </span>
            <span className="text-sm font-black text-text-primary">{total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-up">
          <div className="md:col-span-6 relative group">
               <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full h-14 bg-surface border border-border rounded-2xl px-6 pl-12 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none group-hover:bg-white/[0.05]"
                />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-opacity">🔍</span>
          </div>
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full h-14 bg-white/[0.03] border border-border rounded-2xl px-6 text-sm text-zinc-400 focus:text-text-primary focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Members</option>
              <option value="blocked">Blocked Access</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full h-14 bg-white/[0.03] border border-border rounded-2xl px-6 text-sm text-zinc-400 focus:text-text-primary focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="user">Regular Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-border/50 overflow-hidden animate-fade-up delay-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Fetching Registry...</p>
            </div>
          ) : error ? (
            <div className="m-6 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              Error fetching users: {error}
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">No users match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-border/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Identity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Permission</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Status</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Registry Date</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user._id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs border border-amber-500/20 group-hover:scale-110 transition-transform">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-text-primary">{user.name}</p>
                            <p className="text-[10px] font-medium text-text-secondary mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          disabled={actionLoading[user._id]}
                          className="bg-zinc-900/50 border border-border rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 focus:text-text-primary focus:border-amber-500/50 outline-none transition-all cursor-pointer"
                        >
                          <option value="user">USER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <select
                          value={user.status}
                          onChange={(e) => updateUserStatus(user._id, e.target.value)}
                          disabled={actionLoading[user._id]}
                          className={`bg-zinc-900/50 border rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest outline-none transition-all cursor-pointer ${user.status === 'active' ? 'border-emerald-500/20 text-emerald-500' : 'border-red-500/20 text-red-500'}`}
                        >
                          <option value="active">ACTIVE</option>
                          <option value="blocked">BLOCKED</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={actionLoading[user._id]}
                          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-text-primary transition-all disabled:opacity-50"
                        >
                          {actionLoading[user._id] ? '•••' : 'Purge'}
                        </button>
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
              className="px-6 py-3 rounded-2xl border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-text-primary hover:border-amber-500/50 hover:text-amber-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-12 h-12 rounded-2xl text-[10px] font-bold transition-all border ${page === i + 1 ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-text-secondary border-border/50 hover:text-text-primary hover:border-white/20'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-2xl border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-text-primary hover:border-amber-500/50 hover:text-amber-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
