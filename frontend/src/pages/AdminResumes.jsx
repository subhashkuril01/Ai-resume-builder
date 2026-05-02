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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Resume Management
        </h2>

        {/* Search */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search resumes by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 px-4 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          />
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm py-2">
            Total: {total} resumes
          </div>
        </div>

        {/* Resumes Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading resumes...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-100 text-red-700">
            Error: {error}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)' }}>No resumes found</p>
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
                      Title
                    </th>
                    <th
                      className="px-6 py-3 text-left font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      User
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
                      Created
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
                  {resumes.map((resume) => (
                    <tr
                      key={resume._id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-card)'
                      }}
                    >
                      <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>
                        <div>
                          <p className="font-medium">{resume.title}</p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            ID: {resume._id.substring(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>
                        {resume.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {resume.userId?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => deleteResume(resume._id)}
                          disabled={actionLoading[resume._id]}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          {actionLoading[resume._id] ? '...' : 'Delete'}
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
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = page > 3 ? page - 2 + i : i + 1
              if (pageNum > totalPages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg border ${
                    page === pageNum ? 'bg-accent text-white' : ''
                  }`}
                  style={
                    page === pageNum
                      ? { background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                      : {
                          borderColor: 'var(--border)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }
                  }
                >
                  {pageNum}
                </button>
              )
            })}
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
