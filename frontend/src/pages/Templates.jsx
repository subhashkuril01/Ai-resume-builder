import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import toast from 'react-hot-toast'
import { useState, useMemo } from 'react'
import { TEMPLATE_CATALOG } from '../constants/templateCatalog'

const ITEMS_PER_PAGE = 12
const CATEGORIES = ['All', 'Professional', 'Modern', 'Minimal', 'Creative', 'Executive', 'Tech']

export default function Templates() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return TEMPLATE_CATALOG
    return TEMPLATE_CATALOG.filter(t => t.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase()))
  }, [activeCategory])

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedTemplates = filteredTemplates.slice(startIdx, endIdx)

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
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="animate-fade-up mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Curated Library</p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight leading-[1] max-w-xl">
              Architect your <br/> <span className="text-amber-500">Professional</span> Identity.
            </h1>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-6">
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-amber-500 text-black glow-orange shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">
              {filteredTemplates.length} DESIGNS AVAILABLE • PAGE {currentPage} OF {totalPages || 1}
            </p>
          </div>
        </div>

        {/* Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="py-40 text-center animate-fade-up">
            <p className="text-zinc-600 font-display text-xl">No templates found in this category.</p>
            <button onClick={() => setActiveCategory('All')} className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-4 hover:underline">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {paginatedTemplates.map((t, i) => (
              <div key={t.id} className="card group overflow-hidden animate-fade-up bg-white/[0.02] border-white/5"
                style={{ animationDelay: `${i * 0.05}s` }}>
                
                {/* Preview area */}
                <div className="relative overflow-hidden aspect-[4/5] bg-zinc-900/50">
                  <div className="absolute inset-0 flex items-start justify-center pt-10 scale-90 origin-top transition-transform duration-700 group-hover:scale-95 group-hover:translate-y-2">
                    <div className="w-[85%] bg-white rounded-t-lg p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ minHeight: '150%' }}>
                      <div className="h-1.5 rounded-full mb-6" style={{ background: t.color }} />
                      <div className="h-6 bg-zinc-100 w-2/3 rounded-md mb-3" />
                      <div className="h-3 bg-zinc-50 w-full rounded-md mb-12" />
                      
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                          <div key={j} className="flex gap-3">
                            <div className="h-2 rounded-md w-full" style={{ background: j % 3 === 0 ? t.color : '#f8f9fa', opacity: j % 3 === 0 ? 0.4 : 1 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center translate-y-4 group-hover:translate-y-0">
                    <h4 className="text-white font-display font-bold text-xl mb-3 tracking-tight">{t.label}</h4>
                    <p className="text-zinc-400 text-xs mb-8 line-clamp-3 leading-relaxed">{t.desc}</p>
                    <button onClick={() => handleUseTemplate(t.id)} 
                      className="btn-primary w-full h-12 glow-orange"
                      disabled={creating === t.id}>
                      {creating === t.id ? 'INITIALIZING...' : 'USE TEMPLATE'}
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-6 space-y-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-text-primary uppercase tracking-widest">{t.label}</h3>
                    <div className="w-2.5 h-2.5 rounded-full glow-orange" style={{ background: t.color }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-20">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border ${currentPage === 1 ? 'border-white/5 text-zinc-800 cursor-not-allowed' : 'border-border text-text-primary hover:border-amber-500/50 hover:text-amber-500 hover:bg-white/5'}`}
            >
              ←
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-2xl text-[10px] font-bold transition-all ${currentPage === page ? 'bg-amber-500 text-black glow-orange' : 'bg-white/[0.02] text-zinc-600 hover:text-white border border-white/5'}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border ${currentPage === totalPages ? 'border-white/5 text-zinc-800 cursor-not-allowed' : 'border-border text-text-primary hover:border-amber-500/50 hover:text-amber-500 hover:bg-white/5'}`}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
