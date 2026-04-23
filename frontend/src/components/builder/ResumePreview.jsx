// Resume Preview — renders the resume paper for all templates
export default function ResumePreview({ resume, id = 'resume-preview' }) {
  const { content = {}, template = 'modern' } = resume || {}
  const templates = { modern: ModernTemplate, classic: ClassicTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate, tech: TechTemplate }
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
