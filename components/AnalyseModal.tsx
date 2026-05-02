'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AnalyseModal({ open, onClose }: Props) {
  const { user, openLoginModal } = useAuth()
  const [fileName, setFileName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [context, setContext] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setFileName(''); setImagePreview(null); setContext(''); setIsDragging(false); setNavigating(false)
    }
  }, [open])

  if (!open) return null

  if (navigating) {
    return <div style={{ position: 'fixed', inset: 0, background: '#08090F', zIndex: 99999 }} />
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const canSubmit = !!imagePreview

  const handleSubmit = () => {
    if (!user) { openLoginModal(); return }
    if (!canSubmit) return
    sessionStorage.setItem('designBestiPendingAnalyse', JSON.stringify({
      imagePreview, fileName, context,
    }))
    setNavigating(true)
    window.location.href = '/analyse'
  }

  return (
    <>
      <style>{`
        .db-modal-input::placeholder { color: rgba(255,255,255,0.3); }
        .db-modal-input:focus { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); }
      `}</style>
      <div
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
          fontFamily: 'var(--font-geist-sans), sans-serif',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%', maxWidth: 600, minHeight: 500,
            background: 'rgba(20,22,35,0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 28,
            padding: '52px 40px',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset, 0 40px 80px rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 18, right: 18,
              background: 'transparent', border: 'none', cursor: 'pointer',
              width: 32, height: 32, borderRadius: 8,
              color: 'rgba(255,255,255,0.4)', fontSize: 22, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >×</button>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>UX Audit</div>
            <h3 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.8px', color: '#fff', margin: 0, lineHeight: 1.15 }}>Analyse your design</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '8px 0 0' }}>Upload a screenshot — get senior-level critique in 60 seconds.</p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.55)' : imagePreview ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: 16,
              padding: imagePreview ? '20px 24px' : '40px 32px',
              marginBottom: 14,
              cursor: 'pointer',
              background: isDragging ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
              minHeight: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {imagePreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <div style={{ width: 88, height: 88, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '0.5px solid rgba(255,255,255,0.1)', background: '#000' }}>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>{fileName}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Click to replace · drag a new file to swap</p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 14px', opacity: 0.7 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5 7.5 12M12 7.5V21" />
                </svg>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 6, letterSpacing: '-0.1px' }}>Drop your design here</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>or click to upload  ·  PNG · JPG · PDF</div>
              </div>
            )}
          </div>

          <textarea
            className="db-modal-input"
            placeholder="Optional context — what is this screen, who is it for?"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 16px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              marginBottom: context.trim().length > 0 && !imagePreview ? 8 : 18,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.15s',
              minHeight: 84,
            }}
          />

          {context.trim().length > 0 && !imagePreview && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.01em' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ flexShrink: 0, opacity: 0.7 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span>Add an image above to analyse</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%',
              background: canSubmit ? '#fff' : 'rgba(255,255,255,0.08)',
              color: canSubmit ? '#08090F' : 'rgba(255,255,255,0.55)',
              border: canSubmit ? 'none' : '1px solid rgba(255,255,255,0.15)',
              padding: '16px 0',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'default',
              letterSpacing: '-0.2px',
              transition: 'all 0.2s',
              marginTop: 'auto',
            }}
          >
            {canSubmit ? 'Analyse my design →' : 'Upload an image to begin'}
          </button>
        </div>
      </div>
    </>
  )
}
