"use client";
import { useRef } from "react";
import html2canvas from "html2canvas";

function LogoSVG({ opacity = 1, style }: { opacity?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="144 380 637 240" xmlns="http://www.w3.org/2000/svg" style={{ fill: '#fff', opacity, ...style }}>
      <rect x="144" y="385.44" width="30" height="235.13"/>
      <rect x="198" y="406.66" width="120" height="86.69"/>
      <rect x="198" y="512.66" width="240" height="86.69"/>
      <path d="M396.59,412.1c6.82,3.62,12.11,8.71,15.85,15.25,3.74,6.54,5.61,14.1,5.61,22.66s-1.87,16.01-5.61,22.6c-3.74,6.59-9.05,11.69-15.91,15.31-6.87,3.62-14.82,5.43-23.86,5.43h-32.43v-86.69h32.43c9.13,0,17.1,1.81,23.92,5.43ZM389.93,468.54c4.44-4.36,6.66-10.54,6.66-18.52s-2.22-14.2-6.66-18.65c-4.44-4.45-10.65-6.67-18.62-6.67h-9.99v50.38h9.99c7.97,0,14.18-2.18,18.62-6.54Z"/>
      <path d="M450.97,423.59v17.54h28.24v16.3h-28.24v19.02h31.94v16.92h-53.03v-86.69h53.03v16.92h-31.94Z"/>
      <path d="M510.91,491.14c-5.02-2.06-9.02-5.1-12.02-9.14-3-4.03-4.58-8.89-4.75-14.57h22.44c.33,3.21,1.44,5.66,3.33,7.35,1.89,1.69,4.36,2.53,7.4,2.53s5.59-.72,7.4-2.16c1.81-1.44,2.71-3.44,2.71-5.99,0-2.14-.72-3.91-2.16-5.31-1.44-1.4-3.21-2.55-5.3-3.46-2.1-.91-5.08-1.93-8.94-3.09-5.59-1.73-10.15-3.46-13.69-5.19-3.54-1.73-6.58-4.28-9.13-7.66-2.55-3.38-3.82-7.78-3.82-13.21,0-8.07,2.92-14.39,8.76-18.96,5.84-4.57,13.44-6.85,22.81-6.85s17.22,2.28,23.06,6.85c5.84,4.57,8.96,10.93,9.37,19.08h-22.81c-.16-2.8-1.19-5-3.08-6.61-1.89-1.61-4.32-2.41-7.28-2.41-2.55,0-4.6.68-6.17,2.04-1.56,1.36-2.34,3.31-2.34,5.87,0,2.8,1.31,4.98,3.95,6.54,2.63,1.56,6.74,3.25,12.33,5.06,5.59,1.89,10.13,3.7,13.63,5.43,3.49,1.73,6.51,4.24,9.06,7.53,2.55,3.29,3.82,7.53,3.82,12.72s-1.25,9.43-3.76,13.46c-2.51,4.03-6.15,7.25-10.91,9.63-4.77,2.39-10.4,3.58-16.9,3.58s-12-1.03-17.02-3.09Z"/>
      <path d="M593.53,406.67v86.69h-21.09v-86.69h21.09Z"/>
      <path d="M666.29,434.08c-1.56-2.88-3.8-5.08-6.72-6.61-2.92-1.52-6.35-2.28-10.3-2.28-6.82,0-12.29,2.24-16.4,6.73-4.11,4.49-6.17,10.48-6.17,17.97,0,7.99,2.16,14.22,6.47,18.71,4.32,4.49,10.25,6.73,17.82,6.73,5.18,0,9.56-1.32,13.13-3.95,3.58-2.63,6.18-6.42,7.83-11.36h-26.76v-15.56h45.87v19.63c-1.56,5.27-4.21,10.17-7.95,14.7-3.74,4.53-8.49,8.19-14.24,10.99-5.76,2.8-12.25,4.2-19.48,4.2-8.55,0-16.18-1.87-22.88-5.62-6.7-3.75-11.92-8.95-15.66-15.62-3.74-6.67-5.61-14.28-5.61-22.85s1.87-16.2,5.61-22.91c3.74-6.71,8.94-11.94,15.6-15.68,6.66-3.75,14.26-5.62,22.81-5.62,10.36,0,19.09,2.51,26.2,7.53,7.11,5.02,11.82,11.98,14.12,20.87h-23.31Z"/>
      <path d="M780.23,493.36h-21.09l-35.27-53.47v53.47h-21.09v-86.69h21.09l35.27,53.72v-53.72h21.09v86.69Z"/>
      <path d="M526.58,562.72c3.04,3.91,4.57,8.38,4.57,13.4,0,7.25-2.53,12.99-7.59,17.23-5.06,4.24-12.12,6.36-21.18,6.36h-40.38v-86.69h39.02c8.81,0,15.7,2.02,20.68,6.05,4.98,4.03,7.47,9.51,7.47,16.42,0,5.11-1.34,9.34-4.01,12.72-2.68,3.38-6.24,5.72-10.68,7.04,5.02,1.07,9.06,3.56,12.1,7.47ZM483.12,548.08h13.83c3.46,0,6.11-.76,7.96-2.28,1.85-1.52,2.78-3.77,2.78-6.73s-.93-5.23-2.78-6.79c-1.85-1.56-4.51-2.35-7.96-2.35h-13.83v18.15ZM506.89,580.25c1.93-1.61,2.9-3.93,2.9-6.98s-1.01-5.43-3.03-7.16c-2.02-1.73-4.8-2.59-8.34-2.59h-15.31v19.14h15.56c3.54,0,6.28-.8,8.21-2.41Z"/>
      <path d="M564.5,529.93v17.54h28.28v16.3h-28.28v19.02h31.98v16.92h-53.1v-86.69h53.1v16.92h-31.98Z"/>
      <path d="M624.51,597.48c-5.02-2.06-9.04-5.1-12.04-9.14-3.01-4.03-4.59-8.89-4.75-14.57h22.48c.33,3.21,1.44,5.66,3.33,7.35,1.89,1.69,4.36,2.53,7.41,2.53s5.6-.72,7.41-2.16c1.81-1.44,2.72-3.44,2.72-5.99,0-2.14-.72-3.91-2.16-5.31-1.44-1.4-3.21-2.55-5.31-3.46-2.1-.91-5.08-1.93-8.95-3.09-5.6-1.73-10.17-3.46-13.71-5.19-3.54-1.73-6.59-4.28-9.14-7.66-2.55-3.38-3.83-7.78-3.83-13.21,0-8.07,2.92-14.39,8.77-18.96,5.84-4.57,13.46-6.85,22.85-6.85s17.25,2.28,23.09,6.85c5.84,4.57,8.97,10.93,9.38,19.08h-22.85c-.17-2.8-1.19-5-3.09-6.61-1.89-1.61-4.32-2.41-7.29-2.41-2.55,0-4.61.68-6.17,2.04-1.57,1.36-2.35,3.31-2.35,5.87,0,2.8,1.32,4.98,3.95,6.54,2.63,1.56,6.75,3.25,12.35,5.06,5.6,1.89,10.15,3.7,13.65,5.43,3.5,1.73,6.52,4.24,9.08,7.53,2.55,3.29,3.83,7.53,3.83,12.72s-1.26,9.43-3.77,13.46c-2.51,4.04-6.16,7.25-10.93,9.63-4.78,2.39-10.42,3.58-16.92,3.58s-12.02-1.03-17.04-3.09Z"/>
      <path d="M748.5,513.01v16.92h-22.97v69.77h-21.12v-69.77h-22.97v-16.92h67.05Z"/>
      <path d="M780.23,513.01v86.69h-21.12v-86.69h21.12Z"/>
    </svg>
  )
}

type Props = {
  battle: { creator_name: string; challenger_name: string | null; winner: string | null; slug: string; };
  onClose: () => void;
};

export default function WinnerCertificate({ battle, onClose }: Props) {
  const certRef = useRef<HTMLDivElement>(null);

  const downloadPNG = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#F8F5EE' });
    const link = document.createElement('a');
    link.download = 'design-besti-victory.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareText = `I just won a Design Roast Battle on Design Besti! 🏆 Think you can beat me? designbesti.com/battle/${battle.slug}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
      <button onClick={onClose} style={{ position: 'fixed', top: '20px', right: '20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>✕ Close</button>

      <div ref={certRef} style={{ display: 'grid', gridTemplateColumns: '1fr 160px', background: '#F8F5EE', borderRadius: '10px', overflow: 'visible', minHeight: '440px', fontFamily: 'Georgia, serif', position: 'relative' }}>

        {/* Left section */}
        <div style={{ padding: '44px 40px 28px', position: 'relative', overflow: 'hidden', borderRadius: '10px 0 0 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, pointerEvents: 'none', zIndex: 0, width: '65%' }}>
            <LogoSVG style={{ width: '100%', height: 'auto', fill: '#1a1a2e' }} opacity={1} />
          </div>

          {/* Corner accents */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', width: '28px', height: '28px', borderTop: '1.5px solid #c9a84c', borderLeft: '1.5px solid #c9a84c' }} />
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '28px', height: '28px', borderBottom: '1.5px solid #c9a84c', borderLeft: '1.5px solid #c9a84c' }} />

          {/* Main content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '9px', color: '#aaa', letterSpacing: '1px', marginBottom: '18px', fontFamily: 'sans-serif' }}>
              DATE: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', letterSpacing: '2px', marginBottom: '18px', fontFamily: 'sans-serif' }}>CERTIFICATE OF VICTORY</div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', fontFamily: 'sans-serif' }}>This certifies that</div>
            <div style={{ fontSize: '34px', fontWeight: 700, color: '#1a1a2e', marginBottom: '14px', lineHeight: 1.1 }}>{battle.creator_name}</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.9, marginBottom: '14px', fontFamily: 'sans-serif' }}>
              has won the <strong style={{ color: '#1a1a2e' }}>Design Roast Battle</strong> against {battle.challenger_name || 'Challenger'},<br />
              achieving a decisive score of <strong style={{ color: '#1a1a2e' }}>7 – 4</strong>,<br />
              as judged by the AI Roast Engine on <span style={{ color: '#7c3aed', fontWeight: 600 }}>Design Besti</span>
            </div>
            <div style={{ fontSize: '11px', color: '#777', fontStyle: 'italic', lineHeight: 1.7, borderLeft: '2px solid #c9a84c', paddingLeft: '12px' }}>
              "Superior design thinking — a decisive and well-earned victory."
            </div>
          </div>

          {/* Signatures — pinned to bottom */}
          <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid #e0d8c8', paddingTop: '16px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '16px', color: '#1a1a2e', fontStyle: 'italic', marginBottom: '4px' }}>Design Besti</div>
              <div style={{ width: '90px', height: '0.5px', background: '#bbb', marginBottom: '4px' }} />
              <div style={{ fontSize: '8px', color: '#aaa', letterSpacing: '1px', fontFamily: 'sans-serif' }}>AI JUDGE</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', color: '#1a1a2e', fontStyle: 'italic', marginBottom: '4px' }}>Roast Engine</div>
              <div style={{ width: '90px', height: '0.5px', background: '#bbb', marginBottom: '4px' }} />
              <div style={{ fontSize: '8px', color: '#aaa', letterSpacing: '1px', fontFamily: 'sans-serif' }}>CERTIFIED RESULT</div>
            </div>
          </div>
        </div>

        {/* Right dark strip */}
        <div style={{ background: '#1a0a2e', borderRadius: '0 10px 10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '32px 0', position: 'relative' }}>

          {/* Rotated text — truly centered */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', whiteSpace: 'nowrap', fontSize: '8px', color: 'rgba(255,255,255,0.12)', letterSpacing: '4px', fontFamily: 'sans-serif' }}>DESIGN ROAST BATTLE</div>

          <div />

          {/* Small logo at bottom */}
          <div style={{ padding: '0 16px', width: '100%', textAlign: 'center' }}>
            <LogoSVG style={{ width: '70%', height: 'auto', display: 'block', margin: '0 auto' }} opacity={0.6} />
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '6px', fontFamily: 'sans-serif' }}>designbesti.com</div>
          </div>
        </div>

        {/* Trophy seal — outside both columns, on the border */}
        <div style={{ position: 'absolute', top: '50%', right: '160px', transform: 'translate(50%, -50%)', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle, #a78bfa 0%, #5a2d8a 50%, #2d1054 100%)', border: '4px solid #F8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', boxShadow: '0 0 28px rgba(167,139,250,0.5)', zIndex: 10 }}>🏆</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', width: '794px', marginTop: '12px' }}>
        <button onClick={downloadPNG} style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' }}>⬇️ Save PNG</button>
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')} style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' }}>🐦 X / Twitter</button>
        <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://designbesti.com/battle/${battle.slug}`)}`, '_blank')} style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' }}>💼 LinkedIn</button>
        <button onClick={() => navigator.clipboard.writeText(`https://designbesti.com/battle/${battle.slug}`)} style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' }}>🔗 Copy link</button>
      </div>

      <div style={{ width: '794px', marginTop: '8px', background: '#1a1a2e', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Think you can beat me? </span>
        <span onClick={() => navigator.clipboard.writeText(`https://designbesti.com/battle/${battle.slug}`)} style={{ fontSize: '12px', color: '#a855f7', fontWeight: 600, cursor: 'pointer' }}>Accept the challenge ↗</span>
      </div>
    </div>
  );
}
