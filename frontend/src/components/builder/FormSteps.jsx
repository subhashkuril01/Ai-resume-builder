import { useState } from 'react'
import { analyzerAPI } from '../../api'
import toast from 'react-hot-toast'

// ── Personal Info Step ──────────────────────────────────────────────
export function PersonalInfoStep({ data, onChange }) {
  const fields = [
    { key: 'firstName', label: 'First Name', placeholder: 'Jane', col: 1 },
    { key: 'lastName', label: 'Last Name', placeholder: 'Smith', col: 1 },
    { key: 'email', label: 'Email Address', placeholder: 'jane@example.com', type: 'email', col: 2 },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', col: 1 },
    { key: 'location', label: 'Location', placeholder: 'San Francisco, CA', col: 1 },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/jane', col: 1 },
    { key: 'github', label: 'GitHub URL', placeholder: 'github.com/jane', col: 1 },
    { key: 'website', label: 'Portfolio/Website', placeholder: 'janesmith.dev', col: 2 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        {fields.map(f => (
          <div key={f.key} className={`space-y-2 ${f.col === 2 ? 'col-span-2' : ''}`}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">{f.label}</label>
            <input type={f.type || 'text'} 
              className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
              placeholder={f.placeholder}
              value={data?.[f.key] || ''}
              onChange={e => onChange({ ...data, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Professional Summary</label>
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
    <div className="relative group">
      <textarea 
        className="w-full h-32 bg-white/[0.03] border border-border rounded-2xl p-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none resize-none custom-scrollbar" 
        placeholder="Brief overview of your professional background..."
        value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={enhance} disabled={enhancing}
        className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all">
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
    <div className="space-y-6">
      {data.map((edu, i) => (
        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-border/50 space-y-5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => removeItem(i)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300">Remove</button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Education {i + 1}</p>
          <div className="grid grid-cols-2 gap-5">
            {[
              { key: 'institution', label: 'Institution', placeholder: 'MIT', span: 2 },
              { key: 'degree', label: 'Degree', placeholder: 'Bachelor of Science' },
              { key: 'field', label: 'Field of Study', placeholder: 'Computer Science' },
              { key: 'startDate', label: 'Start Date', placeholder: '2018' },
              { key: 'endDate', label: 'End Date', placeholder: '2022 or Present' },
              { key: 'gpa', label: 'GPA (optional)', placeholder: '3.8/4.0', span: 2 },
            ].map(f => (
              <div key={f.key} className={`space-y-2 ${f.span === 2 ? 'col-span-2' : ''}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">{f.label}</label>
                <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                  placeholder={f.placeholder}
                  value={edu[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="w-full py-4 rounded-2xl border border-dashed border-border text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-white/20 transition-all">
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
    <div className="space-y-6">
      {data.map((exp, i) => (
        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-border/50 space-y-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => removeItem(i)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300">Remove</button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Experience {i + 1}</p>
          
          <div className="grid grid-cols-2 gap-5">
            {[
              { key: 'company', label: 'Company', placeholder: 'Google', span: 2 },
              { key: 'position', label: 'Position', placeholder: 'Software Engineer' },
              { key: 'location', label: 'Location', placeholder: 'Remote' },
              { key: 'startDate', label: 'Start Date', placeholder: 'Jan 2022' },
              { key: 'endDate', label: 'End Date', placeholder: 'Dec 2023' },
            ].map(f => (
              <div key={f.key} className={`space-y-2 ${f.span === 2 ? 'col-span-2' : ''}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">{f.label}</label>
                <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                  placeholder={f.placeholder}
                  value={exp[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 px-1">
            <input type="checkbox" id={`current-${i}`} checked={exp.current || false}
              onChange={e => updateItem(i, 'current', e.target.checked)} className="accent-amber-500 w-4 h-4 rounded bg-white/5 border-border" />
            <label htmlFor={`current-${i}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Currently working here</label>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Role Overview</label>
            <ExperienceDescField value={exp.description || ''} onChange={v => updateItem(i, 'description', v)} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Key Achievements</label>
            <div className="space-y-3">
              {(exp.achievements || []).map((ach, ai) => (
                <div key={ai} className="flex gap-2">
                  <input className="flex-1 h-10 bg-white/[0.02] border border-border/50 rounded-lg px-4 text-xs text-text-primary focus:border-amber-500/30 outline-none transition-all" 
                    placeholder="Describe a key achievement..."
                    value={ach} onChange={e => updateAchievement(i, ai, e.target.value)} />
                  <button onClick={() => removeAchievement(i, ai)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all">✕</button>
                </div>
              ))}
              <button onClick={() => addAchievement(i)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500/60 hover:text-amber-500 transition-all ml-1">+ New Achievement</button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="w-full py-4 rounded-2xl border border-dashed border-border text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-white/20 transition-all">
        + Add Professional Experience
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
    <div className="relative group">
      <textarea className="w-full h-24 bg-white/[0.03] border border-border rounded-xl p-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none resize-none custom-scrollbar" 
        placeholder="Describe your role and responsibilities..."
        value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={enhance} disabled={enhancing}
        className="absolute bottom-2 right-2 p-2 rounded-lg bg-amber-500/10 text-amber-500 text-xs hover:bg-amber-500/20 transition-all" title="AI Enhance">
        {enhancing ? '...' : '✨'}
      </button>
    </div>
  )
}

// ── Skills Step ─────────────────────────────────────────────────────
export function SkillsStep({ data = {}, onChange }) {
  const categories = [
    { key: 'technical', label: 'Technical Expertise', placeholder: 'React, Node.js, Python, Docker...' },
    { key: 'soft', label: 'Soft Skills & Leadership', placeholder: 'Communication, Problem-solving...' },
    { key: 'languages', label: 'Languages', placeholder: 'English (Native), Spanish (Fluent)...' },
    { key: 'certifications', label: 'Certifications', placeholder: 'AWS Solutions Architect, PMP...' },
  ]

  const parseCSV = (str) => str.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="space-y-8">
      {categories.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">{label}</label>
          <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
            placeholder={placeholder}
            value={(data[key] || []).join(', ')}
            onChange={e => onChange({ ...data, [key]: parseCSV(e.target.value) })} />
          <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted ml-1">Use commas to separate skills</p>
          {(data[key] || []).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {(data[key] || []).map((skill, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-border/50 text-[10px] text-zinc-400 font-medium">{skill}</span>
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
    <div className="space-y-6">
      {data.map((proj, i) => (
        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-border/50 space-y-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => removeItem(i)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300">Remove</button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Project {i + 1}</p>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Project Name</label>
              <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                placeholder="My Awesome Project"
                value={proj.name || ''} onChange={e => updateItem(i, 'name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">GitHub URL</label>
              <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                placeholder="github.com/user/repo"
                value={proj.github || ''} onChange={e => updateItem(i, 'github', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Live URL</label>
              <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                placeholder="myproject.com"
                value={proj.url || ''} onChange={e => updateItem(i, 'url', e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Technologies Used</label>
              <input className="w-full h-11 bg-white/[0.03] border border-border rounded-xl px-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none" 
                placeholder="React, Node.js, MongoDB..."
                value={(proj.technologies || []).join(', ')}
                onChange={e => updateItem(i, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Description</label>
              <textarea className="w-full h-24 bg-white/[0.03] border border-border rounded-xl p-4 text-sm text-text-primary focus:border-amber-500/50 transition-all outline-none resize-none custom-scrollbar" 
                placeholder="What does this project do?"
                value={proj.description || ''} onChange={e => updateItem(i, 'description', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="w-full py-4 rounded-2xl border border-dashed border-border text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-white/20 transition-all">
        + Add Portfolio Project
      </button>
    </div>
  )
}
