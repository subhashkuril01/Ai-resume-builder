import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resumeAPI } from '../api'
import ResumePreview from '../components/builder/ResumePreview'
import { TEMPLATE_CATALOG } from '../constants/templateCatalog'

const ITEMS_PER_PAGE = 12
const CATEGORIES = ['All', 'Professional', 'Modern', 'Minimal', 'Creative', 'Executive', 'Tech']
const PREVIEW_WIDTH = 794

const TEMPLATE_PREVIEW_CONTENT = {
  modern: {
    personalInfo: {
      firstName: 'Ava',
      lastName: 'Sharma',
      email: 'ava.sharma@email.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      linkedin: 'linkedin.com/in/avasharma',
      github: 'github.com/avasharma',
      website: 'avasharma.dev',
      summary: 'Product-minded frontend engineer with 6+ years of experience designing responsive interfaces, scaling design systems, and shipping polished user journeys for SaaS teams.',
    },
    experience: [
      {
        position: 'Senior UI Engineer',
        company: 'Northstar Labs',
        location: 'Remote',
        startDate: '2022',
        endDate: '',
        current: true,
        description: 'Led the resume builder experience across onboarding, live preview, and export workflows.',
        achievements: [
          'Improved template conversion by 28% through guided preview states and sharper visual hierarchy.',
          'Built a reusable component system used across 4 product surfaces.',
        ],
      },
      {
        position: 'Product Designer',
        company: 'Studio Orbit',
        location: 'Mumbai',
        startDate: '2019',
        endDate: '2022',
        current: false,
        description: 'Partnered with founders to turn early product ideas into production-ready interfaces.',
        achievements: [
          'Created high-fidelity design systems for startup and enterprise clients.',
        ],
      },
    ],
    education: [
      {
        degree: 'B.Des',
        field: 'Interaction Design',
        institution: 'National Institute of Design',
        startDate: '2015',
        endDate: '2019',
        gpa: '3.8/4.0',
      },
    ],
    skills: {
      technical: ['React', 'TypeScript', 'Figma', 'Tailwind', 'Design Systems'],
      soft: ['Storytelling', 'Mentoring', 'Stakeholder Alignment'],
      certifications: ['Google UX Design'],
    },
    projects: [
      {
        name: 'Template Intelligence',
        technologies: ['React', 'Node.js', 'OpenAI'],
        description: 'Built a recommendation engine that matches resume templates to job requirements and seniority.',
      },
    ],
  },
  classic: {
    personalInfo: {
      firstName: 'Daniel',
      lastName: 'Reed',
      email: 'daniel.reed@email.com',
      phone: '(555) 241-1902',
      location: 'Chicago, IL',
      summary: 'Operations and finance professional with a decade of experience in audit readiness, process governance, and cross-functional reporting for large enterprises.',
    },
    experience: [
      {
        position: 'Finance Manager',
        company: 'Harrison & Co.',
        location: 'Chicago, IL',
        startDate: '2021',
        endDate: '',
        current: true,
        achievements: [
          'Directed quarterly planning across a $12M operating budget.',
          'Reduced reporting cycle time by 32% by standardizing internal controls.',
        ],
      },
      {
        position: 'Senior Analyst',
        company: 'Granite Advisory',
        location: 'Chicago, IL',
        startDate: '2017',
        endDate: '2021',
        current: false,
        achievements: [
          'Prepared executive board reports and audit packs for public-sector clients.',
        ],
      },
    ],
    education: [
      {
        degree: 'MBA',
        field: 'Finance',
        institution: 'Northwestern University',
        endDate: '2017',
      },
      {
        degree: 'BBA',
        field: 'Accounting',
        institution: 'University of Illinois',
        endDate: '2013',
      },
    ],
    skills: {
      technical: ['Forecasting', 'FP&A', 'SAP', 'Internal Controls'],
      soft: ['Leadership', 'Communication', 'Vendor Management'],
    },
  },
  minimal: {
    personalInfo: {
      firstName: 'Mila',
      lastName: 'Chen',
      email: 'mila.chen@email.com',
      phone: '+1 415 555 0187',
      location: 'San Francisco, CA',
      summary: 'Brand strategist focused on thoughtful storytelling, editorial clarity, and understated visual systems that elevate premium consumer products.',
    },
    experience: [
      {
        position: 'Brand Strategist',
        company: 'Quiet Form',
        startDate: '2023',
        endDate: '',
        current: true,
        description: 'Develops positioning frameworks and launch narratives for modern lifestyle brands.',
      },
      {
        position: 'Content Lead',
        company: 'Field Notes Studio',
        startDate: '2020',
        endDate: '2023',
        current: false,
        description: 'Shaped editorial systems and campaign messaging across print and digital touchpoints.',
      },
    ],
    education: [
      {
        degree: 'BA',
        field: 'Journalism',
        institution: 'UC Berkeley',
        endDate: '2020',
      },
    ],
    skills: {
      technical: ['Brand Positioning', 'Editorial Planning', 'Research', 'Notion'],
      soft: ['Facilitation', 'Narrative Design', 'Collaboration'],
    },
  },
  executive: {
    personalInfo: {
      firstName: 'Marcus',
      lastName: 'Ellison',
      email: 'marcus.ellison@email.com',
      phone: '+1 212 555 0114',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/marcusellison',
      summary: 'Chief operating executive with 15+ years leading growth, transformation, and multi-market expansion for global professional services and technology organizations.',
    },
    experience: [
      {
        position: 'Chief Operating Officer',
        company: 'Summit Ridge Partners',
        startDate: '2020',
        endDate: '',
        current: true,
        achievements: [
          'Scaled revenue from $48M to $110M while expanding into three regional markets.',
          'Built an executive operating cadence spanning talent, delivery, and board reporting.',
        ],
      },
      {
        position: 'Vice President, Strategy',
        company: 'Aurelian Group',
        startDate: '2016',
        endDate: '2020',
        current: false,
        achievements: [
          'Led enterprise transformation initiatives across finance, operations, and people systems.',
        ],
      },
    ],
    education: [
      {
        degree: 'MBA',
        field: 'Strategy',
        institution: 'Columbia Business School',
        endDate: '2015',
      },
    ],
    skills: {
      technical: ['P&L Ownership', 'Transformation', 'Board Communications', 'M&A Integration'],
      soft: ['Executive Presence', 'Negotiation', 'People Leadership'],
    },
  },
}

const DEFAULT_PREVIEW_CONTENT = {
  personalInfo: {
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@email.com',
    phone: '+1 555 0182',
    location: 'Remote',
    linkedin: 'linkedin.com/in/jordanlee',
    summary: 'Versatile professional with experience spanning strategy, delivery, and cross-functional execution.',
  },
  experience: [
    {
      position: 'Lead Specialist',
      company: 'Cvision Labs',
      location: 'Remote',
      startDate: '2022',
      endDate: '',
      current: true,
      description: 'Drives polished digital experiences and measurable business outcomes.',
      achievements: [
        'Launched high-impact workflows across product, operations, and customer success.',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelors',
      field: 'Business Administration',
      institution: 'State University',
      endDate: '2021',
    },
  ],
  skills: {
    technical: ['Strategy', 'Operations', 'Analytics'],
    soft: ['Leadership', 'Communication'],
  },
  projects: [
    {
      name: 'Growth Initiative',
      technologies: ['Research', 'Execution'],
      description: 'Built a repeatable operating model for a high-growth team.',
    },
  ],
}

function getPreviewContent(templateId) {
  return TEMPLATE_PREVIEW_CONTENT[templateId] || DEFAULT_PREVIEW_CONTENT
}

function TemplatePreviewSurface({ templateId, zoom = false }) {
  const content = getPreviewContent(templateId)

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-0 transition-transform duration-700 ease-out ${
        zoom ? 'scale-[0.315]' : 'scale-[0.29]'
      }`}
      style={{
        width: PREVIEW_WIDTH,
        transformOrigin: 'top center',
        marginLeft: -(PREVIEW_WIDTH / 2),
      }}
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-[18px] shadow-[0_35px_80px_rgba(15,23,42,0.35)]">
        <ResumePreview resume={{ content, template: templateId }} id={`preview-${templateId}-${zoom ? 'zoom' : 'card'}`} />
      </div>
    </div>
  )
}

function LazyTemplatePreview({ templateId, zoom = false }) {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      {isVisible ? (
        <TemplatePreviewSurface templateId={templateId} zoom={zoom} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.10] via-white/[0.03] to-transparent" />
      )}
    </div>
  )
}

function PreviewModal({ template, onClose, onUseTemplate, creating }) {
  useEffect(() => {
    if (!template) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [template, onClose])

  if (!template) return null

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md p-4 md:p-8" onClick={onClose}>
      <div
        className="mx-auto flex h-full w-full max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0d0c0a] shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hidden lg:flex lg:w-[320px] lg:flex-col lg:justify-between lg:border-r lg:border-white/5 lg:bg-white/[0.02] lg:p-8">
          <div className="space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Template Preview</p>
            <div>
              <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary">{template.label}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{template.desc}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => onUseTemplate(template.id)} className="btn-primary h-12 w-full" disabled={creating === template.id}>
              {creating === template.id ? 'INITIALIZING...' : 'USE TEMPLATE'}
            </button>
            <button onClick={onClose} className="btn-ghost h-12 w-full justify-center">
              Close Preview
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 md:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Full Resume View</p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-text-primary lg:hidden">{template.label}</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUseTemplate(template.id)}
                className="hidden h-11 min-w-[150px] items-center justify-center rounded-xl bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-widest text-black transition-all hover:brightness-110 md:inline-flex"
                disabled={creating === template.id}
              >
                {creating === template.id ? 'INITIALIZING...' : 'USE TEMPLATE'}
              </button>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-all hover:border-amber-500/30 hover:text-white"
                aria-label="Close preview"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="modal-scrollbar flex-1 overflow-y-auto bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-3 py-4 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-[920px] rounded-[28px] border border-white/5 bg-white/[0.04] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:p-6">
              <div className="overflow-auto rounded-[20px] bg-[#111111] p-3 md:p-5">
                <div className="mx-auto min-w-[794px] max-w-[794px] overflow-hidden rounded-[14px] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
                  <ResumePreview resume={{ content: getPreviewContent(template.id), template: template.id }} id={`modal-preview-${template.id}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 p-4 lg:hidden">
            <button onClick={() => onUseTemplate(template.id)} className="btn-primary h-12 w-full" disabled={creating === template.id}>
              {creating === template.id ? 'INITIALIZING...' : 'USE TEMPLATE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Templates() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return TEMPLATE_CATALOG
    return TEMPLATE_CATALOG.filter((template) =>
      template.tags.some((tag) => tag.toLowerCase() === activeCategory.toLowerCase())
    )
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
    <>
      {/* ✅ ONLY THIS LINE CHANGED — added position fixed + top/left/right */}
      <div
        className="w-full bg-primary overflow-y-auto"
        style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div className="pb-20 pt-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="animate-fade-up mb-16 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Curated Library</p>
                <h1 className="max-w-xl font-display text-5xl font-bold leading-[1] tracking-tight text-text-primary md:text-7xl">
                  Architect your <br /> <span className="text-amber-500">Professional</span> Identity.
                </h1>
              </div>

              <div className="flex flex-col items-start gap-6 lg:items-end">
                <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat)
                        setCurrentPage(1)
                      }}
                      className={`rounded-xl px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeCategory === cat
                          ? 'glow-orange bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                  {filteredTemplates.length} DESIGNS AVAILABLE • PAGE {currentPage} OF {totalPages || 1}
                </p>
              </div>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="animate-fade-up py-40 text-center">
                <p className="font-display text-xl text-zinc-600">No templates found in this category.</p>
                <button onClick={() => setActiveCategory('All')} className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-500 hover:underline">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedTemplates.map((template, index) => (
                  <article
                    key={template.id}
                    className="card group animate-fade-up overflow-hidden border-white/5 bg-white/[0.02]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(template)}
                      className="block w-full text-left"
                      aria-label={`Preview ${template.label} template`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]">
                        <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.25em] text-white/45">
                          <span>Live Preview</span>
                          <span style={{ color: template.color }}>{template.label}</span>
                        </div>

                        <div className="absolute inset-x-0 top-14 bottom-0 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
                          <div className="absolute inset-0 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:-translate-y-2">
                            <LazyTemplatePreview templateId={template.id} zoom />
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 opacity-0 transition-all duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-x-6 bottom-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md">
                            <p className="mb-3 text-xs leading-relaxed text-zinc-300">{template.desc}</p>
                            <div className="flex gap-3">
                              <span className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-white">
                                Preview
                              </span>
                              <span
                                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-widest text-black shadow-lg"
                                style={{ background: template.color }}
                              >
                                Use Template
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <div className="relative z-10 space-y-4 border-t border-white/5 p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">{template.label}</h3>
                        <div className="h-2.5 w-2.5 rounded-full glow-orange" style={{ background: template.color }} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 transition-all group-hover:border-amber-500/20 group-hover:text-amber-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-all hover:border-amber-500/25 hover:text-text-primary"
                        >
                          Preview
                        </button>
                        <button onClick={() => handleUseTemplate(template.id)} className="btn-primary h-11 flex-1 justify-center" disabled={creating === template.id}>
                          {creating === template.id ? 'INITIALIZING...' : 'USE TEMPLATE'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                    currentPage === 1
                      ? 'cursor-not-allowed border-white/5 text-zinc-800'
                      : 'border-border text-text-primary hover:border-amber-500/50 hover:bg-white/5 hover:text-amber-500'
                  }`}
                >
                  ←
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-12 w-12 rounded-2xl text-[10px] font-bold transition-all ${
                        currentPage === page
                          ? 'glow-orange bg-amber-500 text-black'
                          : 'border border-white/5 bg-white/[0.02] text-zinc-600 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                    currentPage === totalPages
                      ? 'cursor-not-allowed border-white/5 text-zinc-800'
                      : 'border-border text-text-primary hover:border-amber-500/50 hover:bg-white/5 hover:text-amber-500'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PreviewModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onUseTemplate={handleUseTemplate}
        creating={creating}
      />
    </>
  )
}