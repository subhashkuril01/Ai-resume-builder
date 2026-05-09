import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { resumeAPI } from '../../api'

export default function ResumeUploadButton({ onUploaded, className = '', label = 'Upload CV' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    try {
      const res = await resumeAPI.upload(file)
      toast.success('CV uploaded')
      onUploaded?.(res.resume)
    } catch (error) {
      toast.error(error?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.json,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`h-14 px-6 rounded-2xl bg-white/[0.03] border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all disabled:opacity-50 ${className}`}
        disabled={uploading}
      >
        {uploading ? 'Uploading' : label}
      </button>
    </>
  )
}
