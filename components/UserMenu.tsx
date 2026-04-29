'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'

export function UserMenu() {
  const { user, signOut, openLoginModal } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) {
    return (
      <button
        onClick={openLoginModal}
        style={{
          padding: '8px 18px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          color: '#60A5FA',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.2s',
          letterSpacing: '-0.1px',
        }}
        onMouseEnter={e => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.background = 'rgba(59, 130, 246, 0.2)'
          btn.style.borderColor = 'rgba(59, 130, 246, 0.5)'
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.background = 'rgba(59, 130, 246, 0.12)'
          btn.style.borderColor = 'rgba(59, 130, 246, 0.3)'
        }}
      >
        Sign in
      </button>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px 5px 5px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>
        <span>{name.split(' ')[0]}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.4 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'linear-gradient(135deg, rgba(6, 18, 32, 0.98), rgba(4, 13, 30, 0.99))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '8px',
          minWidth: '180px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          animation: 'slideDown 0.15s ease',
        }}>
          <div style={{
            padding: '8px 12px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '6px',
          }}>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{name}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '2px' }}>{user.email}</div>
          </div>

          <button
            onClick={async () => { setOpen(false); await signOut() }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            <span>↩</span> Sign out
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  )
}
