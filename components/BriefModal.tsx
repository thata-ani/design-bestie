'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function BriefModal({ open, onClose }: Props) {
  const { user, openLoginModal } = useAuth()
  const [briefText, setBriefText] = useState('')
  const [navigating, setNavigating] = useState(false)

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

  useEffect(() => { if (!open) { setBriefText(''); setNavigating(false) } }, [open])

  if (!open) return null

  if (navigating) {
    return <div style={{ position: 'fixed', inset: 0, background: '#08090F', zIndex: 99999 }} />
  }

  const canSubmit = briefText.trim().length > 10

  const handleSubmit = () => {
    if (!user) { openLoginModal(); return }
    if (!canSubmit) return
    sessionStorage.setItem('designBestiPendingBrief', JSON.stringify({ briefText }))
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>Brief Mode</div>
            <h3 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.8px', color: '#fff', margin: 0, lineHeight: 1.15 }}>Start from requirements</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '8px 0 0' }}>Paste your brief — get screens, states, edge cases and questions to ask before designing.</p>
          </div>

          <textarea
            className="db-modal-input"
            placeholder="Feature description, user goals, constraints, anything that frames the design problem."
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            rows={10}
            autoFocus
            style={{
              width: '100%',
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '16px 18px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'inherit',
              lineHeight: 1.65,
              resize: 'vertical',
              marginBottom: 18,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.15s',
              minHeight: 240,
            }}
          />

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
            {canSubmit ? 'Generate brief →' : 'Add at least a sentence to begin'}
          </button>
        </div>
      </div>
    </>
  )
}
