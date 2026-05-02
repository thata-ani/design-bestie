'use client'

import { useEffect, useState, useRef } from 'react'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  style: ['italic'],
})

const LANGUAGES = [
  { word: 'Design Besti',          lang: 'English'    },
  { word: 'デザイン ベスティ',        lang: 'Japanese'   },
  { word: 'Diseño Besti',          lang: 'Spanish'    },
  { word: 'Conception Besti',      lang: 'French'     },
  { word: '디자인 베스티',            lang: 'Korean'     },
  { word: 'تصميم بيستي',           lang: 'Arabic'     },
  { word: 'डिज़ाइन बेस्टी',          lang: 'Hindi'      },
  { word: 'డిజైన్ బెస్టి',           lang: 'Telugu'     },
  { word: 'डिझाइन बेस्टी',           lang: 'Marathi'    },
  { word: 'Дизайн Бести',          lang: 'Russian'    },
  { word: '设计贝斯蒂',               lang: 'Chinese'    },
  { word: 'Progettazione Besti',   lang: 'Italian'    },
  { word: 'Design Besti',          lang: 'German'     },
]

const CYCLE_INTERVAL = 420   // ms per word
const LOGO_HOLD      = 1200  // ms logo is fully visible before zoom
const DISSOLVE_MS    = 900   // ms zoom punch-through duration

interface Props {
  onComplete: () => void
}

type Phase = 'cycling' | 'logoReveal' | 'dissolve'

export default function SplashScreen({ onComplete }: Props) {
  const [currentWord, setCurrentWord]     = useState(LANGUAGES[0].word)
  const [currentLang, setCurrentLang]     = useState(LANGUAGES[0].lang)
  const [wordVisible, setWordVisible]     = useState(false)
  const [phase, setPhase]                 = useState<Phase>('cycling')
  const [logoOpacity, setLogoOpacity]     = useState(0)
  const [logoScale, setLogoScale]         = useState(0.88)
  const [logoZoom, setLogoZoom]           = useState(false)
  const [screenOpacity, setScreenOpacity] = useState(1)
  const indexRef = useRef(0)

  // ── Phase 1: cycle words ──────────────────────────────────────────────────
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setWordVisible(true)

      const iv = setInterval(() => {
        indexRef.current += 1

        if (indexRef.current >= LANGUAGES.length) {
          clearInterval(iv)
          setWordVisible(false)
          setTimeout(() => setPhase('logoReveal'), 400)
          return
        }

        setWordVisible(false)
        setTimeout(() => {
          setCurrentWord(LANGUAGES[indexRef.current].word)
          setCurrentLang(LANGUAGES[indexRef.current].lang)
          setWordVisible(true)
        }, 100)
      }, CYCLE_INTERVAL)

      return () => clearInterval(iv)
    }, 300)

    return () => clearTimeout(startDelay)
  }, [])

  // ── Phase 2: logo reveal ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'logoReveal') return

    const t1 = setTimeout(() => {
      setLogoOpacity(1)
      setLogoScale(1)
    }, 150)

    const t2 = setTimeout(() => {
      setPhase('dissolve')
    }, 150 + LOGO_HOLD)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  // ── Phase 3: zoom punch-through ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'dissolve') return
    // trigger logo zoom
    setLogoZoom(true)
    // fade screen out mid-zoom
    const t1 = setTimeout(() => setScreenOpacity(0), 200)
    const t2 = setTimeout(onComplete, DISSOLVE_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase, onComplete])

  return (
    <div style={s.overlay(screenOpacity)}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* ── Cycling word ── */}
      {phase === 'cycling' && (
        <div style={s.wordWrap}>
          <span className={playfair.className} style={s.word(wordVisible)}>
            {currentWord}
          </span>
          <span style={s.langLabel(wordVisible)}>
            {currentLang}
          </span>
        </div>
      )}

      {/* ── Logo emerges from dark ── */}
      {phase !== 'cycling' && (
        <div style={s.logoWrap(logoOpacity, logoScale, logoZoom)}>
          <svg
            viewBox="0 0 1024 1024"
            style={s.logoSvg}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="144" y="385.44" width="30" height="235.13" fill="#fff"/>
            <rect x="198" y="406.66" width="120" height="86.69" fill="#fff"/>
            <rect x="198" y="512.66" width="240" height="86.69" fill="#fff"/>
            <path fill="#fff" d="M396.59,412.1c6.82,3.62,12.11,8.71,15.85,15.25,3.74,6.54,5.61,14.1,5.61,22.66s-1.87,16.01-5.61,22.6c-3.74,6.59-9.05,11.69-15.91,15.31-6.87,3.62-14.82,5.43-23.86,5.43h-32.43v-86.69h32.43c9.13,0,17.1,1.81,23.92,5.43ZM389.93,468.54c4.44-4.36,6.66-10.54,6.66-18.52s-2.22-14.2-6.66-18.65c-4.44-4.45-10.65-6.67-18.62-6.67h-9.99v50.38h9.99c7.97,0,14.18-2.18,18.62-6.54Z"/>
            <path fill="#fff" d="M450.97,423.59v17.54h28.24v16.3h-28.24v19.02h31.94v16.92h-53.03v-86.69h53.03v16.92h-31.94Z"/>
            <path fill="#fff" d="M510.91,491.14c-5.02-2.06-9.02-5.1-12.02-9.14-3-4.03-4.58-8.89-4.75-14.57h22.44c.33,3.21,1.44,5.66,3.33,7.35,1.89,1.69,4.36,2.53,7.4,2.53s5.59-.72,7.4-2.16c1.81-1.44,2.71-3.44,2.71-5.99,0-2.14-.72-3.91-2.16-5.31-1.44-1.4-3.21-2.55-5.3-3.46-2.1-.91-5.08-1.93-8.94-3.09-5.59-1.73-10.15-3.46-13.69-5.19-3.54-1.73-6.58-4.28-9.13-7.66-2.55-3.38-3.82-7.78-3.82-13.21,0-8.07,2.92-14.39,8.76-18.96,5.84-4.57,13.44-6.85,22.81-6.85s17.22,2.28,23.06,6.85c5.84,4.57,8.96,10.93,9.37,19.08h-22.81c-.16-2.8-1.19-5-3.08-6.61-1.89-1.61-4.32-2.41-7.28-2.41-2.55,0-4.6.68-6.17,2.04-1.56,1.36-2.34,3.31-2.34,5.87,0,2.8,1.31,4.98,3.95,6.54,2.63,1.56,6.74,3.25,12.33,5.06,5.59,1.89,10.13,3.7,13.63,5.43,3.49,1.73,6.51,4.24,9.06,7.53,2.55,3.29,3.82,7.53,3.82,12.72s-1.25,9.43-3.76,13.46c-2.51,4.03-6.15,7.25-10.91,9.63-4.77,2.39-10.4,3.58-16.9,3.58s-12-1.03-17.02-3.09Z"/>
            <path fill="#fff" d="M593.53,406.67v86.69h-21.09v-86.69h21.09Z"/>
            <path fill="#fff" d="M666.29,434.08c-1.56-2.88-3.8-5.08-6.72-6.61-2.92-1.52-6.35-2.28-10.3-2.28-6.82,0-12.29,2.24-16.4,6.73-4.11,4.49-6.17,10.48-6.17,17.97,0,7.99,2.16,14.22,6.47,18.71,4.32,4.49,10.25,6.73,17.82,6.73,5.18,0,9.56-1.32,13.13-3.95,3.58-2.63,6.18-6.42,7.83-11.36h-26.76v-15.56h45.87v19.63c-1.56,5.27-4.21,10.17-7.95,14.7-3.74,4.53-8.49,8.19-14.24,10.99-5.76,2.8-12.25,4.2-19.48,4.2-8.55,0-16.18-1.87-22.88-5.62-6.7-3.75-11.92-8.95-15.66-15.62-3.74-6.67-5.61-14.28-5.61-22.85s1.87-16.2,5.61-22.91c3.74-6.71,8.94-11.94,15.6-15.68,6.66-3.75,14.26-5.62,22.81-5.62,10.36,0,19.09,2.51,26.2,7.53,7.11,5.02,11.82,11.98,14.12,20.87h-23.31Z"/>
            <path fill="#fff" d="M780.23,493.36h-21.09l-35.27-53.47v53.47h-21.09v-86.69h21.09l35.27,53.72v-53.72h21.09v86.69Z"/>
            <path fill="#fff" d="M526.58,562.72c3.04,3.91,4.57,8.38,4.57,13.4,0,7.25-2.53,12.99-7.59,17.23-5.06,4.24-12.12,6.36-21.18,6.36h-40.38v-86.69h39.02c8.81,0,15.7,2.02,20.68,6.05,4.98,4.03,7.47,9.51,7.47,16.42,0,5.11-1.34,9.34-4.01,12.72-2.68,3.38-6.24,5.72-10.68,7.04,5.02,1.07,9.06,3.56,12.1,7.47ZM483.12,548.08h13.83c3.46,0,6.11-.76,7.96-2.28,1.85-1.52,2.78-3.77,2.78-6.73s-.93-5.23-2.78-6.79c-1.85-1.56-4.51-2.35-7.96-2.35h-13.83v18.15ZM506.89,580.25c1.93-1.61,2.9-3.93,2.9-6.98s-1.01-5.43-3.03-7.16c-2.02-1.73-4.8-2.59-8.34-2.59h-15.31v19.14h15.56c3.54,0,6.28-.8,8.21-2.41Z"/>
            <path fill="#fff" d="M564.5,529.93v17.54h28.28v16.3h-28.28v19.02h31.98v16.92h-53.1v-86.69h53.1v16.92h-31.98Z"/>
            <path fill="#fff" d="M624.51,597.48c-5.02-2.06-9.04-5.1-12.04-9.14-3.01-4.03-4.59-8.89-4.75-14.57h22.48c.33,3.21,1.44,5.66,3.33,7.35,1.89,1.69,4.36,2.53,7.41,2.53s5.6-.72,7.41-2.16c1.81-1.44,2.72-3.44,2.72-5.99,0-2.14-.72-3.91-2.16-5.31-1.44-1.4-3.21-2.55-5.31-3.46-2.1-.91-5.08-1.93-8.95-3.09-5.6-1.73-10.17-3.46-13.71-5.19-3.54-1.73-6.59-4.28-9.14-7.66-2.55-3.38-3.83-7.78-3.83-13.21,0-8.07,2.92-14.39,8.77-18.96,5.84-4.57,13.46-6.85,22.85-6.85s17.25,2.28,23.09,6.85c5.84,4.57,8.97,10.93,9.38,19.08h-22.85c-.17-2.8-1.19-5-3.09-6.61-1.89-1.61-4.32-2.41-7.29-2.41-2.55,0-4.61.68-6.17,2.04-1.57,1.36-2.35,3.31-2.35,5.87,0,2.8,1.32,4.98,3.95,6.54,2.63,1.56,6.75,3.25,12.35,5.06,5.6,1.89,10.15,3.7,13.65,5.43,3.5,1.73,6.52,4.24,9.08,7.53,2.55,3.29,3.83,7.53,3.83,12.72s-1.26,9.43-3.77,13.46c-2.51,4.04-6.16,7.25-10.93,9.63-4.78,2.39-10.42,3.58-16.92,3.58s-12.02-1.03-17.04-3.09Z"/>
            <path fill="#fff" d="M748.5,513.01v16.92h-22.97v69.77h-21.12v-69.77h-22.97v-16.92h67.05Z"/>
            <path fill="#fff" d="M780.23,513.01v86.69h-21.12v-86.69h21.12Z"/>
          </svg>
        </div>
      )}

      <button
        style={s.skip}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
        onClick={onComplete}
      >
        skip
      </button>
    </div>
  )
}

const s = {
  overlay: (opacity: number): React.CSSProperties => ({
    position:       'fixed',
    inset:          0,
    zIndex:         9999,
    background:     '#08090F',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    opacity,
    transition:     opacity < 1 ? `opacity ${DISSOLVE_MS}ms ease` : 'none',
    pointerEvents:  opacity < 0.05 ? 'none' : 'auto',
    overflow:       'hidden',
  }),

  orb1: {
    position:      'absolute',
    width:         '500px',
    height:        '500px',
    borderRadius:  '50%',
    background:    'rgba(29,78,216,0.10)',
    top:           '-120px',
    right:         '-100px',
    filter:        'blur(70px)',
    pointerEvents: 'none',
  } as React.CSSProperties,

  orb2: {
    position:      'absolute',
    width:         '300px',
    height:        '300px',
    borderRadius:  '50%',
    background:    'rgba(55,138,221,0.06)',
    bottom:        '-80px',
    left:          '-60px',
    filter:        'blur(60px)',
    pointerEvents: 'none',
  } as React.CSSProperties,

  wordWrap: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            '14px',
    pointerEvents:  'none',
  } as React.CSSProperties,

  word: (visible: boolean): React.CSSProperties => ({
    fontSize:      'clamp(52px, 9vw, 120px)',
    fontWeight:    400,
    fontStyle:     'italic',
    color:         '#fff',
    letterSpacing: '-3px',
    lineHeight:    1,
    opacity:       visible ? 1 : 0,
    transform:     visible
      ? 'scale(1) translateY(0px)'
      : 'scale(0.72) translateY(22px)',
    transition:    'opacity 0.22s ease, transform 0.26s ease',
    userSelect:    'none',
    textAlign:     'center',
    display:       'block',
  }),

  langLabel: (visible: boolean): React.CSSProperties => ({
    fontSize:      '11px',
    color:         'rgba(255,255,255,0.22)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    opacity:       visible ? 1 : 0,
    transition:    'opacity 0.18s ease',
    userSelect:    'none',
    fontFamily:    'var(--font-geist-sans), sans-serif',
  }),

  logoWrap: (opacity: number, scale: number, zoom: boolean): React.CSSProperties => ({
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    opacity:        zoom ? 0 : opacity,
    transform:      zoom ? 'scale(4)' : `scale(${scale})`,
    transition:     zoom
      ? `opacity ${DISSOLVE_MS * 0.7}ms ease, transform ${DISSOLVE_MS}ms ease`
      : 'opacity 1.4s ease, transform 1.4s ease',
    pointerEvents:  'none',
  }),

  logoSvg: {
    width:  'clamp(220px, 32vw, 400px)',
    height: 'auto',
  } as React.CSSProperties,

  skip: {
    position:      'absolute',
    bottom:        '28px',
    right:         '32px',
    background:    'transparent',
    border:        'none',
    color:         'rgba(255,255,255,0.18)',
    fontSize:      '12px',
    letterSpacing: '0.06em',
    cursor:        'pointer',
    fontFamily:    'var(--font-geist-sans), sans-serif',
    padding:       '6px 10px',
    transition:    'color 0.2s',
  } as React.CSSProperties,
}
