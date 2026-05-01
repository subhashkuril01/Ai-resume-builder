import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import toast from 'react-hot-toast'
import { useState } from 'react'

const TEMPLATES = [
  { id: 'modern', label: 'Modern', color: '#0f766e', desc: 'Clean teal accents with strong hierarchy. Perfect for tech and startup roles.', tags: ['Tech', 'Startup', 'Design'] },
  { id: 'classic', label: 'Classic', color: '#1e3a5f', desc: 'Traditional navy layout, ideal for corporate, finance, and legal roles.', tags: ['Corporate', 'Finance', 'Legal'] },
  { id: 'minimal', label: 'Minimal', color: '#64748b', desc: 'Ultra-clean, whitespace-forward design. Lets your content speak loudly.', tags: ['Any Industry', 'Creative', 'Senior'] },
  { id: 'executive', label: 'Executive', color: '#8B0000', desc: 'Dark header, premium feel. Built for leadership and C-suite positions.', tags: ['Executive', 'Leadership', 'Management'] },
  { id: 'creative', label: 'Creative', color: '#7c3aed', desc: 'Bold sidebar layout with vibrant purple. Perfect for designers and marketers.', tags: ['Design', 'Marketing', 'Creative'] },
  { id: 'tech', label: 'Tech / Dev', color: '#00b4d8', desc: 'Monospace font, code-aesthetic layout. Built for engineers and developers.', tags: ['Engineering', 'Backend', 'Full-stack'] },
  { id: 'ats', label: 'ATS-Friendly', color: '#2d3748', desc: 'Optimized for Applicant Tracking Systems with simple formatting. Maximizes parsing accuracy.', tags: ['All Industries', 'Job Hunt', 'Simple'] },
  { id: 'academic', label: 'Academic', color: '#6b4226', desc: 'Designed for researchers and academics with sections for publications and research.', tags: ['Academic', 'Research', 'University'] },
  { id: 'functional', label: 'Functional', color: '#c7254e', desc: 'Skills-focused layout emphasizing abilities over chronological work history. Great for career changers.', tags: ['Career Change', 'Skills', 'Freelance'] },
  { id: 'portfolio', label: 'Portfolio', color: '#d63384', desc: 'Showcase your projects and portfolio with links. Perfect for designers and developers.', tags: ['Design', 'Development', 'Portfolio'] },
  { id: 'minimalist', label: 'Minimalist Monochrome', color: '#000000', desc: 'Black and white elegance. Ultra-professional with maximum readability.', tags: ['Professional', 'Formal', 'Legal'] },
  { id: 'colorful', label: 'Vibrant', color: '#ff6b35', desc: 'Playful design with bold colors and creative sections. Perfect for creative industries.', tags: ['Creative', 'Marketing', 'Design'] },
  { id: 'healthcare', label: 'Healthcare', color: '#0ea5e9', desc: 'Specialized for medical professionals with sections for licenses and certifications.', tags: ['Healthcare', 'Medical', 'Nursing'] },
  { id: 'finance', label: 'Finance', color: '#15803d', desc: 'Professional layout with emphasis on achievements and financial metrics.', tags: ['Finance', 'Banking', 'Accounting'] },
  { id: 'sales', label: 'Sales & Business', color: '#f59e0b', desc: 'Achievement-focused layout highlighting targets met and revenue impact.', tags: ['Sales', 'Business', 'Marketing'] },
  { id: 'timeline', label: 'Timeline', color: '#8b5cf6', desc: 'Chronological timeline-based layout showing career progression visually.', tags: ['Career', 'Progressive', 'Visual'] },
  { id: 'dark', label: 'Dark Mode', color: '#1f2937', desc: 'Modern dark theme with light text. Contemporary and trendy appeal.', tags: ['Modern', 'Tech', 'Trendy'] },
  { id: 'gradient', label: 'Gradient', color: '#6366f1', desc: 'Beautiful gradient backgrounds with modern styling. Visually striking design.', tags: ['Design', 'Creative', 'Modern'] },
  { id: 'twocolumn', label: 'Two-Column', color: '#059669', desc: 'Side-by-side layout with left sidebar for quick facts and right for details.', tags: ['Organized', 'Balanced', 'Clear'] },
  { id: 'retro', label: 'Retro/Vintage', color: '#dc2626', desc: 'Classic retro design with vintage typography and warm colors. Unique personality.', tags: ['Unique', 'Creative', 'Personality'] },
  { id: 'bold', label: 'Bold Header', color: '#ea580c', desc: 'Strong dominant header with impactful visual presence. Makes an impression.', tags: ['Leadership', 'Standout', 'Executive'] },
  { id: 'elegant', label: 'Elegant', color: '#b91c8c', desc: 'Sophisticated layout with elegant fonts and refined spacing. Premium feel.', tags: ['Professional', 'Luxury', 'Refined'] },
  { id: 'minimalist2', label: 'Ultra Minimal', color: '#9ca3af', desc: 'Extreme minimalism with maximum whitespace. True essence of simplicity.', tags: ['Simple', 'Clean', 'Zen'] },
  { id: 'industech', label: 'InduTech', color: '#1e40af', desc: 'Industrial design with tech elements. For engineering and technical roles.', tags: ['Engineering', 'Industrial', 'Technical'] },
  { id: 'startup', label: 'Startup', color: '#ec4899', desc: 'Trendy startup culture design with modern patterns and bold accents.', tags: ['Startup', 'Innovation', 'Trendy'] },
  { id: 'artistic', label: 'Artistic', color: '#d97706', desc: 'Creative artistic layout with unique visual elements. Perfect for creatives.', tags: ['Art', 'Creative', 'Design'] },
  { id: 'corporate', label: 'Corporate Blue', color: '#1e40af', desc: 'Professional corporate style with blue tones. Ideal for business professionals.', tags: ['Corporate', 'Business', 'Professional'] },
  { id: 'greenergy', label: 'Green Energy', color: '#10b981', desc: 'Eco-friendly theme with green accents. Perfect for sustainability roles.', tags: ['Eco', 'Sustainable', 'Green'] },
  { id: 'purple', label: 'Purple Premium', color: '#a855f7', desc: 'Luxury and premium feel with rich purple accents and sophisticated layout.', tags: ['Premium', 'Luxury', 'Professional'] },
  { id: 'datadriven', label: 'Data-Driven', color: '#3b82f6', desc: 'Analytics and metrics-focused layout. Perfect for data professionals.', tags: ['Analytics', 'Data', 'Tech'] },
  { id: 'wave', label: 'Creative Wave', color: '#06b6d4', desc: 'Dynamic wavy design elements with modern aesthetics and flow.', tags: ['Creative', 'Modern', 'Dynamic'] },
  { id: 'professional', label: 'Professional Pro', color: '#6b7280', desc: 'Advanced professional layout with premium formatting and structure.', tags: ['Professional', 'Advanced', 'Executive'] },
  { id: 'techwave', label: 'Tech Wave', color: '#0891b2', desc: 'Modern tech-forward design with wave patterns and tech aesthetics.', tags: ['Tech', 'Modern', 'Innovation'] },
  { id: 'educational', label: 'Educational', color: '#7c3aed', desc: 'Academic and educational professional layout with emphasis on learning.', tags: ['Education', 'Academic', 'Teaching'] },
  { id: 'consultant', label: 'Consultant', color: '#0d9488', desc: 'Consulting professional layout emphasizing expertise and achievements.', tags: ['Consulting', 'Professional', 'Advisory'] },
  { id: 'creative2', label: 'Creative Plus', color: '#f43f5e', desc: 'Enhanced creative design with modern elements and bold styling.', tags: ['Creative', 'Modern', 'Design'] },
]

const ITEMS_PER_PAGE = 12

export default function Templates() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(TEMPLATES.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedTemplates = TEMPLATES.slice(startIdx, endIdx)

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
            {TEMPLATES.length} professionally designed templates. Page {currentPage} of {totalPages}
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
