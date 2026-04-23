import { useState } from 'react'
import { analyzerAPI } from '../../api'
import toast from 'react-hot-toast'

// ── Personal Info Step ──────────────────────────────────────────────
export function PersonalInfoStep({ data, onChange }) {
  const fields = [
    { key: 'firstName', label: 'First Name', placeholder: 'Jane', col: 1 },
    { key: 'lastName', label: 'Last Name', placeholder: 'Smith', col: 1 },
    { key: 'email', label: 'Email', placeholder: 'jane@example.com', type: 'email', col: 2 },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', col: 1 },
    { key: 'location', label: 'Location', placeholder: 'San Francisco, CA', col: 1 },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/jane', col: 1 },
    { key: 'github', label: 'GitHub URL', placeholder: 'github.com/jane', col: 1 },
    { key: 'website', label: 'Portfolio/Website', placeholder: 'janesmith.dev', col: 2 },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={`form-group ${f.col === 2 ? 'col-span-2' : ''}`}>
            <label className="label">{f.label}</label>
            <input type={f.type || 'text'} className="input" placeholder={f.placeholder}
              value={data?.[f.key] || ''}
              onChange={e => onChange({ ...data, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="form-group">
        <label className="label">Professional Summary</label>
        <SummaryField value={data?.summary || ''} onChange={v => onChange({ ...data, summary: v })} />
      </div>
    </div>
  )
}

function SummaryField({ value, onChange }) {
  const [enhancing, setEnhancing] = useState(false)

  const enhance = async () => {
    if (!value.trim()) return toast.error('Add some text first')
    setEnhancing(true)
    try {
      const res = await analyzerAPI.enhance(value, 'summary')
      onChange(res.enhanced)
      toast.success('Summary enhanced!')
    } catch (e) {
      toast.error(e.error || 'Enhancement failed')
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <div className="relative">
      <textarea className="textarea w-full" rows={4} placeholder="Brief overview of your professional background and career goals..."
        value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={enhance} disabled={enhancing}
        className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
        style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
        {enhancing ? '...' : '✨ AI Enhance'}
      </button>
    </div>
  )
}

// ── Education Step ──────────────────────────────────────────────────
export function EducationStep({ data = [], onChange }) {
  const addItem = () => onChange([...data, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }])
  const removeItem = (i) => onChange(data.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => {
    const updated = [...data]
    updated[i] = { ...updated[i], [field]: val }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {data.map((edu, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Education #{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--danger)' }}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'institution', label: 'Institution', placeholder: 'MIT', span: 2 },
              { key: 'degree', label: 'Degree', placeholder: 'Bachelor of Science' },
              { key: 'field', label: 'Field of Study', placeholder: 'Computer Science' },
              { key: 'startDate', label: 'Start Date', placeholder: '2018' },
              { key: 'endDate', label: 'End Date', placeholder: '2022 or Present' },
              { key: 'gpa', label: 'GPA (optional)', placeholder: '3.8/4.0' },
            ].map(f => (
              <div key={f.key} className={`form-group ${f.span === 2 ? 'col-span-2' : ''}`}>
                <label className="label">{f.label}</label>
                <input className="input" placeholder={f.placeholder}
                  value={edu[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn-ghost w-full justify-center text-xs">
        + Add Education
      </button>
    </div>
  )
}

// ── Experience Step ─────────────────────────────────────────────────
export function ExperienceStep({ data = [], onChange }) {
  const addItem = () => onChange([...data, { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [''] }])
  const removeItem = (i) => onChange(data.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => {
    const updated = [...data]
    updated[i] = { ...updated[i], [field]: val }
    onChange(updated)
  }
  const addAchievement = (i) => updateItem(i, 'achievements', [...(data[i].achievements || []), ''])
  const updateAchievement = (i, ai, val) => {
    const achs = [...(data[i].achievements || [])]
    achs[ai] = val
    updateItem(i, 'achievements', achs)
  }
  const removeAchievement = (i, ai) => updateItem(i, 'achievements', data[i].achievements.filter((_, idx) => idx !== ai))

  return (
    <div className="space-y-4">
      {data.map((exp, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Experience #{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--danger)' }}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'company', label: 'Company', placeholder: 'Google', span: 2 },
              { key: 'position', label: 'Position', placeholder: 'Software Engineer' },
              { key: 'location', label: 'Location', placeholder: 'Remote' },
              { key: 'startDate', label: 'Start Date', placeholder: 'Jan 2022' },
              { key: 'endDate', label: 'End Date', placeholder: 'Dec 2023' },
            ].map(f => (
              <div key={f.key} className={`form-group ${f.span === 2 ? 'col-span-2' : ''}`}>
                <label className="label">{f.label}</label>
                <input className="input" placeholder={f.placeholder}
                  value={exp[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id={`current-${i}`} checked={exp.current || false}
              onChange={e => updateItem(i, 'current', e.target.checked)} className="w-3 h-3" />
            <label htmlFor={`current-${i}`} className="text-xs" style={{ color: 'var(--text-secondary)' }}>Currently working here</label>
          </div>
          <div className="form-group">
            <label className="label">Role Description</label>
            <ExperienceDescField value={exp.description || ''} onChange={v => updateItem(i, 'description', v)} />
          </div>
          <div className="form-group">
            <label className="label">Key Achievements</label>
            <div className="space-y-2">
              {(exp.achievements || []).map((ach, ai) => (
                <div key={ai} className="flex gap-2">
                  <input className="input flex-1 text-xs" placeholder="Led a team of 5 engineers to deliver feature 2 weeks ahead of schedule..."
                    value={ach} onChange={e => updateAchievement(i, ai, e.target.value)} />
                  <button onClick={() => removeAchievement(i, ai)} className="btn-icon w-8 h-9 text-red-400">×</button>
                </div>
              ))}
              <button onClick={() => addAchievement(i)} className="text-xs" style={{ color: 'var(--accent)' }}>+ Add Achievement</button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn-ghost w-full justify-center text-xs">
        + Add Experience
      </button>
    </div>
  )
}

function ExperienceDescField({ value, onChange }) {
  const [enhancing, setEnhancing] = useState(false)
  const enhance = async () => {
    if (!value.trim()) return toast.error('Add description first')
    setEnhancing(true)
    try {
      const res = await analyzerAPI.enhance(value, 'experience_description')
      onChange(res.enhanced)
      toast.success('Description enhanced!')
    } catch {
      toast.error('Enhancement failed')
    } finally {
      setEnhancing(false)
    }
  }
  return (
    <div className="relative">
      <textarea className="textarea w-full text-sm" rows={3}
        placeholder="Describe your role and responsibilities..."
        value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={enhance} disabled={enhancing}
        className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
        {enhancing ? '...' : '✨'}
      </button>
    </div>
  )
}

// ── Skills Step ─────────────────────────────────────────────────────
export function SkillsStep({ data = {}, onChange }) {
  const categories = [
    { key: 'technical', label: 'Technical Skills', placeholder: 'React, Node.js, Python, Docker...' },
    { key: 'soft', label: 'Soft Skills', placeholder: 'Leadership, Communication, Problem-solving...' },
    { key: 'languages', label: 'Languages', placeholder: 'English (Native), Spanish (Fluent)...' },
    { key: 'certifications', label: 'Certifications', placeholder: 'AWS Solutions Architect, PMP...' },
  ]

  const parseCSV = (str) => str.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="space-y-4">
      {categories.map(({ key, label, placeholder }) => (
        <div key={key} className="form-group">
          <label className="label">{label}</label>
          <input className="input" placeholder={placeholder}
            value={(data[key] || []).join(', ')}
            onChange={e => onChange({ ...data, [key]: parseCSV(e.target.value) })} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Separate with commas</p>
          {(data[key] || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(data[key] || []).map((skill, i) => (
                <span key={i} className="badge-muted text-xs">{skill}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Projects Step ───────────────────────────────────────────────────
export function ProjectsStep({ data = [], onChange }) {
  const addItem = () => onChange([...data, { name: '', description: '', technologies: [], url: '', github: '' }])
  const removeItem = (i) => onChange(data.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => {
    const updated = [...data]
    updated[i] = { ...updated[i], [field]: val }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {data.map((proj, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Project #{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs" style={{ color: 'var(--danger)' }}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group col-span-2">
              <label className="label">Project Name</label>
              <input className="input" placeholder="My Awesome Project"
                value={proj.name || ''} onChange={e => updateItem(i, 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">GitHub URL</label>
              <input className="input" placeholder="github.com/user/repo"
                value={proj.github || ''} onChange={e => updateItem(i, 'github', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Live URL</label>
              <input className="input" placeholder="myproject.com"
                value={proj.url || ''} onChange={e => updateItem(i, 'url', e.target.value)} />
            </div>
            <div className="form-group col-span-2">
              <label className="label">Technologies Used</label>
              <input className="input" placeholder="React, Node.js, MongoDB..."
                value={(proj.technologies || []).join(', ')}
                onChange={e => updateItem(i, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </div>
            <div className="form-group col-span-2">
              <label className="label">Description</label>
              <textarea className="textarea w-full text-sm" rows={3}
                placeholder="What does this project do? What problem does it solve?"
                value={proj.description || ''} onChange={e => updateItem(i, 'description', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn-ghost w-full justify-center text-xs">
        + Add Project
      </button>
    </div>
  )
}
