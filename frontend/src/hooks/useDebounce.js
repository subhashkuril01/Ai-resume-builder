import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useAutoSave(resumeId, content, updateFn, delay = 2000) {
  const debouncedContent = useDebounce(content, delay)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    if (!resumeId || !debouncedContent) return
    setSaving(true)
    updateFn(resumeId, { content: debouncedContent, autoSave: true })
      .then(() => setLastSaved(new Date()))
      .catch(console.error)
      .finally(() => setSaving(false))
  }, [debouncedContent, resumeId])

  return { saving, lastSaved }
}
