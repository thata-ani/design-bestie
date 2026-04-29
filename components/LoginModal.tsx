'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useRef } from 'react'

export function LoginModal() {
  const { showLoginModal, closeLoginModal, signInWithGoogle } = useAuth()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeLoginModal])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = showLoginModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLoginModal])

  if (!showLoginModal) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && closeLoginModal()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 11, 24, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 18, 32, 0.95) 0%, rgba(4, 13, 30, 0.98) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 0 60px rgba(59, 130, 246, 0.1), 0 32px 64px rgba(0,0,0,0.5)',
        position: 'relative',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Close button */}
        <button
          onClick={closeLoginModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.4)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
          }}
        >
          ×
        </button>

        {/* Logo / Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
          fontSize: '24px',
        }}>
          ✦
        </div>

        {/* Heading */}
        <h2 style={{
          color: '#ffffff',
          fontSize: '22px',
          fontWeight: 700,
          margin: '0 0 8px 0',
          letterSpacing: '-0.3px',
        }}>
          Sign in to Design Besti
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0 0 32px 0',
        }}>
          Your senior design partner. Get brutal, research-backed feedback on your UI.
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 24px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            transition: 'all 0.2s ease',
            letterSpacing: '-0.1px',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(255,255,255,0.1)'
            btn.style.borderColor = 'rgba(59, 130, 246, 0.5)'
            btn.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.15)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(255,255,255,0.06)'
            btn.style.borderColor = 'rgba(255,255,255,0.12)'
            btn.style.boxShadow = 'none'
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Fine print */}
        <p style={{
          color: 'rgba(255,255,255,0.2)',
          fontSize: '12px',
          textAlign: 'center',
          margin: '20px 0 0 0',
          lineHeight: '1.5',
        }}>
          By signing in you agree to our terms. No spam, ever.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
