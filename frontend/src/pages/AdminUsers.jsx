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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          User Management
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm py-2">
            Total: {total} users
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-100 text-red-700">
            Error: {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)' }}>No users found</p>
          </div>
        ) : (
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
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
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Email
                    </th>
                    <th
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Role
                    </th>
                    <th
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Joined
                    </th>
                    <th
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-card)'
                      }}
                    >
                      <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>
                        {user.name}
                      </td>
                      <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {user.email}
                      </td>
                      <td className="px-6 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          disabled={actionLoading[user._id]}
                          className="px-2 py-1 rounded text-xs border"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <select
                          value={user.status}
                          onChange={(e) => updateUserStatus(user._id, e.target.value)}
                          disabled={actionLoading[user._id]}
                          className="px-2 py-1 rounded text-xs border"
                          style={{
                            borderColor: 'var(--border)',
                            background: user.status === 'active' ? '#10B98120' : '#EF444420',
                            color: user.status === 'active' ? '#10B981' : '#EF4444'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </td>
                      <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={actionLoading[user._id]}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          {actionLoading[user._id] ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-2 rounded-lg border ${
                  page === i + 1 ? 'bg-accent text-white' : ''
                }`}
                style={
                  page === i + 1
                    ? { background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                    : {
                        borderColor: 'var(--border)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)'
                      }
                }
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
