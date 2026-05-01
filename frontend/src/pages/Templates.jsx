import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { TEMPLATE_CATALOG } from '../constants/templateCatalog'

const ITEMS_PER_PAGE = 12

export default function Templates() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(TEMPLATE_CATALOG.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedTemplates = TEMPLATE_CATALOG.slice(startIdx, endIdx)

  const handleUseTemplate = async (templateId) => {
    setCreating(templateId)
    try {
      const res = await resumeAPI.create({ title: `New ${templateId} Resume`, template: templateId })
      navigate(`/builder/${res.resume._id}`)
    } catch (error) {
      toast.error(error?.error || error?.message || 'Failed to create resume')
      setCreating(null)
    }
  }

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-fade-up mb-8">
          <p className="section-title">Template Gallery</p>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Choose Your Template
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {TEMPLATE_CATALOG.length} professionally designed templates. Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedTemplates.map((t, i) => (
            <div key={t.id} className="card group overflow-hidden transition-all duration-300 hover:border-amber-500/30 animate-fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}>
              {/* Preview area */}
              <div className="relative overflow-hidden" style={{ height: 200, background: 'var(--bg-secondary)' }}>
                <div className="absolute inset-0 flex items-start justify-center pt-4 scale-75 origin-top">
                  {/* Stylized template preview card */}
                  <div style={{ width: '90%', background: 'white', borderRadius: 6, padding: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontFamily: 'serif' }}>
                    <div style={{ height: 4, background: t.color, borderRadius: 2, marginBottom: 8 }} />
                    <div style={{ height: 10, background: '#1a1a1a', width: '55%', borderRadius: 2, marginBottom: 4 }} />
                    <div style={{ height: 6, background: '#ddd', width: '70%', borderRadius: 2, marginBottom: 12 }} />
                    {[70, 85, 60, 75, 50].map((w, j) => (
                      <div key={j} style={{ height: 5, background: j % 3 === 0 ? t.color : '#eee', width: `${w}%`, borderRadius: 2, marginBottom: 5 }} />
                    ))}
                    <div style={{ marginTop: 10, height: 6, background: t.color, width: '30%', borderRadius: 2, marginBottom: 6 }} />
                    {[80, 65, 55].map((w, j) => (
                      <div key={j} style={{ height: 4, background: '#ddd', width: `${w}%`, borderRadius: 2, marginBottom: 4 }} />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <button onClick={() => handleUseTemplate(t.id)} className="btn-primary text-xs"
                    disabled={creating === t.id}>
                    {creating === t.id ? '⟳ Creating...' : '+ Use Template'}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.label}</h3>
                </div>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.tags.map(tag => <span key={tag} className="badge-muted text-xs">{tag}</span>)}
                </div>
                <button onClick={() => handleUseTemplate(t.id)}
                  className="btn-ghost w-full justify-center text-xs py-1.5"
                  disabled={creating === t.id}>
                  {creating === t.id ? 'Creating...' : 'Use This Template'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg transition-all"
            style={{
              background: currentPage === 1 ? '#e5e7eb' : 'var(--accent)',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10 rounded-lg transition-all font-semibold"
                style={{
                  background: currentPage === page ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: currentPage === page ? 'white' : 'var(--text-primary)',
                  border: currentPage === page ? 'none' : `1px solid var(--border-color)`
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg transition-all"
            style={{
              background: currentPage === totalPages ? '#e5e7eb' : 'var(--accent)',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
