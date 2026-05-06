import { useEffect, useMemo, useRef, useState } from 'react'
import { analyzerAPI, resumeAPI, resumeTestAPI } from '../api'
import toast from 'react-hot-toast'

const formatClock = (seconds) => {
  const safe = Math.max(0, seconds || 0)
  const mins = String(Math.floor(safe / 60)).padStart(2, '0')
  const secs = String(safe % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

const scoreTone = (score) => {
  if (score >= 80) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
  if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
}

function EmptyState({ title, body, action, actionLabel }) {
  return (
    <div className="card p-12 text-center bg-white/5 border-border/50 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl mx-auto border border-border/50 opacity-50">📑</div>
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-text-primary tracking-tight">{title}</h3>
        <p className="text-text-secondary/80 text-sm max-w-sm mx-auto leading-relaxed">{body}</p>
      </div>
      {action && (
        <button onClick={action} className="h-12 px-8 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default function ResumeTest() {
  const [resumes, setResumes] = useState([])
  const [tests, setTests] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedTest, setSelectedTest] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [selectedOptionKey, setSelectedOptionKey] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [evaluatingResumeId, setEvaluatingResumeId] = useState('')
  const [reportTab, setReportTab] = useState('score')
  const [menuOpenId, setMenuOpenId] = useState(null)
  const questionStartedAt = useRef(Date.now())

  const loadData = async (focusTestId = '') => {
    setLoading(true)
    try {
      const [resumeRes, testsRes] = await Promise.all([resumeAPI.getAll(), resumeTestAPI.getAll()])
      const loadedResumes = resumeRes.resumes || []
      const loadedTests = testsRes.tests || []
      setResumes(loadedResumes)
      setTests(loadedTests)
      if (!selectedResumeId && loadedResumes.length) setSelectedResumeId(loadedResumes[0]._id)

      const targetId = focusTestId || selectedTest?._id || loadedTests[0]?._id
      if (targetId) {
        const detail = await resumeTestAPI.getOne(targetId)
        setSelectedTest(detail.test)
        setRemainingSeconds(detail.test.remainingSeconds || 0)
      } else {
        setSelectedTest(null)
      }
    } catch (error) {
      toast.error(error?.error || 'Failed to load test workspace')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!selectedTest?.questions?.length) return
    const question = selectedTest.questions[activeIndex]
    setAnswerText(question?.userAnswer?.answerText || '')
    setSelectedOptionKey(question?.userAnswer?.selectedOptionKey || '')
    questionStartedAt.current = Date.now()
  }, [selectedTest?._id, activeIndex])

  useEffect(() => {
    if (!selectedTest || !['in_progress', 'draft'].includes(selectedTest.status)) return
    setRemainingSeconds(selectedTest.remainingSeconds || 0)
  }, [selectedTest])

  useEffect(() => {
    if (!selectedTest || selectedTest.status !== 'in_progress') return undefined

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [selectedTest?.status, selectedTest?._id])

  const activeQuestion = selectedTest?.questions?.[activeIndex]
  const progress = useMemo(() => {
    if (!selectedTest?.questions?.length) return 0
    const answered = selectedTest.questions.filter((question) => {
      return Boolean(question.userAnswer?.selectedOptionKey)
    }).length
    return Math.round((answered / selectedTest.questions.length) * 100)
  }, [selectedTest])

  const refreshTest = async (testId) => {
    const res = await resumeTestAPI.getOne(testId)
    setSelectedTest(res.test)
    setRemainingSeconds(res.test.remainingSeconds || 0)
  }

  const handleGenerate = async () => {
    if (!selectedResumeId) return toast.error('Choose a resume first')
    setGenerating(true)
    try {
      const res = await resumeTestAPI.generate(selectedResumeId)
      toast.success('Personalized test created')
      await loadData(res.test._id)
      setActiveIndex(0)
    } catch (error) {
      toast.error(error?.error || 'Failed to generate test')
    } finally {
      setGenerating(false)
    }
  }

  const handleStart = async () => {
    if (!selectedTest?._id) return
    try {
      const res = await resumeTestAPI.start(selectedTest._id)
      setSelectedTest(res.test)
      setRemainingSeconds(res.test.remainingSeconds || 0)
      toast.success('Test started. Timer is live.')
    } catch (error) {
      toast.error(error?.error || 'Failed to start test')
    }
  }

  const handleSaveAnswer = async ({ silent = false, nextIndex = null } = {}) => {
    if (!selectedTest?._id || !activeQuestion) return true
    if (!['draft', 'in_progress'].includes(selectedTest.status)) return true

    const payload = {
      questionId: activeQuestion.questionId,
      timeSpentSeconds: Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 1000))
    }
    if (activeQuestion.type === 'mcq') payload.selectedOptionKey = selectedOptionKey
    else payload.answerText = answerText

    setSaving(true)
    try {
      await resumeTestAPI.saveAnswer(selectedTest._id, payload)
      setSelectedTest((current) => {
        if (!current) return current
        return {
          ...current,
          questions: current.questions.map((question) => (
            question.questionId === activeQuestion.questionId
              ? {
                  ...question,
                  userAnswer: {
                    selectedOptionKey: payload.selectedOptionKey || '',
                    answerText: payload.answerText || '',
                    timeSpentSeconds: payload.timeSpentSeconds,
                    savedAt: new Date().toISOString()
                  }
                }
              : question
          ))
        }
      })
      questionStartedAt.current = Date.now()
      if (nextIndex !== null) setActiveIndex(nextIndex)
      if (!silent) toast.success('Answer saved')
      return true
    } catch (error) {
      toast.error(error?.error || 'Failed to save answer')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (auto = false) => {
    if (!selectedTest?._id || submitting) return
    const saved = await handleSaveAnswer({ silent: true })
    if (!saved) return

    setSubmitting(true)
    try {
      const res = await resumeTestAPI.submit(selectedTest._id)
      setSelectedTest(res.test)
      setRemainingSeconds(0)
      setTests((current) => current.map((test) => (
        test._id === res.test._id
          ? { ...test, status: res.test.status, report: res.test.report, submittedAt: res.test.submittedAt }
          : test
      )))
      toast.success(auto ? 'Time is up. Test auto-submitted.' : 'Test submitted successfully')
    } catch (error) {
      toast.error(error?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetake = async () => {
    if (!selectedTest?._id) return
    try {
      const res = await resumeTestAPI.retake(selectedTest._id)
      toast.success('A new question set is ready')
      await loadData(res.test._id)
      setActiveIndex(0)
    } catch (error) {
      toast.error(error?.error || 'Retake generation failed')
    }
  }

  const handleSelectTest = async (testId) => {
    setActiveIndex(0)
    await refreshTest(testId)
  }

  const handleRunAnalyzer = async () => {
    if (!selectedResumeId) return toast.error('Choose a resume first')
    setEvaluatingResumeId(selectedResumeId)
    try {
      await analyzerAPI.analyzeATS(selectedResumeId)
      toast.success('Resume analysis updated')
    } catch (error) {
      toast.error(error?.error || 'Analyzer failed')
    } finally {
      setEvaluatingResumeId('')
    }
  }

  const handleRenameTest = async (e, id, currentTitle) => {
    e.stopPropagation()
    setMenuOpenId(null)
    const newTitle = window.prompt('Enter new name for this test:', currentTitle)
    if (!newTitle || newTitle.trim() === '' || newTitle === currentTitle) return
    try {
      await resumeTestAPI.update(id, { title: newTitle.trim() })
      toast.success('Test renamed successfully')
      loadData(selectedTest?._id)
    } catch (err) {
      toast.error(err.error || 'Failed to rename test')
    }
  }

  const handleDeleteTest = async (e, id) => {
    e.stopPropagation()
    setMenuOpenId(null)
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) return
    try {
      await resumeTestAPI.delete(id)
      toast.success('Test deleted successfully')
      if (selectedTest?._id === id) {
        setSelectedTest(null)
        loadData()
      } else {
        loadData(selectedTest?._id)
      }
    } catch (err) {
      toast.error(err.error || 'Failed to delete test')
    }
  }

  const currentTone = selectedTest?.report ? scoreTone(selectedTest.report.overallScore || 0) : null

  return (
    <div className="min-h-screen pt-32 pb-20 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-3">Cognitive Evaluation</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4">
              <h1 className="font-display text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                Resume <span className="text-text-muted/50">Assessment</span>
              </h1>
              <p className="text-text-secondary/80 text-sm max-w-2xl leading-relaxed">
                Adaptive AI-driven assessment based on your professional profile. Prepare for high-stakes interviews with personalized MCQ sets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select 
                className="h-12 bg-white/5 border border-border rounded-xl px-5 text-[10px] font-bold uppercase tracking-widest text-text-primary focus:border-amber-500/50 outline-none appearance-none cursor-pointer pr-10 relative"
                value={selectedResumeId} 
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                <option value="" className="bg-primary">Target Artifact</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id} className="bg-secondary">{resume.title}</option>
                ))}
              </select>
              <button onClick={handleGenerate} className="h-12 px-6 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest glow-orange transition-all hover:scale-105 disabled:opacity-50" disabled={generating || !selectedResumeId}>
                {generating ? 'Processing' : 'Generate 50 MCQ Set'}
              </button>
              <button onClick={handleRunAnalyzer} className="h-12 px-6 rounded-xl bg-white/5 border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all" disabled={!selectedResumeId || evaluatingResumeId === selectedResumeId}>
                {evaluatingResumeId === selectedResumeId ? 'Analyzing' : 'Sync ATS Data'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Initializing Assessment Engine</p>
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            title="No resumes available"
            body="Create a resume in the builder first. This module uses the structured resume data already saved in your account."
          />
        ) : (
          <div className="grid lg:grid-cols-[320px,1fr] gap-10">
            <aside className="space-y-8 animate-fade-up">
              <div className="card p-6 border-border/50 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/80">Timeline</h2>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-text-muted">{tests.length} SESSIONS</span>
                </div>
                {tests.length === 0 ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50 italic">No sessions recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {tests.map((test) => (
                      <div
                        key={test._id}
                        className={`relative w-full rounded-2xl transition-all border group ${selectedTest?._id === test._id ? 'bg-amber-500/[0.03] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'bg-white/5 border-border/50 hover:border-border'}`}
                      >
                        <button
                          onClick={() => handleSelectTest(test._id)}
                          className="w-full text-left p-4 pr-12"
                        >
                          <p className={`text-[10px] font-black uppercase tracking-tight truncate mb-1 ${selectedTest?._id === test._id ? 'text-amber-500' : 'text-text-secondary'}`}>{test.title}</p>
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-3 truncate">{test.resumeTitle} • #{test.attemptNumber}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary/80 px-2 py-1 bg-white/5 rounded-lg border border-border/50">{test.status.replace('_', ' ')}</span>
                            <span className="text-sm font-black text-text-primary">
                              {test.report?.overallScore ?? '--'}<span className="text-[9px] text-text-muted">%</span>
                            </span>
                          </div>
                        </button>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(menuOpenId === test._id ? null : test._id)
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-text-secondary/80 hover:text-text-primary"
                          >
                            <span className="font-bold">⋮</span>
                          </button>
                          {menuOpenId === test._id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                               <div className="absolute right-0 mt-2 w-44 rounded-2xl shadow-2xl z-50 overflow-hidden bg-secondary border border-border">
                                <button onClick={(e) => handleRenameTest(e, test._id, test.title)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 flex items-center gap-3 transition-colors text-text-primary">
                                  <span>✎</span> Rename
                                </button>
                                <button onClick={(e) => handleDeleteTest(e, test._id)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 flex items-center gap-3 transition-colors text-red-500 border-t border-border/50">
                                  <span>🗑</span> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTest?.generatedFrom && (
                <div className="card p-6 border-border/50 bg-white/[0.01] animate-fade-up">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/80 mb-6">Environment Data</h2>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/50">Primary Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTest.generatedFrom.skills || []).slice(0, 10).map((skill) => (
                          <span key={skill} className="px-2.5 py-1.5 rounded-lg bg-amber-500/5 text-amber-500 text-[9px] font-black uppercase tracking-wider border border-amber-500/10">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/50">Artifact References</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTest.generatedFrom.projects || []).slice(0, 5).map((project) => (
                          <span key={project} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-text-secondary/80 text-[9px] font-black uppercase tracking-wider border border-border/50">{project}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            <main className="space-y-8 animate-fade-up">
              {!selectedTest ? (
                <EmptyState
                  title="Session Not Selected"
                  body="Select an existing assessment session from the timeline or generate a new set from your resume artifacts."
                  action={handleGenerate}
                  actionLabel="Create New Session"
                />
              ) : (
                <>
                  <div className="card p-8 lg:p-10 border-border/50 relative overflow-hidden bg-white/[0.01]">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                       <div className="text-9xl font-black">{selectedTest.attemptNumber}</div>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-white/5 border border-border text-[9px] font-black uppercase tracking-widest text-text-secondary/80">{selectedTest.status.replace('_', ' ')}</span>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedTest.difficulty === 'hard' ? 'text-red-500 bg-red-500/10' : 'text-amber-500 bg-amber-500/10'}`}>{selectedTest.difficulty} Complexity</span>
                        </div>
                        <h2 className="font-display text-3xl font-black text-text-primary tracking-tight leading-tight">{selectedTest.title}</h2>
                        <div className="flex items-center gap-4 text-text-muted text-[10px] font-bold uppercase tracking-widest">
                           <span>{selectedTest.questions.length} MCQs</span>
                           <div className="w-1 h-1 rounded-full bg-zinc-800" />
                           <span>60 Minute Cap</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {selectedTest.status === 'draft' && (
                          <button onClick={handleStart} className="h-14 px-10 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest glow-orange hover:scale-[1.02] transition-all">Initialize Stream</button>
                        )}
                        {selectedTest.status === 'in_progress' && (
                          <>
                            <div className={`h-14 px-6 rounded-2xl border flex flex-col items-center justify-center min-w-[120px] transition-colors ${remainingSeconds < 600 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 border-border text-text-primary'}`}>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-0.5">Remaining</span>
                              <p className="font-display text-xl font-black tracking-tighter text-text-primary">{formatClock(remainingSeconds)}</p>
                            </div>
                            <button onClick={() => handleSaveAnswer()} className="h-14 px-6 rounded-2xl bg-white/5 border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all" disabled={saving}>
                              {saving ? 'Syncing...' : 'Sync Progress'}
                            </button>
                            <button onClick={() => handleSubmit(false)} className="h-14 px-8 rounded-2xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest glow-emerald hover:scale-[1.02] transition-all" disabled={submitting}>
                              {submitting ? 'Finalizing...' : 'Submit Session'}
                            </button>
                          </>
                        )}
                        {selectedTest.status === 'submitted' && (
                          <button onClick={handleRetake} className="h-14 px-10 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">New Iteration →</button>
                        )}
                      </div>
                    </div>

                    <div className="mt-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Cognitive Coverage</span>
                        <span className="text-sm font-black text-amber-500">{progress}<span className="text-[10px] ml-1">%</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-border/50">
                        <div className="h-full bg-amber-500 glow-orange transition-all duration-1000 ease-out rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  {selectedTest.status !== 'submitted' ? (
                    <div className="grid xl:grid-cols-[1fr,240px] gap-8">
                      <div className="card p-10 border-border/50 bg-white/[0.01]">
                        {activeQuestion && (
                          <div className="animate-fade-up">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2">
                                  Challenge {activeIndex + 1} <span className="text-text-muted/50 mx-2">/</span> {selectedTest.questions.length}
                                </p>
                                <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight">
                                  {activeQuestion.skill}
                                </h3>
                              </div>
                              <span className="px-3 py-1 rounded-xl bg-white/5 border border-border text-[9px] font-black uppercase tracking-widest text-text-secondary/80 capitalize">{activeQuestion.difficulty}</span>
                            </div>

                            {activeQuestion.context && (
                              <div className="rounded-3xl p-6 mb-8 bg-zinc-900/40 border border-border/50 relative group">
                                <div className="absolute top-4 left-[-2px] w-1 h-8 bg-indigo-500/50 rounded-full" />
                                <p className="text-sm text-text-secondary leading-relaxed italic">"{activeQuestion.context}"</p>
                              </div>
                            )}

                            <p className="text-lg text-text-primary font-medium leading-relaxed mb-10">{activeQuestion.prompt}</p>

                            {activeQuestion.type === 'mcq' && (
                              <div className="grid grid-cols-1 gap-4">
                                {activeQuestion.options.map((option) => (
                                  <label
                                    key={option.key}
                                    className={`flex items-start gap-5 p-6 rounded-3xl cursor-pointer transition-all border group relative overflow-hidden ${selectedOptionKey === option.key ? 'bg-amber-500/[0.04] border-amber-500/40' : 'bg-white/[0.01] border-border/50 hover:bg-white/5 hover:border-border'}`}
                                  >
                                    <div className={`mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedOptionKey === option.key ? 'border-amber-500 bg-amber-500' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                                       {selectedOptionKey === option.key && <div className="w-2 h-2 rounded-full bg-black" />}
                                    </div>
                                    <div className="relative z-10 flex-1">
                                      <p className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${selectedOptionKey === option.key ? 'text-amber-500' : 'text-text-muted group-hover:text-text-secondary'}`}>Option {option.key}</p>
                                      <p className={`text-sm leading-relaxed ${selectedOptionKey === option.key ? 'text-text-primary' : 'text-text-secondary'}`}>{option.text}</p>
                                    </div>
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={selectedOptionKey === option.key}
                                      onChange={() => setSelectedOptionKey(option.key)}
                                    />
                                  </label>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/50">
                              <button
                                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                                className={`h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeIndex === 0 ? 'opacity-20 grayscale' : 'text-text-secondary/80 hover:text-text-primary hover:bg-white/5'}`}
                                disabled={activeIndex === 0}
                              >
                                ← Previous
                              </button>
                              <div className="flex gap-4">
                                <button onClick={() => handleSaveAnswer()} className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-all" disabled={saving}>
                                  {saving ? 'Syncing' : 'Stash'}
                                </button>
                                <button
                                  onClick={() => handleSaveAnswer({ nextIndex: Math.min(selectedTest.questions.length - 1, activeIndex + 1) })}
                                  className="h-12 px-10 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30"
                                  disabled={activeIndex === selectedTest.questions.length - 1}
                                >
                                  Continue →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card p-6 h-fit bg-white/[0.01] border-border/50 sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-6">Cognitive Map</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {selectedTest.questions.map((question, index) => {
                            const answered = Boolean(question.userAnswer?.selectedOptionKey)
                            return (
                              <button
                                key={question.questionId}
                                onClick={() => setActiveIndex(index)}
                                className={`h-11 rounded-xl text-[11px] font-black transition-all border ${activeIndex === index ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20 scale-110 z-10' : answered ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-border text-text-muted hover:border-white/20'}`}
                              >
                                {index + 1}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fade-up">
                      {/* Tab Navigation */}
                      <div className="card p-2 border-border/50 bg-white/[0.01] flex gap-2">
                        {[
                          ['score','Analytics Overview'],
                          ['answers','Answer Audit'],
                          ['report','Critical Roadmap']
                        ].map(([key, label]) => (
                          <button 
                            key={key} 
                            onClick={() => setReportTab(key)} 
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${reportTab === key ? 'bg-secondary text-text-primary shadow-xl shadow-white/10' : 'text-text-muted hover:text-text-secondary hover:bg-white/5'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* TAB 1: Analytics Overview */}
                      {reportTab === 'score' && (
                        <div className="space-y-10 animate-fade-up">
                          <div className="card p-12 border-border/50 bg-white/[0.01] relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-20 opacity-[0.02] select-none text-9xl font-black">{selectedTest.report?.overallScore}</div>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 relative z-10">
                              <div className="space-y-6 flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/80 border-l-2 border-zinc-800 pl-4">Performance Index</p>
                                <h3 className="font-display text-6xl font-black tracking-tighter" style={{ color: currentTone?.color }}>
                                  {selectedTest.report?.overallScore}<span className="text-3xl opacity-50 ml-1">%</span>
                                </h3>
                                <p className="text-text-secondary text-base leading-relaxed font-medium max-w-2xl">
                                  "{selectedTest.report?.careerFeedback?.finalSummary}"
                                </p>
                                {(() => { 
                                  const qs = selectedTest.questions || []; 
                                  const correct = qs.filter(q => q.userAnswer?.selectedOptionKey === q.correctAnswer?.optionKey).length; 
                                  const wrong = qs.filter(q => q.userAnswer?.selectedOptionKey && q.userAnswer.selectedOptionKey !== q.correctAnswer?.optionKey).length; 
                                  const skip = qs.length - correct - wrong; 
                                  return (
                                    <div className="flex gap-8 pt-4">
                                      <div className="flex flex-col"><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Precision</span><span className="text-xl font-black text-text-primary">{correct}</span></div>
                                      <div className="flex flex-col"><span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Errors</span><span className="text-xl font-black text-text-primary">{wrong}</span></div>
                                      <div className="flex flex-col"><span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Bypass</span><span className="text-xl font-black text-text-primary">{skip}</span></div>
                                    </div>
                                  ); 
                                })()}
                              </div>
                              <div className="grid grid-cols-2 gap-4 min-w-[320px]">
                                {[
                                  ['Logic & Reasoning', selectedTest.report?.logicalThinkingScore],
                                  ['Problem Solving', selectedTest.report?.problemSolvingAbility],
                                  ['Technical Accuracy', selectedTest.report?.accuracyLevel],
                                  ['Interview Readiness', selectedTest.report?.careerFeedback?.interviewReadinessScore]
                                ].map(([label, value]) => (
                                  <div key={label} className="card p-6 bg-white/5 border-border group hover:border-amber-500/30 transition-all">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 group-hover:text-amber-500 transition-colors">{label}</p>
                                    <p className="font-display text-3xl font-black text-text-primary tracking-tighter">{value}<span className="text-xs opacity-30 ml-1">%</span></p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {selectedTest.report?.comparison && (
                            <div className="card p-10 border-border/50 bg-amber-500/[0.01]">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8">Evolutionary Delta</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2"><p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Baseline</p><p className="text-2xl font-black text-text-primary">{selectedTest.report.comparison.previousOverallScore}%</p></div>
                                <div className="space-y-2"><p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Growth</p><p className={`text-2xl font-black ${selectedTest.report.comparison.delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{selectedTest.report.comparison.delta >= 0 ? '↑' : '↓'} {Math.abs(selectedTest.report.comparison.delta)} PTS</p></div>
                                <div className="space-y-2"><p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Mastered Verticals</p><p className="text-xs font-black text-text-secondary uppercase tracking-widest leading-relaxed">{(selectedTest.report.comparison.improvedSkills || []).join(' • ') || 'N/A'}</p></div>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-center"><button onClick={() => setReportTab('answers')} className="h-16 px-12 rounded-3xl bg-secondary text-text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-white/5">Audit Detailed Answers →</button></div>
                        </div>
                      )}

                      {/* TAB 2: Answer Audit */}
                      {reportTab === 'answers' && (
                        <div className="space-y-10 animate-fade-up">
                          <div className="card p-10 lg:p-12 border-border/50 bg-white/[0.01]">
                            <div className="flex items-center justify-between mb-12">
                               <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight leading-tight">Session Audit Logs</h3>
                               <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Precision Traceability</p>
                            </div>
                            <div className="space-y-6">
                              {selectedTest.questions.map((question, qIdx) => {
                                const userKey = question.userAnswer?.selectedOptionKey || null
                                const correctKey = question.correctAnswer?.optionKey || ''
                                const isCorrect = userKey === correctKey
                                return (
                                  <div key={question.questionId} className={`rounded-[2.5rem] p-8 transition-all border-2 relative group overflow-hidden ${!userKey ? 'bg-white/5 border-border/50 grayscale' : isCorrect ? 'bg-emerald-500/[0.02] border-emerald-500/10' : 'bg-red-500/[0.02] border-red-500/10'}`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                       <div className="text-6xl font-black">{qIdx + 1}</div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${!userKey ? 'bg-zinc-800 border-zinc-700 text-text-secondary/80' : isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                         {!userKey ? 'Skipped Execution' : isCorrect ? 'Optimal Selection' : 'Strategic Error'}
                                      </span>
                                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{question.skill} • {question.difficulty}</span>
                                    </div>
                                    <p className="text-lg font-bold text-text-primary mb-8 max-w-3xl leading-relaxed relative z-10">{question.prompt}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                      {question.options?.map((opt) => {
                                        const isUserPick = opt.key === userKey
                                        const isCorrectOpt = opt.key === correctKey
                                        let bg = 'bg-white/5', bdr = 'border-border/50', tc = 'text-text-secondary/80', op = 'opacity-60'
                                        if (isCorrectOpt) { bg = 'bg-emerald-500/10'; bdr = 'border-emerald-500/30'; tc = 'text-emerald-500'; op = 'opacity-100' }
                                        else if (isUserPick && !isCorrect) { bg = 'bg-red-500/10'; bdr = 'border-red-500/30'; tc = 'text-red-500'; op = 'opacity-100' }
                                        return (
                                          <div key={opt.key} className={`rounded-2xl px-5 py-4 text-xs flex items-center justify-between border transition-all ${bg} ${bdr} ${tc} ${op}`}>
                                             <div className="flex items-center gap-3">
                                                <span className="font-black opacity-50">{opt.key}.</span>
                                                <span className="font-medium">{opt.text}</span>
                                             </div>
                                             {isCorrectOpt && <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-black px-2 py-0.5 rounded ml-2">Verified</span>}
                                             {isUserPick && !isCorrect && <span className="text-[8px] font-black uppercase tracking-widest bg-red-500 text-black px-2 py-0.5 rounded ml-2">Your Bias</span>}
                                          </div>
                                        )
                                      })}
                                    </div>
                                    {question.correctAnswer?.explanation && (
                                      <div className="mt-8 p-6 rounded-3xl bg-black/40 border border-border/50 relative group/exp">
                                         <div className="absolute top-4 left-[-1px] w-1 h-6 bg-white/10 rounded-full" />
                                         <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Rationale</p>
                                         <p className="text-xs text-text-secondary/80 leading-relaxed font-medium">{question.correctAnswer.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="flex justify-center"><button onClick={() => setReportTab('report')} className="h-16 px-12 rounded-3xl bg-secondary text-text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all">Build Strategic Roadmap →</button></div>
                        </div>
                      )}

                      {/* TAB 3: Critical Roadmap */}
                      {reportTab === 'report' && (
                        <div className="space-y-8 animate-fade-up">
                           <div className="grid xl:grid-cols-5 gap-8">
                              <div className="xl:col-span-3 card p-10 border-border/50 bg-white/[0.01] space-y-10">
                                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/80">Vertical Competency</h3>
                                 <div className="space-y-4">
                                   {(selectedTest.report?.skillBreakdown || []).map((skill) => { 
                                     const tone = scoreTone(skill.accuracy || 0); 
                                     return (
                                       <div key={skill.skill} className="card p-6 bg-white/5 border-border/50 group hover:border-border transition-all">
                                         <div className="flex items-center justify-between mb-4">
                                            <p className="font-bold text-text-primary uppercase tracking-tight">{skill.skill}</p>
                                            <span className="text-sm font-black" style={{ color: tone.color }}>{skill.accuracy}<span className="text-[9px] opacity-50 ml-1">%</span></span>
                                         </div>
                                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                            <div className="h-full transition-all duration-1000" style={{ width: `${skill.accuracy}%`, background: tone.color }} />
                                         </div>
                                         <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-text-muted">
                                            <span>Score: {skill.score} / {skill.maxScore}</span>
                                            {skill.weaknesses?.length > 0 && <span className="text-red-500/50">Attention Required</span>}
                                         </div>
                                         {skill.weaknesses?.length > 0 && (
                                           <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                                              {skill.weaknesses.map(w => <span key={w} className="text-[8px] font-black px-2 py-1 bg-red-500/5 text-red-500 border border-red-500/10 rounded uppercase">{w}</span>)}
                                           </div>
                                         )}
                                       </div>
                                     ) 
                                   })}
                                 </div>
                              </div>
                              
                              <div className="xl:col-span-2 space-y-8">
                                 <div className="card p-10 border-border/50 bg-red-500/[0.01]">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-8">Systemic Gaps</h3>
                                    <div className="flex flex-wrap gap-3">
                                       {(selectedTest.report?.weakAreas || []).map((a) => (
                                         <span key={a} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 uppercase tracking-widest">{a}</span>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="card p-10 border-border/50 bg-indigo-500/[0.01] space-y-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Optimization Roadmap</h3>
                                    <div className="space-y-4">
                                       {(selectedTest.report?.careerFeedback?.learningRoadmap || []).map((item, i) => (
                                         <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-border/50 group hover:bg-white/[0.06] transition-all">
                                            <span className="text-indigo-500/40 font-black text-sm">{i + 1}</span>
                                            <p className="text-xs text-text-secondary leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">{item}</p>
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="grid xl:grid-cols-2 gap-8">
                              <div className="card p-10 border-border/50 bg-white/[0.01]">
                                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/80 mb-10">Behavioral Mistake Analysis</h3>
                                 <div className="space-y-4">
                                    {(selectedTest.report?.mistakeAnalysis || []).length === 0 ? (
                                      <p className="text-[10px] font-bold text-text-muted/50 italic uppercase">No recurring errors detected.</p>
                                    ) : (
                                      (selectedTest.report?.mistakeAnalysis || []).map((item, i) => (
                                        <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-border/50 hover:border-border transition-all space-y-4">
                                           <div className="flex items-center justify-between">
                                              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-muted">{item.skill}</span>
                                              <span className="text-[8px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded uppercase">Misalignment</span>
                                           </div>
                                           <p className="text-base font-bold text-text-primary leading-tight">{item.prompt}</p>
                                           <p className="text-xs text-text-secondary/80 font-medium leading-relaxed italic">"{item.explanation}"</p>
                                           <div className="pt-4 border-t border-border/50">
                                              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Optimal Approach</p>
                                              <p className="text-xs text-text-secondary font-medium">{item.correctApproach}</p>
                                           </div>
                                        </div>
                                      ))
                                    )}
                                 </div>
                              </div>
                              
                              <div className="card p-10 border-border/50 bg-white/[0.01] space-y-12">
                                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/80">Executive Career Feedback</h3>
                                 {[
                                   ['Resume Optimization', selectedTest.report?.careerFeedback?.resumeImprovements || [], 'text-amber-500'],
                                   ['Skill Concentration', selectedTest.report?.careerFeedback?.skillsToFocus || [], 'text-indigo-400'],
                                   ['Artifact Expansion', selectedTest.report?.careerFeedback?.projectSuggestions || [], 'text-emerald-400']
                                 ].map(([label, items, accent]) => (
                                   <div key={label} className="space-y-6">
                                      <p className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>{label}</p>
                                      <div className="space-y-3">
                                         {items.map((item, i) => (
                                           <div key={i} className="p-5 rounded-2xl bg-white/5 border border-border/50 relative group hover:bg-white/10 transition-all">
                                              <div className="absolute top-1/2 left-[-1px] w-1 h-4 bg-white/10 rounded-full group-hover:bg-amber-500/50 transition-colors -translate-y-1/2" />
                                              <p className="text-xs text-text-secondary/80 leading-relaxed font-medium">{item}</p>
                                           </div>
                                         ))}
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
