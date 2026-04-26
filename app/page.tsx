"use client";
import React, { useEffect, useRef, useState } from "react";

const DESIGN_ICONS = [
  { id: 1, path: "M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z" },
  { id: 2, path: "M4 4l7 18 2.5-7L21 12.5z" },
  { id: 3, path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { id: 4, path: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z" },
  { id: 5, path: "M2 7V5a2 2 0 012-2h2M2 17v2a2 2 0 002 2h2M22 7V5a2 2 0 00-2-2h-2M22 17v2a2 2 0 01-2 2h-2M7 2v20M17 2v20M2 7h20M2 17h20" },
  { id: 6, path: "M4 7V4h16v3M9 20h6M12 4v16" },
  { id: 7, path: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" },
  { id: 8, path: "M21 10H3M21 6H3M21 14H3M21 18H3" },
  { id: 9, path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { id: 10, path: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2v16a8 8 0 000-16z" },
  { id: 11, path: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35M11 8v6M8 11h6" },
  { id: 12, path: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { id: 13, path: "M8 7l-4 5 4 5M16 7l4 5-4 5M3 12h18" },
  { id: 14, path: "M3 3l18 18M8 3v4M12 3v2M16 3v4M3 8h4M3 12h2M3 16h4" },
  { id: 15, path: "M6.13 1L6 16a2 2 0 002 2h15M1 6.13l15-.13a2 2 0 012 2V23" },
  { id: 16, path: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
];

const ALL_PERSONAS = [
  { name: "First-time User", emoji: "👋", desc: "No prior knowledge, relies on what they see" },
  { name: "Power User", emoji: "⚡", desc: "Wants speed, efficiency, no hand-holding" },
  { name: "Accessibility User", emoji: "♿", desc: "Screen reader, keyboard nav, high contrast" },
  { name: "Older User", emoji: "👴", desc: "Needs clarity, larger targets, familiar patterns" },
  { name: "Distracted User", emoji: "😵", desc: "Multitasking, interrupted, can't re-read" },
  { name: "Mobile User", emoji: "📱", desc: "One thumb, small screen, slow connection" },
  { name: "Non-native Speaker", emoji: "🌍", desc: "Struggles with jargon, idioms, dense text" },
];

const patternMeta: Record<string, { icon: string; color: string }> = {
  "F-Pattern": { icon: "F", color: "#6366F1" },
  "Z-Pattern": { icon: "Z", color: "#8B5CF6" },
  "Gutenberg Pattern": { icon: "G", color: "#0EA5E9" },
  "Spotted Pattern": { icon: "S", color: "#F59E0B" },
  "Layer Cake Pattern": { icon: "L", color: "#10B981" },
  "No Clear Pattern": { icon: "!", color: "#EF4444" },
};

function parseBullets(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((b: any) => String(b).replace(/^[•\-]\s*/, ""));
  if (typeof val === "string") return val.split("\n").filter((b) => b.trim()).map((b) => b.replace(/^[•\-]\s*/, ""));
  return [];
}

function getSeverityStyle(severity: string) {
  if (severity === "critical") return { color: "#FF3B30", bg: "#FFF5F4", label: "Critical" };
  if (severity === "high" || severity === "moderate") return { color: "#FF9500", bg: "#FFFBF0", label: "High" };
  if (severity === "medium" || severity === "minor") return { color: "#FF6B00", bg: "#FFF8F0", label: "Medium" };
  return { color: "#34C759", bg: "#F0FFF4", label: "Win" };
}

function HomeScreen({ onStart, onBrief, briefText, setBriefText, uploaded, fileName, imagePreview, fileInputRef, isDragging, setIsDragging, handleInputChange, handleDrop }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const iconsRef = useRef<any[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const initIcons = (w: number, h: number) => {
      const spacing = 22;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      iconsRef.current = [];
      const total = cols * rows;
      const pool: any[] = [];
      while (pool.length < total) {
        const shuffled = [...DESIGN_ICONS].sort(() => Math.random() - 0.5);
        pool.push(...shuffled);
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c + 0.5) * spacing;
          const by = (r + 0.5) * spacing;
          iconsRef.current.push({
            icon: pool[r * cols + c],
            x: bx + (Math.random() - 0.5) * 6,
            y: by + (Math.random() - 0.5) * 6,
            baseX: bx, baseY: by,
            size: 10 + Math.random() * 16,
            opacity: 0.14 + Math.random() * 0.10,
            vx: 0, vy: 0,
            rotation: (Math.random() - 0.5) * 0.5,
          });
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initIcons(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    const onMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      iconsRef.current.forEach((icon) => {
        const dx = icon.x - mx;
        const dy = icon.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          icon.vx += (dx / dist) * force * 4;
          icon.vy += (dy / dist) * force * 4;
        }
        icon.vx += (icon.baseX - icon.x) * 0.05;
        icon.vy += (icon.baseY - icon.y) * 0.05;
        icon.vx *= 0.82; icon.vy *= 0.82;
        icon.x += icon.vx; icon.y += icon.vy;
        ctx.save();
        ctx.translate(icon.x, icon.y);
        ctx.rotate(icon.rotation);
        ctx.strokeStyle = `rgba(255,255,255,${icon.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const scale = icon.size / 24;
        ctx.scale(scale, scale);
        ctx.translate(-12, -12);
        try { ctx.stroke(new Path2D(icon.icon.path)); } catch (_) {}
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#0F0F10", fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.35 }} />

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>
            <span style={{ color: "#fff", fontSize: 15 }}>✦</span>
          </div>
          <span style={{ fontWeight: 700, color: "#fff", fontSize: 17, letterSpacing: "-0.5px" }}>Design Bestie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>The design partner designers actually need</span>
        </div>
      </nav>

      {/* HERO TEXT */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "28px 24px 20px", flexShrink: 0 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, background: "#7C3AED", borderRadius: "50%", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#A78BFA", fontWeight: 600, letterSpacing: 0.5 }}>AI-Powered Design Partner</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-2px", lineHeight: 1.05 }}>
          Your design partner,<br /><span style={{ background: "linear-gradient(90deg,#A78BFA,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>from brief to launch</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", margin: 0, letterSpacing: "-0.2px" }}>
          Two powerful modes — choose where you are in your design process
        </p>
      </div>

      {/* CARDS */}
      <div style={{ position: "relative", zIndex: 5, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 40px 16px", overflow: "hidden" }}>

        {/* LEFT CARD — After Design — Purple */}
        <div style={{ flex: 1, maxWidth: 520, height: "100%", maxHeight: 520, display: "flex", flexDirection: "column", padding: "28px 28px 24px", background: "linear-gradient(145deg,#1A0A2E,#2D1054)", borderRadius: 24, border: "1px solid rgba(124,58,237,0.25)", boxShadow: "0 24px 60px rgba(45,10,78,0.5)", position: "relative", overflow: "hidden" }}>
          {/* Glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle,rgba(124,58,237,0.3),transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Left mascot — reviewer with magnifying glass */}
            <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-end", gap: 12 }}>
              <svg width="72" height="80" viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 16px rgba(124,58,237,0.5))", flexShrink: 0 }}>
                <defs>
                  <radialGradient id="lbodyG" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#8B5CF6"/>
                    <stop offset="100%" stopColor="#1A0A2E"/>
                  </radialGradient>
                  <radialGradient id="lfaceG" cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#C4B5FD"/>
                    <stop offset="100%" stopColor="#7C3AED"/>
                  </radialGradient>
                  <filter id="lglow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {/* Body */}
                <path d="M14 52 Q12 70 20 75 Q36 80 52 75 Q60 70 58 52 Q50 57 36 57 Q22 57 14 52Z" fill="url(#lbodyG)"/>
                {/* Neck */}
                <rect x="31" y="41" width="10" height="12" rx="5" fill="url(#lfaceG)"/>
                {/* Head */}
                <ellipse cx="36" cy="30" rx="18" ry="18" fill="url(#lfaceG)"/>
                {/* Head shine */}
                <ellipse cx="30" cy="23" rx="6" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-20 30 23)"/>
                {/* Eyes */}
                <circle cx="29" cy="29" r="4" fill="#1A0A2E"/>
                <circle cx="29" cy="29" r="2.5" fill="white" filter="url(#lglow)" opacity="0.9"/>
                <circle cx="30.2" cy="27.8" r="0.8" fill="#fff"/>
                <circle cx="43" cy="29" r="4" fill="#1A0A2E"/>
                <circle cx="43" cy="29" r="2.5" fill="white" filter="url(#lglow)" opacity="0.9"/>
                <circle cx="44.2" cy="27.8" r="0.8" fill="#fff"/>
                {/* Smile */}
                <path d="M30 36 Q36 41 42 36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Right arm holding magnifying glass */}
                <path d="M56 56 Q65 50 68 42" stroke="url(#lbodyG)" strokeWidth="7" strokeLinecap="round" fill="none"/>
                {/* Magnifying glass */}
                <circle cx="68" cy="36" r="9" stroke="#A78BFA" strokeWidth="2.5" fill="rgba(167,139,250,0.15)"/>
                <circle cx="68" cy="36" r="6" fill="rgba(124,58,237,0.2)"/>
                <line x1="74" y1="42" x2="80" y2="49" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Lens shine */}
                <circle cx="65" cy="33" r="2" fill="rgba(255,255,255,0.4)"/>
                {/* Left arm */}
                <path d="M16 56 Q8 50 6 42" stroke="url(#lbodyG)" strokeWidth="7" strokeLinecap="round" fill="none"/>
              </svg>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 20, padding: "4px 12px", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", letterSpacing: 1.5, textTransform: "uppercase" }}>After Design</span>
              </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.8px", lineHeight: 1.15 }}>Review your design.<br />Get expert critique.</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.6 }}>Upload any screen. Get research-backed issues, wins, stress test results and a stakeholder report in seconds.</p>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
              {[["🔍", "Issues & Wins"], ["🧪", "Stress Test"], ["🔥", "Roast Mode"], ["📊", "Stakeholder Report"]].map(([emoji, label]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#C4B5FD", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 20, padding: "4px 10px" }}><span>{emoji}</span>{label}</span>
              ))}
            </div>

            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{ border: `2px dashed ${isDragging ? "#A78BFA" : uploaded ? "#A78BFA" : "rgba(255,255,255,0.15)"}`, borderRadius: 14, padding: "16px", marginBottom: 12, cursor: "pointer", background: isDragging ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)", transition: "all 0.2s" }}
            >
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleInputChange} />
              {uploaded && imagePreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 52, height: 38, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
                    <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{fileName}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Click to change</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v13M12 3L8 7M12 3l4 4M3 18h18" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: 0 }}>Drop your screenshot here</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>PNG · JPG · PDF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={onStart} style={{ width: "100%", background: uploaded ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "rgba(255,255,255,0.07)", color: uploaded ? "#fff" : "rgba(255,255,255,0.3)", border: uploaded ? "none" : "1px solid rgba(255,255,255,0.1)", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: uploaded ? "pointer" : "default", transition: "all 0.25s", boxShadow: uploaded ? "0 4px 24px rgba(124,58,237,0.5)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {uploaded ? <>Analyse My Design <span style={{ fontSize: 17 }}>→</span></> : "Select a Screenshot to Begin"}
            </button>
          </div>
        </div>

        {/* CENTER MASCOT */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 10 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.1))" }} />
          {/* Main Bestie mascot */}
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.5))", cursor: "default" }}>
            <defs>
              <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#9B6FE8"/>
                <stop offset="100%" stopColor="#2D0A4E"/>
              </radialGradient>
              <radialGradient id="faceGrad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#C4A8F5"/>
                <stop offset="100%" stopColor="#7C3AED"/>
              </radialGradient>
              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6"/>
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Body */}
            <ellipse cx="45" cy="82" rx="26" ry="18" fill="url(#bodyGrad)" opacity="0.6"/>
            {/* Robe/body */}
            <path d="M22 68 Q20 95 28 102 Q45 108 62 102 Q70 95 68 68 Q60 74 45 74 Q30 74 22 68Z" fill="url(#bodyGrad)"/>
            {/* Body shine */}
            <path d="M30 72 Q35 78 45 77 Q55 78 60 72 Q55 70 45 70 Q35 70 30 72Z" fill="rgba(255,255,255,0.12)"/>
            {/* Neck */}
            <rect x="39" y="56" width="12" height="14" rx="6" fill="url(#faceGrad)"/>
            {/* Head */}
            <ellipse cx="45" cy="44" rx="22" ry="22" fill="url(#faceGrad)"/>
            {/* Head shine */}
            <ellipse cx="38" cy="36" rx="8" ry="6" fill="rgba(255,255,255,0.2)" transform="rotate(-20 38 36)"/>
            {/* Left eye */}
            <circle cx="37" cy="42" r="5" fill="#1A0A2E"/>
            <circle cx="37" cy="42" r="3.5" fill="url(#eyeGlow)" filter="url(#glow)"/>
            <circle cx="38.5" cy="40.5" r="1" fill="#fff"/>
            {/* Right eye */}
            <circle cx="53" cy="42" r="5" fill="#1A0A2E"/>
            <circle cx="53" cy="42" r="3.5" fill="url(#eyeGlow)" filter="url(#glow)"/>
            <circle cx="54.5" cy="40.5" r="1" fill="#fff"/>
            {/* Smile */}
            <path d="M38 51 Q45 57 52 51" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Star on forehead */}
            <text x="42" y="33" fontSize="10" fill="rgba(255,255,255,0.9)" fontWeight="bold">✦</text>
            {/* Left arm */}
            <path d="M23 72 Q14 66 12 58 Q11 52 16 50" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" fill="none"/>
            {/* Right arm */}
            <path d="M67 72 Q76 66 78 58 Q79 52 74 50" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" fill="none"/>
            {/* Left hand sparkle */}
            <circle cx="14" cy="49" r="4" fill="#A78BFA" filter="url(#glow)"/>
            <text x="10" y="53" fontSize="8" fill="#fff">✦</text>
            {/* Right hand sparkle */}
            <circle cx="76" cy="49" r="4" fill="#60A5FA" filter="url(#glow)"/>
            <text x="72" y="53" fontSize="8" fill="#fff">✦</text>
          </svg>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>or</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom,rgba(255,255,255,0.1),transparent)" }} />
        </div>

        {/* RIGHT CARD — Before Design — Navy */}
        <div style={{ flex: 1, maxWidth: 520, height: "100%", maxHeight: 520, display: "flex", flexDirection: "column", padding: "28px 28px 24px", background: "linear-gradient(145deg,#071428,#0D2444)", borderRadius: 24, border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 24px 60px rgba(10,37,64,0.5)", position: "relative", overflow: "hidden" }}>
          {/* Glow */}
          <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, background: "radial-gradient(circle,rgba(96,165,250,0.25),transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Right mascot — analyst with clipboard */}
            <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-end", gap: 12 }}>
              <svg width="72" height="80" viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 16px rgba(96,165,250,0.5))", flexShrink: 0 }}>
                <defs>
                  <radialGradient id="rbodyG" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="100%" stopColor="#071428"/>
                  </radialGradient>
                  <radialGradient id="rfaceG" cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#93C5FD"/>
                    <stop offset="100%" stopColor="#1D4ED8"/>
                  </radialGradient>
                  <filter id="rglow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {/* Body */}
                <path d="M14 52 Q12 70 20 75 Q36 80 52 75 Q60 70 58 52 Q50 57 36 57 Q22 57 14 52Z" fill="url(#rbodyG)"/>
                {/* Neck */}
                <rect x="31" y="41" width="10" height="12" rx="5" fill="url(#rfaceG)"/>
                {/* Head */}
                <ellipse cx="36" cy="30" rx="18" ry="18" fill="url(#rfaceG)"/>
                {/* Head shine */}
                <ellipse cx="30" cy="23" rx="6" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-20 30 23)"/>
                {/* Eyes — slightly different shape, more focused look */}
                <circle cx="29" cy="29" r="4" fill="#071428"/>
                <circle cx="29" cy="29" r="2.5" fill="white" filter="url(#rglow)" opacity="0.9"/>
                <circle cx="30.2" cy="27.8" r="0.8" fill="#fff"/>
                <circle cx="43" cy="29" r="4" fill="#071428"/>
                <circle cx="43" cy="29" r="2.5" fill="white" filter="url(#rglow)" opacity="0.9"/>
                <circle cx="44.2" cy="27.8" r="0.8" fill="#fff"/>
                {/* Slight smile */}
                <path d="M30 36 Q36 40 42 36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Right arm holding clipboard */}
                <path d="M56 56 Q64 50 66 42" stroke="url(#rbodyG)" strokeWidth="7" strokeLinecap="round" fill="none"/>
                {/* Clipboard */}
                <rect x="60" y="24" width="20" height="26" rx="3" fill="#0D2444" stroke="#60A5FA" strokeWidth="1.5"/>
                <rect x="66" y="21" width="8" height="5" rx="2" fill="#60A5FA"/>
                <line x1="63" y1="31" x2="77" y2="31" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
                <line x1="63" y1="35" x2="77" y2="35" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <line x1="63" y1="39" x2="72" y2="39" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
                {/* Left arm up */}
                <path d="M16 56 Q8 50 6 42" stroke="url(#rbodyG)" strokeWidth="7" strokeLinecap="round" fill="none"/>
              </svg>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 20, padding: "4px 12px", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD", letterSpacing: 1.5, textTransform: "uppercase" }}>Before Design</span>
              </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.8px", lineHeight: 1.15 }}>Understand your<br />requirements first.</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.6 }}>Paste what your PM or BA gave you — messy Slack message, doc, anything. Get every screen, state and edge case before Figma.</p>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
              {[["📱", "Screens Needed"], ["🔲", "Missing States"], ["⚠️", "Edge Cases"], ["❓", "Questions to Ask"]].map(([emoji, label]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#93C5FD", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 20, padding: "4px 10px" }}><span>{emoji}</span>{label}</span>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              placeholder="Paste requirements here — Slack message, BA doc, user story, anything..."
              style={{ width: "100%", height: 100, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.1)", padding: "12px 14px", fontSize: 13, color: "#fff", resize: "none", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", outline: "none", background: "rgba(255,255,255,0.05)", marginBottom: 12, caretColor: "#60A5FA" }}
            />

            <button onClick={onBrief} style={{ width: "100%", background: briefText.trim().length > 10 ? "linear-gradient(135deg,#1D4ED8,#0EA5E9)" : "rgba(255,255,255,0.07)", color: briefText.trim().length > 10 ? "#fff" : "rgba(255,255,255,0.3)", border: briefText.trim().length > 10 ? "none" : "1px solid rgba(255,255,255,0.1)", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: briefText.trim().length > 10 ? "pointer" : "default", transition: "all 0.25s", boxShadow: briefText.trim().length > 10 ? "0 4px 24px rgba(14,165,233,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {briefText.trim().length > 10 ? <>Generate Design Brief <span style={{ fontSize: 17 }}>→</span></> : "Paste your requirements above"}
            </button>
          </div>
        </div>
      </div>

      {/* SOCIAL PROOF + TRUST BAR */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 24px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex" }}>
            {["#7C3AED","#4F46E5","#0EA5E9","#10B981","#F59E0B"].map((c, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: "2px solid #0F0F10", marginLeft: i === 0 ? 0 : -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{["A","B","C","D","E"][i]}</div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Trusted by designers worldwide</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          {["50+ UX Laws", "WCAG 2.2", "Nielsen Heuristics", "Gestalt Principles", "Reading Patterns", "Business Impact"].map((b) => (
            <span key={b} style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "4px 12px" }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonaModal({ onClose, onRun }: { onClose: () => void; onRun: (p: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", maxWidth: 520, width: "90%", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1D1D1F", margin: 0, letterSpacing: "-0.8px" }}>Stress Test</h2>
            <p style={{ fontSize: 14, color: "#6E6E73", margin: "6px 0 0" }}>Pick 1–3 personas to test your design against</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#AEAEB2", fontSize: 22, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 0 20px", padding: "10px 14px", background: "#F5F5F7", borderRadius: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <span style={{ fontSize: 13, color: "#3A3A3C", lineHeight: 1.5 }}>Each persona analyses the same screen through a different lens — surfacing blind spots your standard review misses.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {ALL_PERSONAS.map((p) => {
            const isSel = selected.includes(p.name);
            const isDisabled = !isSel && selected.length >= 3;
            return (
              <button key={p.name} onClick={() => !isDisabled && toggle(p.name)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, border: isSel ? "2px solid #2D0A4E" : "1px solid #E5E5EA", background: isSel ? "rgba(45,10,78,0.04)" : isDisabled ? "#FAFAFA" : "#fff", cursor: isDisabled ? "default" : "pointer", textAlign: "left", opacity: isDisabled ? 0.45 : 1, transition: "all 0.15s" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F", marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#6E6E73" }}>{p.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: isSel ? "none" : "2px solid #D2D2D7", background: isSel ? "#2D0A4E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSel && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #D2D2D7", borderRadius: 12, padding: 13, fontSize: 15, color: "#6E6E73", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
          <button
            onClick={() => selected.length >= 1 && onRun(selected)}
            style={{ flex: 2, background: selected.length >= 1 ? "#2D0A4E" : "rgba(0,0,0,0.08)", color: selected.length >= 1 ? "#fff" : "#999", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: selected.length >= 1 ? "pointer" : "default", boxShadow: selected.length >= 1 ? "0 4px 20px rgba(45,10,78,0.25)" : "none", transition: "all 0.2s" }}
          >
            {selected.length === 0 ? "Select a persona to begin" : `Run Stress Test with ${selected.length} persona${selected.length > 1 ? "s" : ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue, expanded, onToggle, highlighted }: { issue: any; expanded: boolean; onToggle: () => void; highlighted?: boolean }) {
  const style = getSeverityStyle(issue.severity);
  const bullets = parseBullets(issue.learn_why || issue.learnWhy);
  return (
    <div style={{ background: highlighted ? `${style.bg}` : "#fff", border: highlighted ? `2px solid ${style.color}` : "1px solid #E5E5EA", borderLeft: `3px solid ${style.color}`, borderRadius: 10, overflow: "hidden", transition: "all 0.2s" }}>
      <button onClick={onToggle} style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 22, height: 22, background: style.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{issue.id}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F" }}>{issue.element}</span>
            {(issue.rule_violated || issue.law) && (
              <span style={{ background: "#F0F0FF", color: "#5856D6", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8 }}>{issue.rule_violated || issue.law}</span>
            )}
          </div>
          {issue.problem && <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.5 }}>{issue.problem}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ background: style.bg, color: style.color, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10 }}>{style.label}</span>
          <span style={{ color: "#C7C7CC", fontSize: 11 }}>{expanded ? "▴" : "▾"}</span>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 16px 50px", borderTop: "1px solid #F2F2F7" }}>
          {bullets.length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              {bullets.map((b, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: "#5856D6", fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>•</span>
                  <span style={{ fontSize: 13, color: "#3A3A3C", lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
            </div>
          )}
          {issue.fix && (
            <div style={{ background: "#F0FFF4", border: "1px solid #B0F0C0", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 10 }}>
              <span style={{ color: "#34C759", fontSize: 14, flexShrink: 0, fontWeight: 700 }}>→</span>
              <span style={{ fontSize: 13, color: "#1C4A26", lineHeight: 1.55 }}>{issue.fix}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Zone to CSS position mapping
const ZONE_POSITIONS: Record<string, { top: string; left: string; transform: string }> = {
  "top-left":      { top: "10%",  left: "15%",  transform: "translate(-50%,-50%)" },
  "top-center":    { top: "10%",  left: "50%",  transform: "translate(-50%,-50%)" },
  "top-right":     { top: "10%",  left: "85%",  transform: "translate(-50%,-50%)" },
  "mid-left":      { top: "50%",  left: "15%",  transform: "translate(-50%,-50%)" },
  "mid-center":    { top: "50%",  left: "50%",  transform: "translate(-50%,-50%)" },
  "mid-right":     { top: "50%",  left: "85%",  transform: "translate(-50%,-50%)" },
  "bottom-left":   { top: "85%",  left: "15%",  transform: "translate(-50%,-50%)" },
  "bottom-center": { top: "85%",  left: "50%",  transform: "translate(-50%,-50%)" },
  "bottom-right":  { top: "85%",  left: "85%",  transform: "translate(-50%,-50%)" },
};

const ZONE_HIGHLIGHT: Record<string, { top: string; left: string; width: string; height: string }> = {
  "top-left":      { top: "0%",    left: "0%",    width: "34%", height: "33%" },
  "top-center":    { top: "0%",    left: "33%",   width: "34%", height: "33%" },
  "top-right":     { top: "0%",    left: "66%",   width: "34%", height: "33%" },
  "mid-left":      { top: "33%",   left: "0%",    width: "34%", height: "34%" },
  "mid-center":    { top: "33%",   left: "33%",   width: "34%", height: "34%" },
  "mid-right":     { top: "33%",   left: "66%",   width: "34%", height: "34%" },
  "bottom-left":   { top: "67%",   left: "0%",    width: "34%", height: "33%" },
  "bottom-center": { top: "67%",   left: "33%",   width: "34%", height: "33%" },
  "bottom-right":  { top: "67%",   left: "66%",   width: "34%", height: "33%" },
};

function AnnotatedImage({ imagePreview, issues, activeIssueId }: { imagePreview: string; issues: any[]; activeIssueId: number | null }) {
  const activeIssue = activeIssueId !== null ? issues.find(i => i.id === activeIssueId) : null;
  const zone = activeIssue?.zone;
  const highlight = zone ? ZONE_HIGHLIGHT[zone] : null;
  const badge = zone ? ZONE_POSITIONS[zone] : null;
  const style = activeIssue ? getSeverityStyle(activeIssue.severity) : null;
  // Debug — remove after confirming zones work
  if (typeof window !== "undefined") {
    console.log("[AnnotatedImage] activeIssueId:", activeIssueId, "zone:", zone, "issues zones:", issues.map(i => ({id:i.id, zone:i.zone})));
  }

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", width: "100%" }}>
        <img src={imagePreview} alt="Design" style={{ display: "block", maxWidth: "100%", width: "100%", height: "auto", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }} />

        {/* Dark overlay on whole image when a zone is active */}
        {highlight && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", borderRadius: 8, pointerEvents: "none", transition: "opacity 0.2s" }} />
        )}

        {/* Highlighted zone — punches through the dark overlay */}
        {highlight && style && (
          <div style={{
            position: "absolute",
            top: highlight.top, left: highlight.left,
            width: highlight.width, height: highlight.height,
            boxShadow: `0 0 0 3px ${style.color}, inset 0 0 0 9999px transparent`,
            borderRadius: 6,
            pointerEvents: "none",
            transition: "all 0.25s",
            background: `${style.color}22`,
          }} />
        )}

        {/* Active badge handled in the unified badges loop above */}

        {/* Always show all badges — dim non-active ones when one is selected */}
        {issues.filter(i => i.severity !== "win").map((issue) => {
          const pos = issue.zone ? ZONE_POSITIONS[issue.zone] : null;
          if (!pos) return null;
          const s = getSeverityStyle(issue.severity);
          const isActive = activeIssueId === issue.id;
          const isDimmed = activeIssueId !== null && !isActive;
          return (
            <div key={issue.id} style={{
              position: "absolute",
              top: pos.top, left: pos.left,
              transform: pos.transform,
              width: isActive ? 28 : 22,
              height: isActive ? 28 : 22,
              background: s.color,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isActive ? 13 : 11,
              color: "#fff",
              fontWeight: 700,
              boxShadow: isActive
                ? `0 0 0 3px #fff, 0 4px 12px rgba(0,0,0,0.3)`
                : "0 0 0 2px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.25)",
              pointerEvents: "none",
              opacity: isDimmed ? 0.3 : 1,
              transition: "all 0.25s",
              zIndex: isActive ? 10 : 5,
            }}>
              {issue.id}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StakeholderModal({ result, onClose }: { result: any; onClose: () => void }) {
  const score: number = result.overall_business_score || 0;
  const scoreColor = score >= 70 ? "#34C759" : score >= 50 ? "#FF9500" : "#FF3B30";
  const effortColor = (e: string) => e === "Low" ? "#34C759" : e === "Medium" ? "#FF9500" : "#FF3B30";
  const priorityColor = (p: string) => p === "Ship this sprint" ? "#FF3B30" : p === "Next sprint" ? "#FF9500" : "#AEAEB2";
  const impactColor = (i: string) => i === "High" ? "#34C759" : i === "Medium" ? "#FF9500" : "#AEAEB2";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 24, maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 100px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a4a7a)", borderRadius: "24px 24px 0 0", padding: "32px 32px 24px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Stakeholder Report</div>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: "0 0 20px" }}>{result.executive_summary}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>Business Score</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 16px", display: "inline-block" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{result.score_label}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Business Issues */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3B30", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Business Risks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(result.business_issues || []).map((issue: any, idx: number) => (
                <div key={idx} style={{ background: "#F5F5F7", borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${priorityColor(issue.priority)}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F" }}>{issue.element}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: priorityColor(issue.priority), background: "#fff", padding: "2px 8px", borderRadius: 8, border: `1px solid ${priorityColor(issue.priority)}` }}>{issue.priority}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: effortColor(issue.effort), background: "#fff", padding: "2px 8px", borderRadius: 8 }}>{issue.effort} effort</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#3A3A3C", margin: "0 0 4px", lineHeight: 1.5 }}>💸 {issue.business_impact}</p>
                  <p style={{ fontSize: 12, color: "#6E6E73", margin: 0, lineHeight: 1.5 }}>👤 {issue.user_impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wins */}
          {result.wins_to_keep?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#34C759", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>What's Working</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.wins_to_keep.map((win: string, idx: number) => (
                  <div key={idx} style={{ background: "#F0FFF4", border: "1px solid #B0F0C0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#1C4A26" }}>✓ {win}</div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Matrix */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#007AFF", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Priority Matrix — Highest ROI First</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(result.priority_matrix || []).map((item: any, idx: number) => (
                <div key={idx} style={{ background: "#F0F8FF", border: "1px solid #C0DCFF", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0A2540" }}>#{idx + 1} {item.action}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 11, color: impactColor(item.impact), fontWeight: 600 }}>↑ {item.impact} impact</span>
                      <span style={{ fontSize: 11, color: effortColor(item.effort), fontWeight: 600 }}>⚡ {item.effort} effort</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#3A6A9A", margin: 0 }}>{item.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Tickets */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#5856D6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Ready for Sprint Planning</div>
            <div style={{ background: "#F5F5F7", borderRadius: 12, overflow: "hidden" }}>
              {(result.sprint_recommendation || []).map((ticket: string, idx: number) => (
                <div key={idx} style={{ padding: "12px 16px", borderBottom: idx < result.sprint_recommendation.length - 1 ? "1px solid #E5E5EA" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, background: "#5856D6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                  <span style={{ fontSize: 13, color: "#1D1D1F", lineHeight: 1.4 }}>{ticket}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                const text = `📊 Design Review — Stakeholder Summary

${result.executive_summary}

Business Score: ${score}/100 — "${result.score_label}"

Top 3 actions:
${(result.sprint_recommendation || []).map((t: string, i: number) => (i+1) + ". " + t).join("\n")}

Generated by Design Bestie — design-bestie.vercel.app`;
                navigator.clipboard.writeText(text).then(() => alert("Copied! Ready to paste into Slack or Notion 📋"));
              }}
              style={{ flex: 1, background: "#0A2540", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >Copy for Slack / Notion 📋</button>
            <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #D2D2D7", borderRadius: 12, padding: "13px", fontSize: 14, color: "#6E6E73", cursor: "pointer", fontWeight: 500 }}>Back to Results</button>
          </div>
        </div>
      </div>
    </div>
  );
}


function RoastModal({ roastResult, onClose }: { roastResult: any; onClose: () => void }) {
  const score: number = roastResult.roast_score || 0;
  const scoreColor = score >= 70 ? "#34C759" : score >= 50 ? "#FF9500" : "#FF3B30";
  const severityColor = (s: string) => s === "critical" ? "#FF3B30" : s === "high" ? "#FF9500" : "#FF6B00";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 100px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "linear-gradient(135deg,#1D1D1F,#3A1F1F)", borderRadius: "24px 24px 0 0", padding: "32px 32px 24px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: "0 0 20px", fontStyle: "italic" }}>"{roastResult.opening}"</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>Roast Score</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 16px", display: "inline-block" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor }}>"{roastResult.roast_label}"</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "24px 32px 32px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3B30", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>The Roast 🔥</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {(roastResult.roasts || []).map((r: any, idx: number) => (
              <div key={idx} style={{ background: "#FFF5F4", border: "1px solid #FFD5D2", borderLeft: `4px solid ${severityColor(r.severity)}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F", marginBottom: 6, lineHeight: 1.4 }}>"{r.roast}"</div>
                <div style={{ fontSize: 12, color: "#6E6E73", marginBottom: 8, fontStyle: "italic" }}>{r.element} — {r.real_talk}</div>
                <div style={{ background: "#F0FFF4", border: "1px solid #B0F0C0", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1C4A26" }}>→ {r.fix}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#34C759", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>The Hype ✨</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {(roastResult.hypes || []).map((h: any, idx: number) => (
              <div key={idx} style={{ background: "#F0FFF4", border: "1px solid #B0F0C0", borderLeft: "4px solid #34C759", borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F", marginBottom: 4 }}>"{h.hype}"</div>
                <div style={{ fontSize: 12, color: "#6E6E73", fontStyle: "italic" }}>{h.element} — {h.real_talk}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#F5F5F7", borderRadius: 12, padding: "16px 20px", marginBottom: 20, textAlign: "center" }}>
            <span style={{ fontSize: 14, color: "#3A3A3C", fontStyle: "italic" }}>"{roastResult.redemption}"</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                const text = `🔥 My design just got roasted on Design Bestie\n\nVerdict: "${roastResult.roast_label}" (${score}/100)\n\n"${roastResult.opening}"\n\ndesign-bestie.vercel.app`;
                navigator.clipboard.writeText(text).then(() => alert("Copied! Ready to post 🔥"));
              }}
              style={{ flex: 1, background: "#1D1D1F", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >Share the Roast 🔥</button>
            <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #D2D2D7", borderRadius: 12, padding: "13px", fontSize: 14, color: "#6E6E73", cursor: "pointer", fontWeight: 500 }}>Back to Results</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignBestie() {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [screen, setScreen] = useState<"home" | "analysing" | "results" | "brief" | "briefing">("home");
  const [briefText, setBriefText] = useState("");
  const [briefResult, setBriefResult] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "stress">("analysis");
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [stressResult, setStressResult] = useState<any>(null);
  const [stressPersonas, setStressPersonas] = useState<string[]>([]);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressStep, setStressStep] = useState(0);
  const [activePersona, setActivePersona] = useState(0);
  const [stressExpandedCards, setStressExpandedCards] = useState<number[]>([]);
  const [activeIssueId, setActiveIssueId] = useState<number | null>(null);
  const [activeStressIssueId, setActiveStressIssueId] = useState<number | null>(null);
  const [roastResult, setRoastResult] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [showRoastModal, setShowRoastModal] = useState(false);
  const [stakeholderResult, setStakeholderResult] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysingSteps = ["UX Laws and Principles", "UI Rules and Standards", "Accessibility WCAG 2.2", "Nielsen Heuristics", "Gestalt Principles", "Cognitive Load Analysis"];
  const stressSteps = ["Loading personas", "Analysing persona lenses", "Checking accessibility", "Cognitive friction scan", "Cross-persona comparison", "Synthesising insights"];

  useEffect(() => {
    if (screen !== "analysing") return;
    setStep(0);
    setAnalysisResult(null);
    let apiDone = false;
    let stepsDone = false;
    const checkDone = () => { if (apiDone && stepsDone) setTimeout(() => setScreen("results"), 400); };
    const callAPI = async () => {
      try {
        const base64 = imagePreview!.split(",")[1];
        const mimeType = imagePreview!.split(";")[0].split(":")[1];
        const res = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64, mimeType }) });
        const json = await res.json();
        if (res.ok && json) { setAnalysisResult(json); }
        else { setAnalysisResult({ overall_score: 0, scores: { usability: 0, accessibility: 0, visual_design: 0, hierarchy: 0, cognitive_load: 0 }, summary: "Analysis failed — please try again.", issues: [], wins: [], priority_fixes: [] }); }
      } catch (e) {
        setAnalysisResult({ overall_score: 0, scores: { usability: 0, accessibility: 0, visual_design: 0, hierarchy: 0, cognitive_load: 0 }, summary: "Network error — please try again.", issues: [], wins: [], priority_fixes: [] });
      } finally { apiDone = true; checkDone(); }
    };
    callAPI();
    let current = 0;
    const interval = setInterval(() => {
      current++; setStep(current);
      if (current >= analysingSteps.length) { clearInterval(interval); stepsDone = true; checkDone(); }
    }, 1500);
    return () => clearInterval(interval);
  }, [screen]);

  const runStressTest = async (personas: string[]) => {
    setShowPersonaModal(false); setStressPersonas(personas); setIsStressTesting(true); setStressStep(0); setStressResult(null); setActivePersona(0); setStressExpandedCards([]);
    let current = 0;
    const interval = setInterval(() => { current++; setStressStep(current); if (current >= stressSteps.length) clearInterval(interval); }, 1400);
    try {
      const base64 = imagePreview!.split(",")[1];
      const mimeType = imagePreview!.split(";")[0].split(":")[1];
      const res = await fetch("/api/stress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64, mimeType, personas }) });
      const json = await res.json();
      if (res.ok && json && json.personas) { setStressResult(json); setActiveTab("stress"); }
      else { console.error("Stress API error:", json); alert("Stress test failed: " + (json?.error || "Unknown error")); }
    } catch (e) { console.error("Stress fetch error:", e); alert("Stress test network error."); }
    finally { clearInterval(interval); setIsStressTesting(false); }
  };

  const runRoast = async () => {
    setIsRoasting(true); setRoastResult(null);
    try {
      const base64 = imagePreview!.split(",")[1];
      const mimeType = imagePreview!.split(";")[0].split(":")[1];
      const res = await fetch("/api/roast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64, mimeType }) });
      const json = await res.json();
      if (res.ok && json && json.roasts) { setRoastResult(json); setShowRoastModal(true); }
      else { console.error("Roast API error:", json); alert("Roast failed: " + (json?.error || "Unknown error")); }
    } catch (e) { console.error("Roast fetch error:", e); alert("Roast network error. Check console."); }
    finally { setIsRoasting(false); }
  };

  const runStakeholder = async () => {
    if (!analysisResult) return;
    setIsTranslating(true);
    setStakeholderResult(null);
    try {
      const res = await fetch("/api/stakeholder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisResult }),
      });
      const json = await res.json();
      if (res.ok && json && json.executive_summary) {
        setStakeholderResult(json);
        setShowStakeholderModal(true);
      } else {
        console.error("Stakeholder API error:", json);
        alert("Translation failed: " + (json?.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Stakeholder fetch error:", e);
      alert("Network error. Check console.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setUploaded(true); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };

  if (screen === "home") {
    return <HomeScreen
      onStart={() => { if (uploaded && imagePreview) { setActiveTab("analysis"); setAnalysisResult(null); setStressResult(null); setRoastResult(null); setScreen("analysing"); } else fileInputRef.current?.click(); }}
      onBrief={() => { if (briefText.trim().length > 10) setScreen("briefing"); }}
      briefText={briefText}
      setBriefText={setBriefText}
      uploaded={uploaded} fileName={fileName} imagePreview={imagePreview}
      fileInputRef={fileInputRef} isDragging={isDragging} setIsDragging={setIsDragging}
      handleInputChange={handleInputChange} handleDrop={handleDrop}
    />;
  }

  if (screen === "analysing") {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F10", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
        <nav style={{ padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 15 }}>✦</span>
            </div>
            <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>Design Bestie</span>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "8px 18px", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>← Back</button>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: 48 }}>
          <div style={{ display: "flex", gap: 80, alignItems: "center", maxWidth: 900, width: "100%" }}>
            {/* Phone mockup */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 260, height: 520 }}>
                {/* Large purple glow behind phone */}
                <div style={{ position: "absolute", inset: -60, background: "radial-gradient(ellipse,rgba(124,58,237,0.35),transparent 65%)", pointerEvents: "none" }} />
                {/* Secondary blue glow */}
                <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at 70% 30%,rgba(79,70,229,0.2),transparent 60%)", pointerEvents: "none" }} />
                {/* Phone body — visible grey not black */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg,#3D3D4A,#1E1E28)", borderRadius: 52, boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(124,58,237,0.3)" }}>
                  {/* Side buttons */}
                  <div style={{ position: "absolute", left: -4, top: 95, width: 4, height: 30, background: "linear-gradient(180deg,#4A4A5A,#2A2A3A)", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", left: -4, top: 135, width: 4, height: 48, background: "linear-gradient(180deg,#4A4A5A,#2A2A3A)", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", left: -4, top: 193, width: 4, height: 48, background: "linear-gradient(180deg,#4A4A5A,#2A2A3A)", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", right: -4, top: 152, width: 4, height: 68, background: "linear-gradient(180deg,#4A4A5A,#2A2A3A)", borderRadius: "0 3px 3px 0" }} />
                  {/* Screen */}
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderRadius: 42, overflow: "hidden", background: "#0A0A0F", boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="Design" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(145deg,#0F0F1A,#1A0A2E)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 20 }}>✦</span>
                          </div>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 500 }}>Your design</span>
                        </div>}
                    {/* Scanning line animation */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 0%,rgba(124,58,237,0.12) 48%,rgba(124,58,237,0.12) 52%,transparent 100%)", animation: "pulse 2s ease-in-out infinite" }} />
                    {/* Bottom home indicator */}
                    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 80, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(124,58,237,0.8)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Processing</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-1.2px" }}>Analysing your design</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 32px" }}>Running against 50+ expert frameworks</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {analysingSteps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < step ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "transparent", border: i < step ? "none" : i === step ? "2px solid #7C3AED" : "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s", boxShadow: i < step ? "0 2px 8px rgba(124,58,237,0.4)" : "none" }}>
                      {i < step ? <span style={{ color: "#fff", fontSize: 11 }}>✓</span> : i === step ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7C3AED" }} /> : null}
                    </div>
                    <span style={{ fontSize: 15, color: i < step ? "rgba(255,255,255,0.9)" : i === step ? "#fff" : "rgba(255,255,255,0.2)", fontWeight: i === step ? 600 : 400, transition: "all 0.3s" }}>{s}</span>
                    {i < step && <span style={{ marginLeft: "auto", fontSize: 11, color: "#A78BFA", fontWeight: 600 }}>Done</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Usually takes 15 seconds</span>
                  <span style={{ fontSize: 13, color: "#A78BFA", fontWeight: 700 }}>{Math.round((step / analysingSteps.length) * 100)}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#7C3AED,#4F46E5)", borderRadius: 2, width: `${(step / analysingSteps.length) * 100}%`, transition: "width 0.6s ease", boxShadow: "0 0 12px rgba(124,58,237,0.6)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results" && !analysisResult) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1D1D1F", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 16, color: "#6E6E73" }}>Loading results…</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (screen === "results" && analysisResult) {
    const issues = [
      ...(analysisResult.issues || []).map((i: any) => ({ ...i, law: i.rule_violated, learnWhy: i.learn_why })),
      ...(analysisResult.wins || []).map((i: any) => ({ ...i, law: i.rule_violated, learnWhy: i.learn_why })),
    ];
    const overallScore: number = analysisResult.overall_score || 0;
    const summary: string = analysisResult.summary || "";
    const scores = analysisResult.scores || { usability: 0, accessibility: 0, visual_design: 0, hierarchy: 0, cognitive_load: 0 };
    const priorityFixes: string[] = analysisResult.priority_fixes || [];
    const readingPattern = analysisResult.reading_pattern || null;
    const pm = readingPattern ? (patternMeta[readingPattern.type] || patternMeta["No Clear Pattern"]) : null;
    const toggleCard = (id: number) => setExpandedCards((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const filtered = activeFilter === "all" ? issues : activeFilter === "wins" ? issues.filter((i: any) => i.severity === "win") : activeFilter === "critical" ? issues.filter((i: any) => i.severity === "critical") : activeFilter === "high" ? issues.filter((i: any) => i.severity === "high" || i.severity === "moderate") : issues.filter((i: any) => i.severity === "medium" || i.severity === "minor");
    const hasTabs = stressResult || isStressTesting;
    const topBarH = 82;
    const tabBarH = hasTabs ? 48 : 0;
    const mainH = `calc(100vh - ${topBarH + tabBarH}px)`;
    const persona = stressResult?.personas?.[activePersona];
    const stressIssues = persona ? [...(persona.issues || []), ...(persona.wins || [])] : [];
    const toggleStressCard = (id: number) => setStressExpandedCards((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* ROAST MODAL — rendered as overlay inside results */}
        {showRoastModal && roastResult && <RoastModal roastResult={roastResult} onClose={() => setShowRoastModal(false)} />}
        {showStakeholderModal && stakeholderResult && <StakeholderModal result={stakeholderResult} onClose={() => setShowStakeholderModal(false)} />}

        {showPersonaModal && <PersonaModal onClose={() => setShowPersonaModal(false)} onRun={runStressTest} />}

        {/* TOP BAR */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", height: topBarH, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ position: "relative", width: 52, height: 52 }}>
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="22" fill="none" stroke="#E5E5EA" strokeWidth="4" />
                <circle cx="26" cy="26" r="22" fill="none" stroke="#1D1D1F" strokeWidth="4" strokeDasharray="138" strokeDashoffset={138 - (138 * overallScore / 100)} strokeLinecap="round" transform="rotate(-90 26 26)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F" }}>{overallScore}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#AEAEB2", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 2 }}>Design Score</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: overallScore >= 80 ? "#34C759" : overallScore >= 60 ? "#FF9500" : "#FF3B30" }}>{overallScore >= 80 ? "Good Design" : overallScore >= 60 ? "Needs Work" : "Critical Issues"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
            {([["Usability", scores.usability, "#FF9500"], ["Accessibility", scores.accessibility, "#FF3B30"], ["Visual", scores.visual_design, "#34C759"], ["Hierarchy", scores.hierarchy, "#007AFF"], ["Cognitive", scores.cognitive_load, "#FF9500"]] as [string, number, string][]).map(([label, score, color]) => (
              <div key={label} style={{ background: "#F5F5F7", border: "1px solid #E5E5EA", borderRadius: 10, padding: "6px 12px", textAlign: "center", minWidth: 72 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, color: "#AEAEB2", marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => setShowPersonaModal(true)} style={{ background: stressResult ? "#2D0A4E" : "none", color: stressResult ? "#fff" : "#2D0A4E", border: `1px solid ${stressResult ? "#2D0A4E" : "#C4B0D8"}`, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {isStressTesting ? <><div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> Running…</> : <><span>🧪</span>{stressResult ? "Stress Test ✓" : "Stress Test"}</>}
            </button>
            <button onClick={() => { if (isRoasting) return; if (roastResult) setShowRoastModal(true); else runRoast(); }} style={{ background: roastResult ? "#FF3B30" : "none", color: roastResult ? "#fff" : "#FF3B30", border: `1px solid ${roastResult ? "#FF3B30" : "#FFBAB6"}`, borderRadius: 20, padding: "8px 16px", cursor: isRoasting ? "default" : "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {isRoasting ? <><div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> Roasting…</> : <><span>🔥</span>{roastResult ? "View Roast" : "Roast It"}</>}
            </button>
            <button onClick={() => { if (isTranslating) return; if (stakeholderResult) setShowStakeholderModal(true); else runStakeholder(); }} style={{ background: stakeholderResult ? "#007AFF" : "none", color: stakeholderResult ? "#fff" : "#007AFF", border: `1px solid ${stakeholderResult ? "#007AFF" : "#99C8FF"}`, borderRadius: 20, padding: "8px 16px", cursor: isTranslating ? "default" : "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {isTranslating ? <><div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> Translating…</> : <><span>📊</span>{stakeholderResult ? "View Report" : "For Stakeholders"}</>}
            </button>
            <button onClick={() => { setScreen("home"); setUploaded(false); setFileName(""); setImagePreview(null); setAnalysisResult(null); setStressResult(null); setRoastResult(null); setStakeholderResult(null); setExpandedCards([]); setActiveTab("analysis"); }} style={{ background: "none", border: "1px solid #D2D2D7", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6E6E73", fontWeight: 500 }}>← New Analysis</button>
          </div>
        </div>

        {hasTabs && (
          <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "0 24px", display: "flex", height: tabBarH, boxSizing: "border-box" }}>
            {(["analysis", "stress"] as const).map((key) => (
              <button key={key} onClick={() => { if (!isStressTesting || key === "analysis") setActiveTab(key); }} style={{ background: "none", border: "none", padding: "0 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: activeTab === key ? "#1D1D1F" : "#AEAEB2", borderBottom: activeTab === key ? "2px solid #1D1D1F" : "2px solid transparent" }}>
                {key === "analysis" ? "Analysis" : isStressTesting ? "Running Stress Test…" : `Stress Test · ${stressPersonas.length} persona${stressPersonas.length > 1 ? "s" : ""}`}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", height: mainH }}>
          {activeTab === "analysis" && (
            <>
              <div style={{ width: "38%", borderRight: "1px solid #E5E5EA", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E5EA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#1D1D1F" }}>Annotated Design</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    {([["#FF3B30", "Critical"], ["#FF9500", "High"], ["#FF6B00", "Medium"]] as [string, string][]).map(([c, l]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                        <span style={{ fontSize: 11, color: "#AEAEB2" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {imagePreview && <AnnotatedImage imagePreview={imagePreview} issues={issues} activeIssueId={activeIssueId} />}
              </div>
              <div style={{ flex: 1, overflow: "auto", background: "#F5F5F7" }}>
                <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "18px 24px" }}>
                  <div style={{ fontSize: 10, letterSpacing: "2px", color: "#AEAEB2", fontWeight: 600, marginBottom: 7, textTransform: "uppercase" }}>The Bottom Line</div>
                  <p style={{ fontSize: 15, color: "#1D1D1F", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{summary}</p>
                </div>
                {readingPattern && pm && (
                  <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "14px 24px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: pm.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{pm.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F" }}>{readingPattern.type}</span>
                        <span style={{ background: readingPattern.is_following ? "#F0FFF4" : "#FFF5F4", color: readingPattern.is_following ? "#34C759" : "#FF3B30", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{readingPattern.is_following ? "✓ Following" : "✗ Not following"}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#6E6E73", margin: "0 0 3px", lineHeight: 1.55 }}>{readingPattern.explanation}</p>
                      <p style={{ fontSize: 12, color: "#AEAEB2", margin: 0, lineHeight: 1.4 }}>{readingPattern.impact}</p>
                    </div>
                  </div>
                )}
                {priorityFixes.length > 0 && (
                  <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "18px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 16 }}>🎯</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F" }}>If you only fix three things</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {priorityFixes.slice(0, 3).map((text, idx) => {
                        const colors = ["#FF3B30", "#FF9500", "#FF6B00"];
                        return (
                          <div key={idx} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#F5F5F7", borderRadius: 10, borderLeft: `3px solid ${colors[idx]}` }}>
                            <div style={{ width: 20, height: 20, background: colors[idx], borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                            <p style={{ fontSize: 13, color: "#3A3A3C", lineHeight: 1.55, margin: 0 }}>{text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{ padding: "18px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F" }}>Detailed critique</span>
                    <span style={{ fontSize: 12, color: "#C7C7CC" }}>Click any card to expand</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {([["all", `All (${issues.length})`], ["critical", `Critical (${issues.filter((i: any) => i.severity === "critical").length})`], ["high", `High (${issues.filter((i: any) => i.severity === "high" || i.severity === "moderate").length})`], ["medium", `Medium (${issues.filter((i: any) => i.severity === "medium" || i.severity === "minor").length})`], ["wins", `Wins (${issues.filter((i: any) => i.severity === "win").length})`]] as [string, string][]).map(([val, label]) => (
                      <button key={val} onClick={() => setActiveFilter(val)} style={{ padding: "6px 14px", borderRadius: 16, border: activeFilter === val ? "none" : "1px solid #D2D2D7", background: activeFilter === val ? "#1D1D1F" : "#fff", color: activeFilter === val ? "#fff" : "#6E6E73", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{label}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.map((issue: any) => (
                      <IssueCard key={issue.id} issue={issue} expanded={expandedCards.includes(issue.id)} onToggle={() => { toggleCard(issue.id); setActiveIssueId(prev => prev === issue.id ? null : issue.id); }} highlighted={activeIssueId === issue.id} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "stress" && (
            isStressTesting ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F7" }}>
                <div style={{ maxWidth: 420, width: "100%", padding: 40 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#1D1D1F", marginBottom: 8 }}>Running Stress Test</div>
                  <p style={{ fontSize: 15, color: "#6E6E73", marginBottom: 32 }}>Testing: {stressPersonas.join(", ")}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {stressSteps.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < stressStep ? "#2D0A4E" : "transparent", border: i < stressStep ? "none" : i === stressStep ? "2px solid #2D0A4E" : "2px solid #D2D2D7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                          {i < stressStep ? <span style={{ color: "#fff", fontSize: 12 }}>✓</span> : i === stressStep ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D0A4E" }} /> : null}
                        </div>
                        <span style={{ fontSize: 15, color: i <= stressStep ? "#1D1D1F" : "#C7C7CC", transition: "all 0.3s" }}>{s}</span>
                        {i < stressStep && <span style={{ marginLeft: "auto", fontSize: 12, color: "#34C759", fontWeight: 600 }}>Done</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 28, height: 4, background: "#E5E5EA", borderRadius: 2 }}>
                    <div style={{ height: "100%", background: "#2D0A4E", borderRadius: 2, width: `${(stressStep / stressSteps.length) * 100}%`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              </div>
            ) : stressResult ? (
              <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
                <div style={{ width: "38%", borderRight: "1px solid #E5E5EA", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E5EA", background: "#FAFAFA" }}>
                    <div style={{ fontSize: 10, letterSpacing: "1.5px", color: "#AEAEB2", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Cross-Persona Insight</div>
                    <p style={{ fontSize: 13, color: "#1D1D1F", margin: "0 0 10px", lineHeight: 1.55, fontWeight: 500 }}>{stressResult.cross_persona_insight}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, background: "#FFF5F4", color: "#FF3B30", padding: "3px 10px", borderRadius: 8, fontWeight: 600 }}>Weakest: {stressResult.weakest_persona}</span>
                      <span style={{ fontSize: 11, background: "#F0FFF4", color: "#34C759", padding: "3px 10px", borderRadius: 8, fontWeight: 600 }}>Strongest: {stressResult.strongest_persona}</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E5EA", display: "flex", flexDirection: "column", gap: 6 }}>
                    {stressResult.personas.map((p: any, idx: number) => {
                      const meta = ALL_PERSONAS.find((ap) => ap.name === p.name);
                      const isActive = idx === activePersona;
                      const sc: number = p.persona_score || 0;
                      return (
                        <button key={p.name} onClick={() => { setActivePersona(idx); setStressExpandedCards([]); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: isActive ? "2px solid #2D0A4E" : "1px solid #E5E5EA", background: isActive ? "rgba(45,10,78,0.04)" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                          <span style={{ fontSize: 18 }}>{meta?.emoji || "👤"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1D1F" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#6E6E73" }}>{(p.issues || []).length} issues · {(p.wins || []).length} win</div>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: sc >= 70 ? "#34C759" : sc >= 50 ? "#FF9500" : "#FF3B30" }}>{sc}</div>
                        </button>
                      );
                    })}
                  </div>
                  {imagePreview && persona && <AnnotatedImage imagePreview={imagePreview} issues={stressIssues} activeIssueId={activeStressIssueId} />}
                </div>
                <div style={{ flex: 1, overflow: "auto", background: "#F5F5F7" }}>
                  {persona && (
                    <>
                      <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "18px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(45,10,78,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                          {ALL_PERSONAS.find((ap) => ap.name === persona.name)?.emoji || "👤"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#1D1D1F" }}>{persona.name}</div>
                          <div style={{ fontSize: 13, color: "#6E6E73", marginTop: 2 }}>{ALL_PERSONAS.find((ap) => ap.name === persona.name)?.desc}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 28, fontWeight: 800, color: (persona.persona_score || 0) >= 70 ? "#34C759" : (persona.persona_score || 0) >= 50 ? "#FF9500" : "#FF3B30", lineHeight: 1 }}>{persona.persona_score || 0}</div>
                          <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 2 }}>Score</div>
                        </div>
                      </div>
                      <div style={{ padding: "18px 24px" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F", marginBottom: 12 }}>Issues & wins for this persona</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {stressIssues.map((issue: any) => (
                            <IssueCard key={issue.id} issue={issue} expanded={stressExpandedCards.includes(issue.id)} onToggle={() => { toggleStressCard(issue.id); setActiveStressIssueId(prev => prev === issue.id ? null : issue.id); }} highlighted={activeStressIssueId === issue.id} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  }

  // ── BRIEFING (loading) ───────────────────────────────────────────────────
  if (screen === "briefing") {
    // Auto-call API when this screen mounts
    if (!briefResult) {
      fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: briefText }),
      }).then(r => r.json()).then(json => {
        if (json && json.screens_needed) {
          setBriefResult(json);
          setScreen("brief");
        } else {
          console.error("Brief API error:", json);
          setScreen("home");
        }
      }).catch(e => { console.error(e); setScreen("home"); });
    }
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>📋</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#1D1D1F", margin: "0 0 8px", letterSpacing: "-0.8px" }}>Analysing your requirements</h2>
          <p style={{ fontSize: 15, color: "#6E6E73", margin: "0 0 32px" }}>Finding gaps, edge cases and missing states...</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Reading requirements", "Identifying screens needed", "Flagging edge cases", "Spotting missing states", "Generating questions to ask"].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.6 + i * 0.08 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D0A4E", flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "#3A3A3C" }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, width: 40, height: 40, borderRadius: "50%", border: "3px solid #2D0A4E", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "32px auto 0" }} />
        </div>
      </div>
    );
  }

  // ── BRIEF RESULTS ─────────────────────────────────────────────────────────
  if (screen === "brief" && briefResult) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <nav style={{ background: "rgba(245,245,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#1D1D1F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14 }}>✦</span></div>
            <span style={{ fontWeight: 700, color: "#1D1D1F", fontSize: 16 }}>Design Bestie</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setBriefResult(null); setBriefText(""); setScreen("home"); }} style={{ background: "none", border: "1px solid #D2D2D7", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6E6E73" }}>← New Brief</button>
            <button onClick={() => setScreen("home")} style={{ background: "#2D0A4E", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Review a Design →</button>
          </div>
        </nav>

        <div style={{ maxWidth: "100%", padding: "32px 48px" }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: "#AEAEB2", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Design Brief</div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: "#1D1D1F", margin: "0 0 8px", letterSpacing: "-1.5px" }}>{briefResult.feature_name || "Your Feature"}</h1>
            <p style={{ fontSize: 18, color: "#6E6E73", margin: 0, lineHeight: 1.6 }}>{briefResult.summary}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

            {/* Screens needed */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E5E5EA", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2D0A4E", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>📱 Screens to Design</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {(briefResult.screens_needed || []).map((s: any, i: number) => (
                  <div key={i} style={{ background: "#F5F5F7", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", marginBottom: 4 }}>{s.screen}</div>
                    <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.5 }}>{s.purpose}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing states */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E5E5EA" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3B30", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🔲 States to Design</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(briefResult.states_needed || []).map((s: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FFF5F4", borderRadius: 8, borderLeft: "3px solid #FF3B30" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3B30", marginBottom: 2 }}>{s.state}</div>
                      <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.5 }}>{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge cases */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E5E5EA" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FF9500", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>⚠️ Edge Cases</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(briefResult.edge_cases || []).map((e: any, i: number) => (
                  <div key={i} style={{ padding: "10px 12px", background: "#FFFBF0", borderRadius: 8, borderLeft: "3px solid #FF9500" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#FF9500", marginBottom: 2 }}>{e.case}</div>
                    <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.5 }}>{e.what_to_design}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions to ask */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E5E5EA" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#5856D6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>❓ Ask Before You Start</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(briefResult.questions_to_ask || []).map((q: string, i: number) => (
                  <div key={i} style={{ padding: "10px 12px", background: "#F0F0FF", borderRadius: 8, fontSize: 13, color: "#3A3A3C", borderLeft: "3px solid #5856D6" }}>
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Conflicts */}
            {briefResult.conflicts?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E5E5EA" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3B30", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🚨 Conflicts in Requirements</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {briefResult.conflicts.map((c: string, i: number) => (
                    <div key={i} style={{ padding: "10px 12px", background: "#FFF5F4", borderRadius: 8, fontSize: 13, color: "#3A3A3C", borderLeft: "3px solid #FF3B30" }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E5E5EA", gridColumn: briefResult.conflicts?.length > 0 ? "auto" : "1 / -1" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#34C759", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>✅ Design Checklist</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(briefResult.checklist || []).map((item: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#F0FFF4", borderRadius: 8, fontSize: 12, color: "#1C4A26" }}>
                    <span style={{ color: "#34C759", fontWeight: 700, flexShrink: 0 }}>□</span>{item}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Copy brief */}
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => {
                const lines = [
                  "DESIGN BRIEF — " + (briefResult.feature_name || "Feature"),
                  "",
                  briefResult.summary,
                  "",
                  "SCREENS TO DESIGN:",
                  ...(briefResult.screens_needed || []).map((s: any) => "• " + s.screen + " — " + s.purpose),
                  "",
                  "STATES TO DESIGN:",
                  ...(briefResult.states_needed || []).map((s: any) => "• " + s.state + ": " + s.description),
                  "",
                  "EDGE CASES:",
                  ...(briefResult.edge_cases || []).map((e: any) => "• " + e.case + ": " + e.what_to_design),
                  "",
                  "QUESTIONS TO ASK FIRST:",
                  ...(briefResult.questions_to_ask || []).map((q: string) => "• " + q),
                  "",
                  "Generated by Design Bestie — design-bestie.vercel.app",
                ];
                navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Brief copied! Paste into Notion or Slack 📋"));
              }}
              style={{ width: "100%", background: "#1D1D1F", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >Copy Brief to Clipboard 📋</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
