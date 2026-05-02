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
  if (score >= 80) return { color: 'var(--success)', bg: 'var(--success-bg)' }
  if (score >= 60) return { color: 'var(--accent)', bg: 'var(--accent-dim)' }
  return { color: 'var(--danger)', bg: 'var(--danger-bg)' }
}

function EmptyState({ title, body, action, actionLabel }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{body}</p>
      {action && <button onClick={action} className="btn-primary mx-auto">{actionLabel}</button>}
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
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="section-title">AI Assessment</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Resume-Based Test Prep
              </h1>
              <p className="text-sm mt-1 max-w-3xl" style={{ color: 'var(--text-muted)' }}>
                Generate a 50-question MCQ assessment from your saved resume with increasing difficulty levels, complete it inside the app, and get AI-driven evaluation with detailed answer review.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="input min-w-[240px]" value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}>
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>{resume.title}</option>
                ))}
              </select>
              <button onClick={handleGenerate} className="btn-primary" disabled={generating || !selectedResumeId}>
                {generating ? 'Generating...' : 'Generate 50 MCQ Test'}
              </button>
              <button onClick={handleRunAnalyzer} className="btn-ghost" disabled={!selectedResumeId || evaluatingResumeId === selectedResumeId}>
                {evaluatingResumeId === selectedResumeId ? 'Analyzing...' : 'Refresh ATS Insight'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading assessment workspace...</p>
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            title="No resumes available"
            body="Create a resume in the builder first. This module uses the structured resume data already saved in your account."
          />
        ) : (
          <div className="grid lg:grid-cols-[300px,1fr] gap-6">
            <aside className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Attempts</h2>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tests.length}</span>
                </div>
                {tests.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tests yet. Generate one from a resume.</p>
                ) : (
                  <div className="space-y-2">
                    {tests.map((test) => (
                      <div
                        key={test._id}
                        className="relative w-full rounded-xl transition-all"
                        style={{
                          border: `1px solid ${selectedTest?._id === test._id ? 'var(--accent)' : 'var(--border)'}`,
                          background: selectedTest?._id === test._id ? 'var(--accent-dim)' : 'var(--bg-secondary)'
                        }}
                      >
                        <button
                          onClick={() => handleSelectTest(test._id)}
                          className="w-full text-left p-3 pr-10"
                        >
                          <p className="text-xs font-semibold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{test.title}</p>
                          <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{test.resumeTitle} • Attempt {test.attemptNumber}</p>
                          <div className="flex items-center justify-between">
                            <span className="badge-muted text-xs">{test.status.replace('_', ' ')}</span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {test.report?.overallScore ?? '--'}%
                            </span>
                          </div>
                        </button>
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(menuOpenId === test._id ? null : test._id)
                            }}
                            className="btn-icon w-8 h-8 rounded-md"
                          >
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>⋮</span>
                          </button>
                          {menuOpenId === test._id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                              <div className="absolute right-0 mt-1 w-36 rounded-lg shadow-xl z-50 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <button onClick={(e) => handleRenameTest(e, test._id, test.title)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                  <span style={{ fontSize: '14px' }}>✎</span> Rename
                                </button>
                                <button onClick={(e) => handleDeleteTest(e, test._id)} className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 flex items-center gap-2 transition-colors" style={{ color: 'var(--danger)' }}>
                                  <span style={{ fontSize: '14px' }}>🗑</span> Delete
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
                <div className="card p-4">
                  <h2 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Assessment Focus</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedTest.generatedFrom.skills || []).slice(0, 8).map((skill) => (
                          <span key={skill} className="badge text-xs" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Projects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedTest.generatedFrom.projects || []).slice(0, 4).map((project) => (
                          <span key={project} className="badge-muted text-xs">{project}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            <main className="space-y-5">
              {!selectedTest ? (
                <EmptyState
                  title="No active assessment selected"
                  body="Generate a personalized test from one of your saved resumes to begin."
                  action={handleGenerate}
                  actionLabel="Generate Test"
                />
              ) : (
                <>
                  <div className="card p-5">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge-muted text-xs">{selectedTest.status.replace('_', ' ')}</span>
                          <span className="badge-muted text-xs">Attempt {selectedTest.attemptNumber}</span>
                          <span className="badge-muted text-xs capitalize">{selectedTest.difficulty}</span>
                        </div>
                        <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedTest.title}</h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                          {selectedTest.resumeTitle} • {selectedTest.questions.length} MCQ questions • 60 minutes
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {selectedTest.status === 'draft' && (
                          <button onClick={handleStart} className="btn-primary">Start Test</button>
                        )}
                        {selectedTest.status === 'in_progress' && (
                          <>
                            <div className="px-4 py-2 rounded-xl" style={{ background: remainingSeconds < 600 ? 'var(--danger-bg)' : 'var(--bg-secondary)', color: remainingSeconds < 600 ? 'var(--danger)' : 'var(--text-primary)' }}>
                              <span className="text-xs uppercase tracking-wide" style={{ color: 'inherit' }}>Time left</span>
                              <p className="font-display text-lg">{formatClock(remainingSeconds)}</p>
                            </div>
                            <button onClick={() => handleSaveAnswer()} className="btn-ghost" disabled={saving}>
                              {saving ? 'Saving...' : 'Save Answer'}
                            </button>
                            <button onClick={() => handleSubmit(false)} className="btn-primary" disabled={submitting}>
                              {submitting ? 'Submitting...' : 'Submit Test'}
                            </button>
                          </>
                        )}
                        {selectedTest.status === 'submitted' && (
                          <button onClick={handleRetake} className="btn-primary">Retake with New Questions</button>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        <span>Answer progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                      </div>
                    </div>
                  </div>

                  {selectedTest.status !== 'submitted' ? (
                    <div className="grid xl:grid-cols-[1fr,220px] gap-5">
                      <div className="card p-6">
                        {activeQuestion && (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                                  Question {activeIndex + 1} of {selectedTest.questions.length}
                                </p>
                                <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {activeQuestion.skill} • {activeQuestion.type}
                                </h3>
                              </div>
                              <span className="badge-muted text-xs capitalize">{activeQuestion.difficulty}</span>
                            </div>

                            {activeQuestion.context && (
                              <div className="rounded-xl p-3 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeQuestion.context}</p>
                              </div>
                            )}

                            <p className="text-base leading-7 mb-6" style={{ color: 'var(--text-primary)' }}>{activeQuestion.prompt}</p>

                            {activeQuestion.type === 'mcq' && (
                              <div className="space-y-3">
                                {activeQuestion.options.map((option) => (
                                  <label
                                    key={option.key}
                                    className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
                                    style={{
                                      border: `1px solid ${selectedOptionKey === option.key ? 'var(--accent)' : 'var(--border)'}`,
                                      background: selectedOptionKey === option.key ? 'var(--accent-dim)' : 'var(--bg-secondary)'
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      checked={selectedOptionKey === option.key}
                                      onChange={() => setSelectedOptionKey(option.key)}
                                      className="mt-1"
                                    />
                                    <div>
                                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{option.key}</p>
                                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{option.text}</p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-6">
                              <button
                                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                                className="btn-ghost"
                                disabled={activeIndex === 0}
                              >
                                Previous
                              </button>
                              <div className="flex gap-3">
                                <button onClick={() => handleSaveAnswer()} className="btn-ghost" disabled={saving}>
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => handleSaveAnswer({ nextIndex: Math.min(selectedTest.questions.length - 1, activeIndex + 1) })}
                                  className="btn-primary"
                                  disabled={activeIndex === selectedTest.questions.length - 1}
                                >
                                  Save & Next
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="card p-4 h-fit" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Question Map</h3>
                        <div className="grid grid-cols-5 xl:grid-cols-5 gap-1.5">
                          {selectedTest.questions.map((question, index) => {
                            const answered = Boolean(question.userAnswer?.selectedOptionKey)
                            return (
                              <button
                                key={question.questionId}
                                onClick={() => setActiveIndex(index)}
                                className="h-9 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                  background: activeIndex === index
                                    ? 'var(--accent)'
                                    : answered
                                      ? 'var(--success-bg)'
                                      : 'var(--bg-secondary)',
                                  color: activeIndex === index
                                    ? '#0d0c0a'
                                    : answered
                                      ? 'var(--success)'
                                      : 'var(--text-secondary)',
                                  border: `1px solid ${activeIndex === index ? 'var(--accent)' : 'var(--border)'}`
                                }}
                              >
                                {index + 1}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* ── Tab Navigation ── */}
                      <div className="card p-2 flex gap-2">
                        {[['score','📊 Score Overview'],['answers','📝 Answer Review'],['report','📋 Full Report']].map(([key, label]) => (
                          <button key={key} onClick={() => setReportTab(key)} className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: reportTab === key ? 'var(--accent)' : 'transparent', color: reportTab === key ? '#0d0c0a' : 'var(--text-secondary)' }}>{label}</button>
                        ))}
                      </div>

                      {/* ── TAB 1: Score Overview ── */}
                      {reportTab === 'score' && (<>
                      <div className="card p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div>
                            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Evaluation Summary</p>
                            <h3 className="font-display text-3xl font-bold" style={{ color: currentTone?.color || 'var(--text-primary)' }}>{selectedTest.report?.overallScore}% Overall</h3>
                            <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>{selectedTest.report?.careerFeedback?.finalSummary}</p>
                            {(() => { const qs = selectedTest.questions || []; const correct = qs.filter(q => q.userAnswer?.selectedOptionKey === q.correctAnswer?.optionKey).length; const wrong = qs.filter(q => q.userAnswer?.selectedOptionKey && q.userAnswer.selectedOptionKey !== q.correctAnswer?.optionKey).length; const skip = qs.length - correct - wrong; return (
                              <div className="flex gap-4 mt-4">
                                <span className="text-sm font-semibold" style={{color:'var(--success)'}}>✓ {correct} Correct</span>
                                <span className="text-sm font-semibold" style={{color:'var(--danger)'}}>✗ {wrong} Wrong</span>
                                <span className="text-sm font-semibold" style={{color:'var(--text-muted)'}}>— {skip} Skipped</span>
                              </div>
                            ); })()}
                          </div>
                          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                            {[['Accuracy', selectedTest.report?.accuracyLevel],['Logic', selectedTest.report?.logicalThinkingScore],['Problem Solving', selectedTest.report?.problemSolvingAbility],['Interview Ready', selectedTest.report?.careerFeedback?.interviewReadinessScore]].map(([label, value]) => (
                              <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                <p className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {selectedTest.report?.comparison && (
                        <div className="card p-5">
                          <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Attempt Comparison</h3>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Previous Score</p><p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedTest.report.comparison.previousOverallScore}%</p></div>
                            <div className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Delta</p><p className="text-lg font-semibold" style={{ color: selectedTest.report.comparison.delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>{selectedTest.report.comparison.delta >= 0 ? '+' : ''}{selectedTest.report.comparison.delta} pts</p></div>
                            <div className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Improved Skills</p><p className="text-sm" style={{ color: 'var(--text-primary)' }}>{(selectedTest.report.comparison.improvedSkills || []).join(', ') || 'None yet'}</p></div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-center"><button onClick={() => setReportTab('answers')} className="btn-primary">View All Answers →</button></div>
                      </>)}

                      {/* ── TAB 2: Answer Review ── */}
                      {reportTab === 'answers' && (<>
                      <div className="card p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>All Answers — Your Picks vs Correct</h3>
                        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Showing all {selectedTest.questions.length} questions.</p>
                        <div className="space-y-4">
                          {selectedTest.questions.map((question, qIdx) => {
                            const userKey = question.userAnswer?.selectedOptionKey || null
                            const correctKey = question.correctAnswer?.optionKey || ''
                            const isCorrect = userKey === correctKey
                            return (
                              <div key={question.questionId} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: `1px solid ${!userKey ? 'var(--text-muted)' : isCorrect ? 'var(--success)' : 'var(--danger)'}`, borderLeftWidth: '4px' }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: !userKey ? 'var(--bg-secondary)' : isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)', color: !userKey ? 'var(--text-muted)' : isCorrect ? 'var(--success)' : 'var(--danger)' }}>{!userKey ? '— Skipped' : isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
                                  <span className="badge-muted text-xs">Q{qIdx + 1}</span>
                                  <span className="badge-muted text-xs capitalize">{question.difficulty}</span>
                                  <span className="badge-muted text-xs">{question.skill}</span>
                                </div>
                                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{question.prompt}</p>
                                <div className="grid gap-2 mb-3">
                                  {question.options?.map((opt) => {
                                    const isUserPick = opt.key === userKey
                                    const isCorrectOpt = opt.key === correctKey
                                    let bg = 'transparent', bdr = '1px solid var(--border)', tc = 'var(--text-secondary)'
                                    if (isCorrectOpt) { bg = 'var(--success-bg)'; bdr = '1px solid var(--success)'; tc = 'var(--success)' }
                                    else if (isUserPick && !isCorrect) { bg = 'var(--danger-bg)'; bdr = '1px solid var(--danger)'; tc = 'var(--danger)' }
                                    return (<div key={opt.key} className="rounded-lg px-3 py-2 text-sm flex items-center gap-2" style={{ background: bg, border: bdr, color: tc }}><span className="font-bold">{opt.key}.</span><span>{opt.text}</span>{isCorrectOpt && <span className="ml-auto text-xs font-semibold">✓ Correct</span>}{isUserPick && !isCorrect && <span className="ml-auto text-xs font-semibold">Your pick</span>}</div>)
                                  })}
                                </div>
                                {question.correctAnswer?.explanation && (<p className="text-xs" style={{ color: 'var(--text-muted)' }}><strong>Explanation:</strong> {question.correctAnswer.explanation}</p>)}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex justify-center"><button onClick={() => setReportTab('report')} className="btn-primary">View Full Report →</button></div>
                      </>)}

                      {/* ── TAB 3: Full Report ── */}
                      {reportTab === 'report' && (<>
                      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
                      <div className="grid xl:grid-cols-2 gap-5">
                        <div className="card p-5">
                          <h3 className="font-display text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Skill Breakdown</h3>
                          <div className="space-y-3">
                            {(selectedTest.report?.skillBreakdown || []).map((skill) => { const tone = scoreTone(skill.accuracy || 0); return (
                              <div key={skill.skill} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                <div className="flex items-center justify-between mb-2"><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{skill.skill}</p><span className="badge text-xs" style={{ background: tone.bg, color: tone.color }}>{skill.accuracy}%</span></div>
                                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{skill.score} / {skill.maxScore} points</p>
                                {skill.weaknesses?.length > 0 && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Needs work: {skill.weaknesses.join(', ')}</p>}
                              </div>) })}
                          </div>
                        </div>
                        <div className="card p-5">
                          <h3 className="font-display text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weak Areas</h3>
                          <div className="flex flex-wrap gap-2 mb-5">{(selectedTest.report?.weakAreas || []).map((a) => (<span key={a} className="badge text-xs" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{a}</span>))}</div>
                          <h4 className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Roadmap</h4>
                          <div className="space-y-2">{(selectedTest.report?.careerFeedback?.learningRoadmap || []).map((item, i) => (<div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p></div>))}</div>
                        </div>
                      </div>
                      <div className="grid xl:grid-cols-2 gap-5">
                        <div className="card p-5">
                          <h3 className="font-display text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Mistake Analysis</h3>
                          <div className="space-y-3">{(selectedTest.report?.mistakeAnalysis || []).length === 0 ? (<p className="text-sm" style={{ color: 'var(--text-muted)' }}>No major mistakes detected.</p>) : ((selectedTest.report?.mistakeAnalysis || []).map((item) => (<div key={item.questionId} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{item.skill}</p><p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.prompt}</p><p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{item.explanation}</p><p className="text-sm" style={{ color: 'var(--text-primary)' }}>Correct approach: {item.correctApproach}</p></div>)))}</div>
                        </div>
                        <div className="card p-5">
                          <h3 className="font-display text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Career Feedback</h3>
                          <div className="space-y-4">{[['Resume Improvements', selectedTest.report?.careerFeedback?.resumeImprovements || []],['Skills To Focus', selectedTest.report?.careerFeedback?.skillsToFocus || []],['Project Suggestions', selectedTest.report?.careerFeedback?.projectSuggestions || []]].map(([label, items]) => (<div key={label}><p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p><div className="space-y-2">{items.map((item, i) => (<div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p></div>))}</div></div>))}</div>
                        </div>
                      </div>
                      </div>
                      </>)}
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
