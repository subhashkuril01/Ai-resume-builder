// Resume Preview — renders the resume paper for all templates
export default function ResumePreview({ resume, id = 'resume-preview' }) {
  const { content = {}, template = 'modern' } = resume || {}
  const templates = { modern: ModernTemplate, classic: ClassicTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate, tech: TechTemplate, ats: ATSTemplate, academic: AcademicTemplate, functional: FunctionalTemplate, portfolio: PortfolioTemplate, minimalist: MinimalistTemplate, colorful: ColorfulTemplate, healthcare: HealthcareTemplate, finance: FinanceTemplate, sales: SalesTemplate, timeline: TimelineTemplate, dark: DarkTemplate, gradient: GradientTemplate, twocolumn: TwoColumnTemplate, retro: RetroTemplate, bold: BoldTemplate, elegant: ElegantTemplate, minimalist2: UltraMinimalTemplate, industech: InduTechTemplate, startup: StartupTemplate, artistic: ArtisticTemplate, corporate: CorporateTemplate, greenergy: GreenEnergyTemplate, purple: PurpleTemplate, datadriven: DataDrivenTemplate, wave: WaveTemplate, professional: ProfessionalTemplate, techwave: TechWaveTemplate, educational: EducationalTemplate, consultant: ConsultantTemplate, creative2: CreativePlusTemplate }
  const Template = templates[template] || ModernTemplate
  return (
    <div id={id} className="resume-paper" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Georgia, serif', fontSize: '10pt', lineHeight: 1.5, color: '#1a1a1a', background: 'white' }}>
      <Template content={content} />
    </div>
  )
}

// ── Shared helpers ──────────────────────────────────────────────────
const Tag = ({ children, color = '#1a1a1a', bg = '#f0f0f0' }) => (
  <span style={{ background: bg, color, padding: '1px 8px', borderRadius: 4, fontSize: '8pt', marginRight: 4, marginBottom: 4, display: 'inline-block' }}>{children}</span>
)

const Section = ({ title, children, accent = '#1a1a1a' }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ borderBottom: `2px solid ${accent}`, marginBottom: 8 }}>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, margin: 0, paddingBottom: 4 }}>{title}</h2>
    </div>
    {children}
  </div>
)

const name = (c) => [c?.personalInfo?.firstName, c?.personalInfo?.lastName].filter(Boolean).join(' ') || 'Your Name'
const contact = (c) => [c?.personalInfo?.email, c?.personalInfo?.phone, c?.personalInfo?.location].filter(Boolean).join(' · ')

// ── Modern Template ─────────────────────────────────────────────────
function ModernTemplate({ content: c }) {
  const accent = '#0f766e'
  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 14, marginBottom: 18 }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        <p style={{ color: '#64748b', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
        {(c?.personalInfo?.linkedin || c?.personalInfo?.github) && (
          <p style={{ color: accent, fontSize: '8.5pt', margin: '2px 0 0' }}>
            {[c?.personalInfo?.linkedin, c?.personalInfo?.github, c?.personalInfo?.website].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      {c?.personalInfo?.summary && <Section title="Summary" accent={accent}><p style={{ margin: 0, color: '#374151', lineHeight: 1.6 }}>{c.personalInfo.summary}</p></Section>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#0f172a' }}>{e.position}</strong>
                <span style={{ fontSize: '8.5pt', color: '#64748b' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9pt', margin: '1px 0 3px' }}>{e.company}{e.location ? ` · ${e.location}` : ''}</p>
              {e.description && <p style={{ margin: '2px 0', color: '#374151', fontSize: '9pt' }}>{e.description}</p>}
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', color: '#374151', fontSize: '9pt' }}>• {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10pt' }}>{e.degree}{e.field ? ` in ${e.field}` : ''}</strong>
                <span style={{ fontSize: '8.5pt', color: '#64748b' }}>{e.startDate} – {e.endDate}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '9pt', margin: '1px 0 0' }}>{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p>
            </div>
          ))}
        </Section>
      )}
      {(c?.skills?.technical?.length > 0 || c?.skills?.soft?.length > 0) && (
        <Section title="Skills" accent={accent}>
          {c?.skills?.technical?.length > 0 && <div style={{ marginBottom: 4 }}><strong style={{ fontSize: '9pt', color: '#374151' }}>Technical: </strong><span style={{ fontSize: '9pt', color: '#374151' }}>{c.skills.technical.join(', ')}</span></div>}
          {c?.skills?.soft?.length > 0 && <div style={{ marginBottom: 4 }}><strong style={{ fontSize: '9pt', color: '#374151' }}>Soft Skills: </strong><span style={{ fontSize: '9pt', color: '#374151' }}>{c.skills.soft.join(', ')}</span></div>}
          {c?.skills?.certifications?.length > 0 && <div><strong style={{ fontSize: '9pt', color: '#374151' }}>Certifications: </strong><span style={{ fontSize: '9pt', color: '#374151' }}>{c.skills.certifications.join(', ')}</span></div>}
        </Section>
      )}
      {c?.projects?.length > 0 && (
        <Section title="Projects" accent={accent}>
          {c.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '10pt' }}>{p.name}</strong>
              {p.technologies?.length > 0 && <span style={{ color: '#64748b', fontSize: '8.5pt' }}> · {p.technologies.join(', ')}</span>}
              {p.description && <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#374151' }}>{p.description}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Classic Template ────────────────────────────────────────────────
function ClassicTemplate({ content: c }) {
  const accent = '#1e3a5f'
  return (
    <div>
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: accent, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#555', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <Section title="Objective" accent={accent}><p style={{ margin: 0, fontSize: '9.5pt' }}>{c.personalInfo.summary}</p></Section>}
      {c?.experience?.length > 0 && (
        <Section title="Professional Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.position}</strong>
                <em style={{ fontSize: '9pt', color: '#666' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</em>
              </div>
              <p style={{ color: accent, fontStyle: 'italic', fontSize: '9pt', margin: '2px 0 4px' }}>{e.company}, {e.location}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 8px', fontSize: '9pt' }}>• {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>{e.degree} in {e.field}</strong><br /><span style={{ color: '#666', fontSize: '9pt' }}>{e.institution}</span></div>
              <em style={{ fontSize: '9pt', color: '#666' }}>{e.endDate}</em>
            </div>
          ))}
        </Section>
      )}
      {(c?.skills?.technical?.length > 0) && (
        <Section title="Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[...(c.skills.technical||[]), ...(c.skills.soft||[])].map((s, i) => <Tag key={i} bg="#e8edf3" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Minimal Template ────────────────────────────────────────────────
function MinimalTemplate({ content: c }) {
  return (
    <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '18pt', fontWeight: 300, letterSpacing: '-0.03em', color: '#111', margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#888', fontSize: '9pt', margin: '4px 0 0', letterSpacing: '0.02em' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 16, paddingLeft: 0, color: '#444', fontSize: '9.5pt', lineHeight: 1.7 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Experience</p>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
              <div style={{ minWidth: 80, fontSize: '8pt', color: '#999', paddingTop: 2 }}>{e.startDate}–{e.current ? 'Now' : e.endDate}</div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '10pt', color: '#111' }}>{e.position}</strong>
                <span style={{ color: '#888', fontSize: '9pt' }}> · {e.company}</span>
                {e.description && <p style={{ margin: '3px 0 0', fontSize: '9pt', color: '#555', lineHeight: 1.6 }}>{e.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {c?.education?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Education</p>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8, display: 'flex', gap: 16 }}>
              <div style={{ minWidth: 80, fontSize: '8pt', color: '#999', paddingTop: 2 }}>{e.endDate}</div>
              <div><strong style={{ fontSize: '9.5pt' }}>{e.degree}</strong><span style={{ color: '#888', fontSize: '9pt' }}> · {e.institution}</span></div>
            </div>
          ))}
        </div>
      )}
      {c?.skills?.technical?.length > 0 && (
        <div>
          <p style={{ fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Skills</p>
          <p style={{ fontSize: '9pt', color: '#555', lineHeight: 1.8 }}>{[...(c.skills.technical||[]), ...(c.skills.soft||[])].join(' · ')}</p>
        </div>
      )}
    </div>
  )
}

// ── Executive Template ──────────────────────────────────────────────
function ExecutiveTemplate({ content: c }) {
  const accent = '#8B0000'
  return (
    <div>
      <div style={{ background: '#1a1a2e', color: 'white', margin: '-20mm -20mm 20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{name(c)}</h1>
          <p style={{ color: '#aaa', fontSize: '9pt', margin: '4px 0 0' }}>{c?.personalInfo?.email} · {c?.personalInfo?.phone}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {c?.personalInfo?.location && <p style={{ color: '#ccc', fontSize: '9pt', margin: 0 }}>{c.personalInfo.location}</p>}
          {c?.personalInfo?.linkedin && <p style={{ color: '#aaa', fontSize: '8.5pt', margin: '2px 0 0' }}>{c.personalInfo.linkedin}</p>}
        </div>
      </div>
      {c?.personalInfo?.summary && <div style={{ background: '#f8f8f8', padding: '10px 14px', borderLeft: `4px solid ${accent}`, marginBottom: 16, fontSize: '9.5pt', lineHeight: 1.6, color: '#333' }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Professional Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: 3, marginBottom: 5 }}>
                <div><strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong> <span style={{ color: accent, fontSize: '9.5pt' }}>· {e.company}</span></div>
                <em style={{ fontSize: '8.5pt', color: '#777' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</em>
              </div>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 10px', fontSize: '9pt', color: '#333' }}>▸ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div><strong>{e.degree} in {e.field}</strong><br /><span style={{ color: '#666', fontSize: '9pt' }}>{e.institution}</span></div>
              <span style={{ fontSize: '9pt', color: '#777' }}>{e.endDate}</span>
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Core Competencies" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...(c.skills.technical||[]), ...(c.skills.soft||[])].map((s, i) => <Tag key={i} bg="#fff0f0" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Creative Template ───────────────────────────────────────────────
function CreativeTemplate({ content: c }) {
  const accent = '#7c3aed'
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Sidebar */}
      <div style={{ width: '35%', background: accent, color: 'white', margin: '-20mm 0 -20mm -20mm', padding: '24px 18px', flexShrink: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24pt', fontWeight: 700, marginBottom: 10 }}>
            {(c?.personalInfo?.firstName?.[0] || 'Y')}
          </div>
          <h1 style={{ fontSize: '14pt', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{name(c)}</h1>
        </div>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>Contact</p>
          {[c?.personalInfo?.email, c?.personalInfo?.phone, c?.personalInfo?.location].filter(Boolean).map((v, i) => <p key={i} style={{ fontSize: '8.5pt', margin: '3px 0', opacity: 0.9, wordBreak: 'break-all' }}>{v}</p>)}
        </div>
        {c?.skills?.technical?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>Skills</p>
            {(c.skills.technical || []).map((s, i) => <div key={i} style={{ fontSize: '8.5pt', margin: '3px 0', padding: '2px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 3, display: 'inline-block', marginRight: 4 }}>{s}</div>)}
          </div>
        )}
        {c?.education?.length > 0 && (
          <div>
            <p style={{ fontSize: '7pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>Education</p>
            {c.education.map((e, i) => <div key={i} style={{ marginBottom: 8, fontSize: '8.5pt' }}><strong>{e.degree}</strong><br /><span style={{ opacity: 0.8 }}>{e.institution}</span><br /><span style={{ opacity: 0.6 }}>{e.endDate}</span></div>)}
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, paddingTop: 4 }}>
        {c?.personalInfo?.summary && <div style={{ marginBottom: 16, color: '#555', fontSize: '9.5pt', lineHeight: 1.7, fontStyle: 'italic', borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>{c.personalInfo.summary}</div>}
        {c?.experience?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '10pt', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Experience</h2>
            {c.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: '10pt', color: '#111' }}>{e.position}</strong>
                <p style={{ color: accent, fontSize: '9pt', margin: '1px 0 2px' }}>{e.company} · {e.startDate}–{e.current ? 'Present' : e.endDate}</p>
                {e.achievements?.filter(a=>a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 8px', fontSize: '9pt', color: '#444' }}>• {a}</p>)}
              </div>
            ))}
          </div>
        )}
        {c?.projects?.length > 0 && (
          <div>
            <h2 style={{ fontSize: '10pt', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Projects</h2>
            {c.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: '10pt' }}>{p.name}</strong>
                {p.technologies?.length > 0 && <span style={{ color: '#888', fontSize: '8.5pt' }}> — {p.technologies.join(', ')}</span>}
                {p.description && <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#555' }}>{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tech Template ───────────────────────────────────────────────────
function TechTemplate({ content: c }) {
  const accent = '#00b4d8'
  return (
    <div style={{ fontFamily: 'Courier New, monospace' }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ color: accent, fontSize: '11pt' }}>{'>'}</span>
          <h1 style={{ fontSize: '18pt', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        </div>
        <p style={{ color: '#666', fontSize: '8.5pt', margin: '4px 0 0', fontFamily: 'Courier New' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, padding: '8px 12px', background: '#f5f5f5', borderLeft: `3px solid ${accent}`, fontSize: '9pt', lineHeight: 1.6 }}>{c.personalInfo.summary}</div>}
      {c?.skills?.technical?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>// TECH_STACK</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(c.skills.technical||[]).map((s, i) => <Tag key={i} bg="#e8f4f8" color={accent}>{s}</Tag>)}
          </div>
        </div>
      )}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>// WORK_EXPERIENCE</p>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12, paddingLeft: 10, borderLeft: '2px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10pt', color: '#111' }}>{e.position} @ {e.company}</strong>
                <span style={{ color: '#888', fontSize: '8.5pt' }}>{e.startDate}–{e.current ? 'Present' : e.endDate}</span>
              </div>
              {e.achievements?.filter(a=>a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0', fontSize: '9pt', color: '#444' }}>↳ {a}</p>)}
            </div>
          ))}
        </div>
      )}
      {c?.projects?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>// PROJECTS</p>
          {c.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: '2px solid #eee' }}>
              <strong style={{ fontSize: '10pt', color: '#111' }}>{p.name}</strong>
              {p.github && <a href={p.github} style={{ color: accent, fontSize: '8.5pt', marginLeft: 8 }}>↗ {p.github}</a>}
              {p.technologies?.length > 0 && <div style={{ margin: '2px 0' }}>{p.technologies.map((t, ti) => <Tag key={ti} bg="#e8f4f8" color={accent}>{t}</Tag>)}</div>}
              {p.description && <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#555' }}>{p.description}</p>}
            </div>
          ))}
        </div>
      )}
      {c?.education?.length > 0 && (
        <div>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>// EDUCATION</p>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '9.5pt' }}><strong>{e.degree}</strong> · {e.institution}</span>
              <span style={{ fontSize: '8.5pt', color: '#888' }}>{e.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ATS-Friendly Template ───────────────────────────────────────────
function ATSTemplate({ content: c }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: '14pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#333', fontSize: '10pt', margin: '3px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 12, fontSize: '10pt', lineHeight: 1.6 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 8px' }}>PROFESSIONAL EXPERIENCE</h2>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div><strong style={{ fontSize: '10pt' }}>{e.position}</strong> | <strong>{e.company}</strong></div>
              <div style={{ fontSize: '10pt', color: '#555' }}>{e.startDate} – {e.current ? 'Present' : e.endDate} | {e.location}</div>
              {e.description && <p style={{ margin: '3px 0 0', fontSize: '10pt' }}>{e.description}</p>}
              {e.achievements?.filter(a => a).map((a, ai) => <div key={ai} style={{ margin: '2px 0 0 16px', fontSize: '10pt' }}>• {a}</div>)}
            </div>
          ))}
        </div>
      )}
      {c?.education?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 8px' }}>EDUCATION</h2>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div><strong>{e.degree}</strong> in <strong>{e.field}</strong> | {e.institution}</div>
              <div style={{ fontSize: '10pt', color: '#555' }}>{e.startDate} – {e.endDate}</div>
            </div>
          ))}
        </div>
      )}
      {c?.skills?.technical?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 8px' }}>SKILLS</h2>
          <p style={{ fontSize: '10pt', margin: 0 }}>{[...(c.skills.technical||[]), ...(c.skills.soft||[])].join(', ')}</p>
        </div>
      )}
    </div>
  )
}

// ── Academic Template ───────────────────────────────────────────────
function AcademicTemplate({ content: c }) {
  const accent = '#6b4226'
  return (
    <div style={{ fontFamily: 'Garamond, serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: `1px solid #999`, paddingBottom: 10 }}>
        <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>{name(c)}</h1>
        <p style={{ fontSize: '9pt', color: '#555', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', fontStyle: 'italic', color: '#333', lineHeight: 1.7 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Academic & Professional Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10pt' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#666' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <div style={{ color: accent, fontSize: '9.5pt', fontStyle: 'italic', marginBottom: 2 }}>{e.company}{e.location ? `, ${e.location}` : ''}</div>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt' }}>• {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{e.degree}</strong> in <strong>{e.field}</strong>
              <p style={{ fontSize: '9pt', color: '#666', margin: '2px 0 0' }}>{e.institution} ({e.endDate})</p>
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Research Areas & Competencies" accent={accent}>
          <p style={{ fontSize: '9pt', margin: 0 }}>{[...(c.skills.technical||[]), ...(c.skills.soft||[])].join(', ')}</p>
        </Section>
      )}
      {c?.projects?.length > 0 && (
        <Section title="Publications & Research" accent={accent}>
          {c.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '10pt' }}>{p.name}</strong>
              {p.description && <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#444' }}>{p.description}</p>}
              {p.github && <a href={p.github} style={{ fontSize: '8.5pt', color: accent }}>{p.github}</a>}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Functional Template ─────────────────────────────────────────────
function FunctionalTemplate({ content: c }) {
  const accent = '#c7254e'
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: accent, margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        <p style={{ color: '#666', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, padding: '10px 12px', background: '#fef5f7', borderLeft: `4px solid ${accent}`, fontSize: '9.5pt', lineHeight: 1.7 }}>{c.personalInfo.summary}</div>}
      {(c?.skills?.technical?.length > 0 || c?.skills?.soft?.length > 0) && (
        <Section title="Core Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...(c.skills.technical||[]), ...(c.skills.soft||[])].map((s, i) => <Tag key={i} bg="#ffe8ec" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
      {c?.experience?.length > 0 && (
        <Section title="Professional History" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9pt', margin: '1px 0 3px' }}>{e.company}{e.location ? ` · ${e.location}` : ''}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>✓ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <strong>{e.degree}</strong> in {e.field} — {e.institution} ({e.endDate})
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Portfolio Template ──────────────────────────────────────────────
function PortfolioTemplate({ content: c }) {
  const accent = '#d63384'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 20px', padding: '24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
        </div>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#444' }}>{c.personalInfo.summary}</div>}
      {c?.projects?.length > 0 && (
        <Section title="Featured Projects" accent={accent}>
          {c.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
              <strong style={{ fontSize: '11pt', color: '#111' }}>{p.name}</strong>
              {p.technologies?.length > 0 && <div style={{ color: '#888', fontSize: '8.5pt', margin: '2px 0' }}>{p.technologies.join(' · ')}</div>}
              {p.description && <p style={{ margin: '3px 0 0', fontSize: '9.5pt', color: '#333', lineHeight: 1.6 }}>{p.description}</p>}
              {p.github && <a href={p.github} style={{ fontSize: '9pt', color: accent, textDecoration: 'none', marginTop: 3, display: 'block' }}>→ View Project</a>}
            </div>
          ))}
        </Section>
      )}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10pt' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9pt', margin: '1px 0 2px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#444' }}>• {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Skills & Technologies" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.technical.map((s, i) => <Tag key={i} bg="#f8e8f0" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Minimalist Monochrome Template ──────────────────────────────────
function MinimalistTemplate({ content: c }) {
  return (
    <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      <div style={{ borderTop: '3px solid #000', paddingTop: 10, marginBottom: 18 }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#000', margin: 0, letterSpacing: '0.01em' }}>{name(c)}</h1>
        <p style={{ color: '#444', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 10, color: '#000' }}>EXPERIENCE</h2>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <strong style={{ fontSize: '10pt', color: '#000' }}>{e.position}</strong>
                <span style={{ fontSize: '8.5pt', color: '#666' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ fontSize: '9pt', color: '#333', margin: 0 }}>{e.company}{e.location ? `, ${e.location}` : ''}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 12px', fontSize: '9pt', color: '#333' }}>— {a}</p>)}
            </div>
          ))}
        </div>
      )}
      {c?.education?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 10, color: '#000' }}>EDUCATION</h2>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: '10pt' }}>{e.degree}</strong>
              <p style={{ fontSize: '9pt', color: '#555', margin: '2px 0 0' }}>{e.institution} — {e.endDate}</p>
            </div>
          ))}
        </div>
      )}
      {c?.skills?.technical?.length > 0 && (
        <div>
          <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 8, color: '#000' }}>SKILLS</h2>
          <p style={{ fontSize: '9pt', color: '#333', lineHeight: 1.8, margin: 0 }}>{[...(c.skills.technical||[]), ...(c.skills.soft||[])].join(' · ')}</p>
        </div>
      )}
    </div>
  )
}

// ── Colorful/Vibrant Template ───────────────────────────────────────
function ColorfulTemplate({ content: c }) {
  const accent = '#ff6b35'
  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '28px 24px', marginBottom: 20, borderRadius: '0 0 12px 0' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 16, padding: '12px 14px', background: '#fff3e0', borderRadius: 6, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `2px dashed ${accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '8.5pt', color: '#888', fontStyle: 'italic' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 500, margin: '2px 0 4px' }}>{e.company} · {e.location}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 12px', fontSize: '9pt', color: '#333' }}>★ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, background: accent, borderRadius: '50%' }} />
                <strong style={{ fontSize: '10pt' }}>{e.degree} in {e.field}</strong>
              </div>
              <p style={{ fontSize: '9pt', color: '#666', margin: '2px 0 0 16px' }}>{e.institution} • {e.endDate}</p>
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[...(c.skills.technical||[]), ...(c.skills.soft||[])].map((s, i) => <Tag key={i} bg={accent} color="white">{s}</Tag>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Healthcare Template ────────────────────────────────────────────
function HealthcareTemplate({ content: c }) {
  const accent = '#0ea5e9'
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `3px solid ${accent}` }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: accent, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#555', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#444', paddingLeft: 10, borderLeft: `3px solid ${accent}` }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Professional Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#666' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', margin: '1px 0 3px' }}>{e.company} · {e.location}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>▸ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.certifications?.length > 0 && (
        <Section title="Licenses & Certifications" accent={accent}>
          {c.skills.certifications.map((cert, i) => <p key={i} style={{ fontSize: '9.5pt', color: '#333', margin: '3px 0' }}>✓ {cert}</p>)}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education & Training" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '10pt' }}>{e.degree}</strong>
              <p style={{ fontSize: '9pt', color: '#666', margin: '1px 0 0' }}>{e.institution} • {e.endDate}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Finance Template ───────────────────────────────────────────────
function FinanceTemplate({ content: c }) {
  const accent = '#15803d'
  return (
    <div style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <div>
          <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#000', margin: 0 }}>{name(c)}</h1>
          <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '3px 0 0' }}>Financial Professional</p>
        </div>
        <p style={{ color: '#666', fontSize: '8.5pt', margin: 0 }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#f0fdf4', padding: '10px 12px', borderRadius: 4 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Professional Background" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 500, margin: '1px 0 3px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>→ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Core Competencies" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.technical.map((s, i) => <Tag key={i} bg="#dcfce7" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <strong>{e.degree}</strong> • {e.institution} ({e.endDate})
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Sales & Business Template ────────────────────────────────────────
function SalesTemplate({ content: c }) {
  const accent = '#f59e0b'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 18px -20mm', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: 0, textAlign: 'right' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', paddingLeft: 10, borderLeft: `4px solid ${accent}` }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Sales & Business Achievement" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888', fontWeight: 600 }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 12px', fontSize: '9.5pt', color: '#333', fontWeight: 500 }}>⬆ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Key Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...(c.skills.technical||[]), ...(c.skills.soft||[])].map((s, i) => <Tag key={i} bg="#fef3c7" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: '10pt' }}>{e.degree}</strong>
              <p style={{ fontSize: '9pt', color: '#666', margin: '1px 0 0' }}>{e.institution} • {e.endDate}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Timeline Template ───────────────────────────────────────────────
function TimelineTemplate({ content: c }) {
  const accent = '#8b5cf6'
  return (
    <div>
      <div style={{ marginBottom: 18, borderLeft: `4px solid ${accent}`, paddingLeft: 14 }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#111', margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#666', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Career Timeline</h2>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14, position: 'relative', paddingLeft: 20, borderLeft: `2px solid ${accent}` }}>
              <div style={{ position: 'absolute', left: '-9px', top: 0, width: 14, height: 14, background: accent, borderRadius: '50%', border: '2px solid white' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 500, margin: '1px 0 3px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 0', fontSize: '9pt', color: '#333' }}>• {a}</p>)}
            </div>
          ))}
        </div>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{e.degree}</strong> in {e.field}
              <p style={{ fontSize: '9pt', color: '#666', margin: '1px 0 0' }}>{e.institution} • {e.endDate}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Dark Mode Template ──────────────────────────────────────────────
function DarkTemplate({ content: c }) {
  const accent = '#60a5fa'
  return (
    <div style={{ background: '#1f2937', color: '#e5e7eb', padding: '24px', margin: '-20mm -20mm -20mm -20mm', minHeight: '297mm' }}>
      <div style={{ marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#fff', margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#9ca3af', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#d1d5db' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10.5pt', color: '#fff' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', margin: '1px 0 3px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#d1d5db' }}>▸ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.technical.map((s, i) => <span key={i} style={{ background: '#111827', color: accent, padding: '2px 8px', borderRadius: 4, fontSize: '8.5pt', border: `1px solid ${accent}` }}>{s}</span>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Gradient Template ───────────────────────────────────────────────
function GradientTemplate({ content: c }) {
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', margin: '-20mm -20mm 20px -20mm', padding: '28px 24px', borderRadius: '0 0 12px 0' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent="#6366f1">
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '9.5pt', fontWeight: 600, margin: '1px 0 3px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>✓ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Skills" accent="#6366f1">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.technical.map((s, i) => <span key={i} style={{ background: 'linear-gradient(90deg, #e0e7ff, #f3e8ff)', color: '#6366f1', padding: '4px 10px', borderRadius: 4, fontSize: '8.5pt', fontWeight: 600 }}>{s}</span>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Two-Column Template ────────────────────────────────────────────
function TwoColumnTemplate({ content: c }) {
  const accent = '#059669'
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: '40%', background: '#f0fdf4', padding: '20px 16px', margin: '-20mm 0 -20mm -20mm' }}>
        <h2 style={{ fontSize: '9pt', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Quick Facts</h2>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: '7pt', fontWeight: 700, color: '#666', margin: '0 0 4px' }}>Email</p>
          <p style={{ fontSize: '9pt', color: '#333', margin: 0, wordBreak: 'break-all' }}>{c?.personalInfo?.email}</p>
        </div>
        {c?.personalInfo?.phone && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: '7pt', fontWeight: 700, color: '#666', margin: '0 0 4px' }}>Phone</p>
            <p style={{ fontSize: '9pt', color: '#333', margin: 0 }}>{c.personalInfo.phone}</p>
          </div>
        )}
        {c?.personalInfo?.location && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: '7pt', fontWeight: 700, color: '#666', margin: '0 0 4px' }}>Location</p>
            <p style={{ fontSize: '9pt', color: '#333', margin: 0 }}>{c.personalInfo.location}</p>
          </div>
        )}
        {c?.skills?.technical?.length > 0 && (
          <div>
            <p style={{ fontSize: '7pt', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Skills</p>
            {c.skills.technical.map((s, i) => <div key={i} style={{ fontSize: '8.5pt', color: '#333', margin: '3px 0', padding: '3px 6px', background: '#dcfce7', borderRadius: 2 }}>{s}</div>)}
          </div>
        )}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <h1 style={{ fontSize: '18pt', fontWeight: 700, color: '#111', margin: 0 }}>{name(c)}</h1>
        {c?.personalInfo?.summary && <p style={{ fontSize: '9pt', color: '#666', margin: '4px 0 14px' }}>{c.personalInfo.summary}</p>}
        {c?.experience?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '10pt', fontWeight: 700, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: 8 }}>Experience</h2>
            {c.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '9.5pt' }}>{e.position}</strong>
                  <span style={{ fontSize: '8.5pt', color: '#666' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
                </div>
                <p style={{ color: accent, fontSize: '8.5pt', fontWeight: 600, margin: '1px 0 2px' }}>{e.company}</p>
                {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 8px', fontSize: '8.5pt', color: '#333' }}>• {a}</p>)}
              </div>
            ))}
          </div>
        )}
        {c?.education?.length > 0 && (
          <Section title="Education" accent={accent}>
            {c.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <strong style={{ fontSize: '9pt' }}>{e.degree}</strong>
                <p style={{ fontSize: '8.5pt', color: '#666', margin: '1px 0 0' }}>{e.institution} • {e.endDate}</p>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

// ── Retro/Vintage Template ──────────────────────────────────────────
function RetroTemplate({ content: c }) {
  const accent = '#dc2626'
  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fef3c7', margin: '-20mm -20mm -20mm -20mm', padding: '24px 24px', minHeight: '297mm' }}>
      <div style={{ borderTop: `6px dashed ${accent}`, borderBottom: `3px double ${accent}`, padding: '12px 0', marginBottom: 16, textAlign: 'center' }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 700, color: accent, margin: 0, fontStyle: 'italic', letterSpacing: '0.02em' }}>{name(c)}</h1>
        <p style={{ fontSize: '8pt', color: '#333', margin: '4px 0 0', letterSpacing: '0.05em' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.8, color: '#333', fontStyle: 'italic' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 16, borderLeft: `4px solid ${accent}`, paddingLeft: 10 }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 700, color: accent, margin: '0 0 8px', textTransform: 'uppercase' }}>⌚ Career</h2>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#666' }}>[{e.startDate}–{e.current ? 'Now' : e.endDate}]</span>
              </div>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '1px 0 2px' }}>{e.company}</p>
            </div>
          ))}
        </div>
      )}
      {c?.skills?.technical?.length > 0 && (
        <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 10 }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 700, color: accent, margin: '0 0 6px', textTransform: 'uppercase' }}>★ Skills</h2>
          <p style={{ fontSize: '9pt', color: '#333', margin: 0, lineHeight: 1.7 }}>{c.skills.technical.join(' • ')}</p>
        </div>
      )}
    </div>
  )
}

// ── Bold Header Template ────────────────────────────────────────────
function BoldTemplate({ content: c }) {
  const accent = '#ea580c'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '36px 24px', marginBottom: 20 }}>
        <h1 style={{ fontSize: '28pt', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '8px 0 0', fontWeight: 500 }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#fff3e0', padding: '10px 12px', borderRadius: 4 }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 600, margin: '1px 0 3px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>• {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.technical.map((s, i) => <Tag key={i} bg="#ffe0cc" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Elegant Template ────────────────────────────────────────────────
function ElegantTemplate({ content: c }) {
  const accent = '#b91c8c'
  return (
    <div style={{ fontFamily: 'Palatino, Georgia, serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${accent}` }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 600, color: accent, margin: 0, letterSpacing: '0.03em' }}>{name(c)}</h1>
        <p style={{ color: '#666', fontSize: '9pt', margin: '6px 0 0', letterSpacing: '0.05em' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 16, fontSize: '9.5pt', lineHeight: 1.8, color: '#333', textAlign: 'justify' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Professional Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <em style={{ fontSize: '8.5pt', color: '#777' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</em>
              </div>
              <em style={{ color: accent, fontSize: '9.5pt', display: 'block', margin: '2px 0 4px' }}>{e.company}</em>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 16px', fontSize: '9pt', color: '#333' }}>» {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{e.degree}</strong> in <em>{e.field}</em>
              <p style={{ fontSize: '9pt', color: '#666', margin: '1px 0 0' }}>{e.institution} — {e.endDate}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Ultra Minimal Template ─────────────────────────────────────────
function UltraMinimalTemplate({ content: c }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.01em' }}>
      <h1 style={{ fontSize: '16pt', fontWeight: 400, color: '#000', margin: 0, letterSpacing: '0.03em' }}>{name(c)}</h1>
      <p style={{ color: '#555', fontSize: '9pt', margin: '3px 0 16px' }}>{contact(c)}</p>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000', marginBottom: 8 }}>Experience</p>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
                <span style={{ fontSize: '9pt', fontWeight: 600, color: '#000' }}>{e.position}</span>
                <span style={{ fontSize: '8pt', color: '#777' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <span style={{ fontSize: '9pt', color: '#555' }}>{e.company}</span>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 0', fontSize: '8.5pt', color: '#333' }}>{a}</p>)}
            </div>
          ))}
        </div>
      )}
      {c?.education?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000', marginBottom: 8 }}>Education</p>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: '9pt' }}><strong>{e.degree}</strong> · {e.institution}</div>
              <div style={{ fontSize: '8pt', color: '#777' }}>{e.endDate}</div>
            </div>
          ))}
        </div>
      )}
      {c?.skills?.technical?.length > 0 && (
        <div>
          <p style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000', marginBottom: 6 }}>Skills</p>
          <p style={{ fontSize: '9pt', color: '#333', margin: 0, lineHeight: 1.6 }}>{c.skills.technical.join(' · ')}</p>
        </div>
      )}
    </div>
  )
}

// ── InduTech Template ───────────────────────────────────────────────
function InduTechTemplate({ content: c }) {
  const accent = '#1e40af'
  return (
    <div style={{ fontFamily: 'Courier New, monospace', background: '#f8fafc' }}>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 18px -20mm', padding: '24px 24px', borderRight: `6px solid #0284c7` }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>{name(c)}</h1>
        <p style={{ color: '#dbeafe', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, padding: '10px 12px', background: '#e0f2fe', borderLeft: `4px solid ${accent}`, fontSize: '9pt', lineHeight: 1.6 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>[WORK_HISTORY]</p>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '9.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '8pt', color: '#888', fontStyle: 'italic' }}>{e.startDate}—{e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '1px 0 3px' }}>@ {e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '8.5pt', color: '#334155' }}>→ {a}</p>)}
            </div>
          ))}
        </div>
      )}
      {c?.skills?.technical?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>[CORE_TECH]</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {c.skills.technical.map((s, i) => <span key={i} style={{ background: accent, color: 'white', padding: '2px 8px', borderRadius: 2, fontSize: '8pt' }}>{s}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Startup Template ────────────────────────────────────────────────
function StartupTemplate({ content: c }) {
  const accent = '#ec4899'
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '32px 24px', clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)', paddingBottom: 40 }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '6px 0 0', fontWeight: 500 }}>{contact(c)}</p>
      </div>
      <div style={{ background: 'white', margin: '0 -20mm -20mm -20mm', padding: '20px 24px 24px', minHeight: '180mm' }}>
        {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#fce7f3', padding: '10px 12px', borderRadius: 6 }}>{c.personalInfo.summary}</p>}
        {c?.experience?.length > 0 && (
          <Section title="Experience" accent={accent}>
            {c.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                  <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
                </div>
                <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
                {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 12px', fontSize: '9pt', color: '#333' }}>✦ {a}</p>)}
              </div>
            ))}
          </Section>
        )}
        {c?.skills?.technical?.length > 0 && (
          <Section title="Core Skills" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.skills.technical.map((s, i) => <Tag key={i} bg="#fce7f3" color={accent}>{s}</Tag>)}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

// ── Artistic Template ───────────────────────────────────────────────
function ArtisticTemplate({ content: c }) {
  const accent = '#d97706'
  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '28px 24px', marginBottom: 20, borderRadius: '0 0 20px 0' }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.8, color: '#333', fontStyle: 'italic' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company} • {e.startDate}–{e.current ? 'Now' : e.endDate}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '2px 0 0 12px', fontSize: '9pt', color: '#333' }}>◆ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Corporate Blue Template ─────────────────────────────────────────
function CorporateTemplate({ content: c }) {
  const accent = '#1e40af'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 18px -20mm', padding: '24px 24px' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', paddingLeft: 10, borderLeft: `4px solid ${accent}` }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Professional Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10.5pt' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#666' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 500, margin: '1px 0 3px' }}>{e.company}</p>
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Core Competencies" accent={accent}>
          <p style={{ fontSize: '9pt', margin: 0 }}>{c.skills.technical.join(', ')}</p>
        </Section>
      )}
    </div>
  )
}

// ── Green Energy Template ───────────────────────────────────────────
function GreenEnergyTemplate({ content: c }) {
  const accent = '#10b981'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '28px 24px', marginBottom: 18 }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>✓ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Purple Premium Template ─────────────────────────────────────────
function PurpleTemplate({ content: c }) {
  const accent = '#a855f7'
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #d946ef 100%)`, color: 'white', margin: '-20mm -20mm 18px -20mm', padding: '28px 24px' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '1px 0 3px' }}>{e.company}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Data-Driven Template ────────────────────────────────────────────
function DataDrivenTemplate({ content: c }) {
  const accent = '#3b82f6'
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: `4px solid ${accent}`, paddingBottom: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: '18pt', fontWeight: 700, color: accent, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#666', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#eff6ff', padding: '10px 12px', borderRadius: 4 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10pt' }}>{e.position}</strong>
                <span style={{ fontSize: '8.5pt', color: '#666' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <span style={{ color: accent, fontSize: '9pt', fontWeight: 600 }}>{e.company}</span>
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {c.skills.technical.map((s, i) => <span key={i} style={{ background: '#dbeafe', color: accent, padding: '2px 8px', borderRadius: 3, fontSize: '8pt' }}>{s}</span>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Creative Wave Template ──────────────────────────────────────────
function WaveTemplate({ content: c }) {
  const accent = '#06b6d4'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '28px 24px', marginBottom: 18, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 92%)' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px dashed ${accent}` }}>
              <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Professional Pro Template ───────────────────────────────────────
function ProfessionalTemplate({ content: c }) {
  const accent = '#6b7280'
  return (
    <div>
      <div style={{ margin: '-20mm -20mm 18px -20mm', padding: '24px 24px', background: '#f3f4f6', borderBottom: `3px solid ${accent}` }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#111', margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#666', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333' }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#888' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 500, margin: '2px 0 0' }}>{e.company}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Tech Wave Template ──────────────────────────────────────────────
function TechWaveTemplate({ content: c }) {
  const accent = '#0891b2'
  return (
    <div style={{ fontFamily: 'Courier New, monospace' }}>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 18px -20mm', padding: '24px 24px' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#ecf0f1', padding: '10px 12px', borderRadius: 3, fontFamily: 'Courier New' }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ color: accent, fontSize: '8pt', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>// EXPERIENCE</p>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${accent}` }}>
              <strong style={{ fontSize: '9.5pt' }}>{e.position} @ {e.company}</strong>
              <p style={{ fontSize: '8.5pt', color: '#666', margin: '2px 0 0' }}>{e.startDate} – {e.current ? 'Now' : e.endDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Educational Template ───────────────────────────────────────────
function EducationalTemplate({ content: c }) {
  const accent = '#7c3aed'
  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      <div style={{ borderLeft: `6px solid ${accent}`, paddingLeft: 14, marginBottom: 16 }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: accent, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: '#666', fontSize: '9pt', margin: '4px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.8, color: '#333', fontStyle: 'italic' }}>{c.personalInfo.summary}</p>}
      {c?.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.degree}</strong>
              <p style={{ color: accent, fontSize: '9pt', fontWeight: 600, margin: '2px 0 0' }}>{e.institution}</p>
              <p style={{ fontSize: '9pt', color: '#666', margin: '1px 0 0' }}>{e.field} • {e.endDate}</p>
            </div>
          ))}
        </Section>
      )}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '9.5pt' }}>{e.position}</strong>
              <p style={{ color: '#666', fontSize: '8.5pt', margin: '1px 0 0' }}>{e.company}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ── Consultant Template ─────────────────────────────────────────────
function ConsultantTemplate({ content: c }) {
  const accent = '#0d9488'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 18px -20mm', padding: '28px 24px' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9pt', margin: '6px 0 0', fontWeight: 500 }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <div style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#d1fae5', padding: '10px 12px', borderRadius: 4 }}>{c.personalInfo.summary}</div>}
      {c?.experience?.length > 0 && (
        <Section title="Consulting Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
                <span style={{ fontSize: '9pt', color: '#666' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>⚡ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.skills?.technical?.length > 0 && (
        <Section title="Core Expertise" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.technical.map((s, i) => <Tag key={i} bg="#ccfbf1" color={accent}>{s}</Tag>)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Creative Plus Template ──────────────────────────────────────────
function CreativePlusTemplate({ content: c }) {
  const accent = '#f43f5e'
  return (
    <div>
      <div style={{ background: accent, color: 'white', margin: '-20mm -20mm 0 -20mm', padding: '32px 24px', marginBottom: 20, borderRadius: '0 0 30px 0' }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>{name(c)}</h1>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '9pt', margin: '6px 0 0' }}>{contact(c)}</p>
      </div>
      {c?.personalInfo?.summary && <p style={{ marginBottom: 14, fontSize: '9.5pt', lineHeight: 1.7, color: '#333', background: '#ffe4e6', padding: '10px 12px', borderRadius: 6 }}>{c.personalInfo.summary}</p>}
      {c?.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `2px dashed ${accent}` }}>
              <strong style={{ fontSize: '10.5pt', color: '#111' }}>{e.position}</strong>
              <p style={{ color: accent, fontSize: '9.5pt', fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
              {e.achievements?.filter(a => a).map((a, ai) => <p key={ai} style={{ margin: '1px 0 0 12px', fontSize: '9pt', color: '#333' }}>✨ {a}</p>)}
            </div>
          ))}
        </Section>
      )}
      {c?.projects?.length > 0 && (
        <Section title="Projects" accent={accent}>
          {c.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '10pt' }}>{p.name}</strong>
              {p.description && <p style={{ fontSize: '8.5pt', color: '#555', margin: '2px 0 0' }}>{p.description}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}
