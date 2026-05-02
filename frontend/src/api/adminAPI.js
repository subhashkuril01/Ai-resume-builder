import axios from 'axios'

const adminAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — attach JWT
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle auth errors
adminAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || { error: 'Network error. Please try again.' })
  }
)

export const adminDashboardAPI = {
  getDashboard: () => adminAPI.get('/admin/dashboard'),
  getUsers: (page = 1, limit = 10, search = '', status = '', role = '') =>
    adminAPI.get('/admin/users', { params: { page, limit, search, status, role } }),
  deleteUser: (id) => adminAPI.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status) => adminAPI.patch(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => adminAPI.patch(`/admin/users/${id}/role`, { role }),
  
  getResumes: (page = 1, limit = 10, search = '') =>
    adminAPI.get('/admin/resumes', { params: { page, limit, search } }),
  deleteResume: (id) => adminAPI.delete(`/admin/resumes/${id}`),
  
  getAnalytics: (days = 30) => adminAPI.get('/admin/analytics', { params: { days } }),
  logUsage: (data) => adminAPI.post('/admin/usage-log', data),
}
