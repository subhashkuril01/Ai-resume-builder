import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle auth errors
api.interceptors.response.use(
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

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
}

// Resumes
export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  upload: (file) => {
    const formData = new FormData()
    formData.append('media', file)
    return api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  toggleShare: (id) => api.post(`/resumes/${id}/share`),
  getVersions: (id) => api.get(`/resumes/${id}/versions`),
  saveVersion: (id, label) => api.post(`/resumes/${id}/versions`, { label }),
  restoreVersion: (id, versionId) => api.post(`/resumes/${id}/versions/${versionId}/restore`),
}

// Analyzer
export const analyzerAPI = {
  analyzeATS: (resumeId) => api.post('/analyzer/ats', { resumeId }),
  enhance: (text, type, context) => api.post('/analyzer/enhance', { text, type, context }),
  getHistory: (resumeId) => api.get(`/analyzer/history/${resumeId}`),
}

// Job Match
export const jobMatchAPI = {
  analyze: (resumeId, jobDescription) => api.post('/job-match/analyze', { resumeId, jobDescription }),
  extractKeywords: (jobDescription) => api.post('/job-match/keywords', { jobDescription }),
}

export const resumeTestAPI = {
  getAll: () => api.get('/resume-tests'),
  getOne: (id) => api.get(`/resume-tests/${id}`),
  generate: (resumeId) => api.post('/resume-tests/generate', { resumeId }),
  start: (id) => api.post(`/resume-tests/${id}/start`),
  saveAnswer: (id, data) => api.patch(`/resume-tests/${id}/answer`, data),
  submit: (id) => api.post(`/resume-tests/${id}/submit`),
  retake: (id) => api.post(`/resume-tests/${id}/retake`),
  update: (id, data) => api.put(`/resume-tests/${id}`, data),
  delete: (id) => api.delete(`/resume-tests/${id}`),
}

// Public
export const publicAPI = {
  getResume: (slug) => api.get(`/public/resume/${slug}`),
}

export default api
