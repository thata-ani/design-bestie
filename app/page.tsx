"use client";
import { useEffect, useRef, useState } from "react";

// Design icons as SVG paths
const DESIGN_ICONS = [
  // Grid
  { id: 1, path: "M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z", viewBox: "0 0 23 23" },
  // Cursor
  { id: 2, path: "M4 4l7 18 2.5-7L21 12.5z", viewBox: "0 0 24 24" },
  // Layers
  { id: 3, path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", viewBox: "0 0 24 24" },
  // Eye
  { id: 4, path: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z", viewBox: "0 0 24 24" },
  // Frame/Artboard
  { id: 5, path: "M2 7V5a2 2 0 012-2h2M2 17v2a2 2 0 002 2h2M22 7V5a2 2 0 00-2-2h-2M22 17v2a2 2 0 01-2 2h-2M7 2v20M17 2v20M2 7h20M2 17h20", viewBox: "0 0 24 24" },
  // Typography T
  { id: 6, path: "M4 7V4h16v3M9 20h6M12 4v16", viewBox: "0 0 24 24" },
  // Pen tool
  { id: 7, path: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 11a2 2 0 100 4 2 2 0 000-4z", viewBox: "0 0 24 24" },
  // Align
  { id: 8, path: "M21 10H3M21 6H3M21 14H3M21 18H3", viewBox: "0 0 24 24" },
  // Component
  { id: 9, path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", viewBox: "0 0 24 24" },
  // Contrast
  { id: 10, path: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2v16a8 8 0 000-16z", viewBox: "0 0 24 24" },
  // Zoom
  { id: 11, path: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35M11 8v6M8 11h6", viewBox: "0 0 24 24" },
  // Comment
  { id: 12, path: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", viewBox: "0 0 24 24" },
  // Spacing
  { id: 13, path: "M8 7l-4 5 4 5M16 7l4 5-4 5M3 12h18", viewBox: "0 0 24 24" },
  // Color palette
  { id: 14, path: "M12 2a10 10 0 00-9.95 9h11.64L9.74 7.05a1 1 0 011.41-1.41l5.66 5.65a1 1 0 010 1.42l-5.66 5.65a1 1 0 01-1.41-1.41L13.69 13H2.05A10 10 0 1012 2z", viewBox: "0 0 24 24" },
  // Ruler
  { id: 15, path: "M3 3l18 18M8 3v4M12 3v2M16 3v4M3 8h4M3 12h2M3 16h4", viewBox: "0 0 24 24" },
  // Crop
  { id: 16, path: "M6.13 1L6 16a2 2 0 002 2h15M1 6.13l15-.13a2 2 0 012 2V23", viewBox: "0 0 24 24" },
];

function HomeScreen({ onStart, uploaded, fileName, imagePreview, fileInputRef, isDragging, setIsDragging, handleInputChange, handleDrop }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const iconsRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialize icons on resize
      iconsRef.current = Array.from({ length: 28 }, (_, i) => ({
        icon: DESIGN_ICONS[i % DESIGN_ICONS.length],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 16 + Math.random() * 20,
        opacity: 0.04 + Math.random() * 0.08,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      iconsRef.current.forEach((icon) => {
        // Mouse repel
        const dx = icon.x - mx;
        const dy = icon.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;
        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          icon.vx += (dx / dist) * force * 0.8;
          icon.vy += (dy / dist) * force * 0.8;
        }

        // Damping
        icon.vx *= 0.96;
        icon.vy *= 0.96;

        // Move
        icon.x += icon.vx;
        icon.y += icon.vy;
        icon.rotation += icon.rotationSpeed;

        // Wrap around edges
        if (icon.x < -50) icon.x = canvas.width + 50;
        if (icon.x > canvas.width + 50) icon.x = -50;
        if (icon.y < -50) icon.y = canvas.height + 50;
        if (icon.y > canvas.height + 50) icon.y = -50;

        // Draw icon
        ctx.save();
        ctx.translate(icon.x, icon.y);
        ctx.rotate(icon.rotation);
        ctx.strokeStyle = `rgba(45, 10, 78, ${icon.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const scale = icon.size / 24;
        ctx.scale(scale, scale);
        ctx.translate(-12, -12);

        const path = new Path2D(icon.icon.path);
        ctx.stroke(path);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#FAFAFA", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, background: "rgba(250,250,250,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: "#2D0A4E", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13 }}>✦</span>
          </div>
          <span style={{ fontWeight: 600, color: "#1A1A1A", fontSize: 15, letterSpacing: "-0.3px" }}>Design Bestie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Examples", "How it works"].map((l) => (
            <span key={l} style={{ fontSize: 14, color: "#666", cursor: "pointer", letterSpacing: "-0.2px" }}>{l}</span>
          ))}
          <button style={{ background: "#1A1A1A", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "-0.2px" }}>Try Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", padding: "24px" }}>
        <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, padding: "44px 52px", maxWidth: 520, width: "100%", boxShadow: "0 2px 40px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset", textAlign: "center" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F5F0FF", border: "1px solid rgba(45,10,78,0.12)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
            <div style={{ width: 5, height: 5, background: "#2D0A4E", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: "#2D0A4E", fontWeight: 500, letterSpacing: "0.2px" }}>AI-Powered UX Critique</span>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1, margin: "0 0 14px", letterSpacing: "-1.5px", color: "#1A1A1A" }}>
            Your Designs Deserve<br />
            <span style={{ background: "linear-gradient(135deg, #2D0A4E, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Better Feedback.</span>
          </h1>

          <p style={{ fontSize: 15, color: "#888", lineHeight: 1.6, margin: "0 0 32px", letterSpacing: "-0.2px" }}>
            Upload any screen. Get research-backed critique from a senior design perspective — not bullet points.
          </p>

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{ border: `1.5px dashed ${isDragging ? "#2D0A4E" : uploaded ? "rgba(45,10,78,0.4)" : "rgba(0,0,0,0.12)"}`, borderRadius: 14, padding: "24px 16px", marginBottom: 12, cursor: "pointer", background: isDragging ? "rgba(45,10,78,0.03)" : uploaded ? "rgba(45,10,78,0.02)" : "rgba(0,0,0,0.01)", transition: "all 0.2s" }}
          >
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleInputChange} />
            {uploaded && imagePreview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 64, height: 48, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#1A1A1A", margin: 0, letterSpacing: "-0.2px" }}>{fileName}</p>
                <p style={{ fontSize: 11, color: "#999", margin: 0 }}>Click to change</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, background: "#F5F5F5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3v12M11 3L7 7M11 3l4 4M3 17h16" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A", margin: "0 0 3px", letterSpacing: "-0.3px" }}>Drop your screenshot here</p>
                  <p style={{ fontSize: 12, color: "#999", margin: 0 }}>PNG · JPG · PDF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={onStart}
            style={{ width: "100%", background: uploaded ? "#1A1A1A" : "rgba(0,0,0,0.08)", color: uploaded ? "#fff" : "#999", border: "none", padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: uploaded ? "pointer" : "default", marginBottom: 20, letterSpacing: "-0.2px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {uploaded ? <>Analyse My Design <span>→</span></> : "Select a Screenshot to Begin"}
          </button>

          {/* Tags */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {["50+ UX Laws", "WCAG 2.2", "Nielsen Heuristics", "Gestalt", "Reading Patterns"].map((b) => (
              <span key={b} style={{ fontSize: 11, color: "#999", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 20, padding: "4px 11px" }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignBestie() {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCards, setExpandedCards] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const steps = ["UX Laws and Principles", "UI Rules and Standards", "Accessibility WCAG 2.2", "Nielsen Heuristics", "Gestalt Principles", "Cognitive Load Analysis"];

  const patternMeta = {
    "F-Pattern": { icon: "F", color: "#6366F1" },
    "Z-Pattern": { icon: "Z", color: "#8B5CF6" },
    "Gutenberg Pattern": { icon: "G", color: "#0EA5E9" },
    "Spotted Pattern": { icon: "S", color: "#F59E0B" },
    "Layer Cake Pattern": { icon: "L", color: "#10B981" },
    "No Clear Pattern": { icon: "!", color: "#EF4444" },
  };

  useEffect(() => {
    if (screen !== "analysing") return;
    setStep(0);
    let apiDone = false; let stepsDone = false;
    const checkBothDone = () => { if (apiDone && stepsDone) setTimeout(() => setScreen("results"), 500); };
    const callAPI = async () => {
      try {
        const base64 = imagePreview.split(",")[1];
        const mimeType = imagePreview.split(";")[0].split(":")[1];
        const response = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64, mimeType }) });
        if (response.ok) { const result = await response.json(); setAnalysisResult(result); }
      } catch (e) { console.error(e); }
      finally { apiDone = true; checkBothDone(); }
    };
    callAPI();
    let current = 0;
    const interval = setInterval(() => { current++; setStep(current); if (current >= steps.length) { clearInterval(interval); stepsDone = true; checkBothDone(); } }, 1500);
    return () => clearInterval(interval);
  }, [screen]);

  const handleFile = (file) => {
    if (!file) return;
    setUploaded(true); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result);
    reader.readAsDataURL(file);
  };
  const handleInputChange = (e) => handleFile(e.target.files?.[0]);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };

  if (screen === "home") {
    return (
      <HomeScreen
        onStart={() => { if (uploaded && imagePreview) setScreen("analysing"); else fileInputRef.current?.click(); }}
        uploaded={uploaded}
        fileName={fileName}
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        handleInputChange={handleInputChange}
        handleDrop={handleDrop}
      />
    );
  }

  if (screen === "analysing") {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <nav style={{ background: "rgba(250,250,250,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "#2D0A4E", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 13 }}>✦</span></div>
            <span style={{ fontWeight: 600, color: "#1A1A1A", fontSize: 15, letterSpacing: "-0.3px" }}>Design Bestie</span>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: "7px 16px", cursor: "pointer", fontSize: 13, color: "#666", letterSpacing: "-0.2px" }}>← Back</button>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: 48 }}>
          <div style={{ display: "flex", gap: 80, alignItems: "center", maxWidth: 900, width: "100%" }}>
            {/* iPhone mockup — no notch */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 220, height: 440 }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #3A3A3A, #1A1A1A)", borderRadius: 44, boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                  <div style={{ position: "absolute", left: -3, top: 80, width: 3, height: 26, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", left: -3, top: 114, width: 3, height: 40, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", left: -3, top: 162, width: 3, height: 40, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", right: -3, top: 128, width: 3, height: 58, background: "#2A2A2A", borderRadius: "0 2px 2px 0" }} />
                  <div style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, borderRadius: 36, overflow: "hidden", background: "#000" }}>
                    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                      {imagePreview ? <img src={imagePreview} alt="Design" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#333", fontSize: 12 }}>Your design</span></div>}
                    </div>
                    <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 72, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Progress */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#2D0A4E", fontWeight: 600, marginBottom: 14, textTransform: "uppercase" }}>Processing</div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px", letterSpacing: "-0.8px" }}>Analysing your design</h2>
              <p style={{ fontSize: 14, color: "#888", margin: "0 0 32px", letterSpacing: "-0.2px" }}>Running against 50+ expert frameworks</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < step ? "#1A1A1A" : "transparent", border: i < step ? "none" : i === step ? "1.5px solid #1A1A1A" : "1.5px solid #DDD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                      {i < step ? <span style={{ color: "#fff", fontSize: 11 }}>✓</span> : i === step ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A1A1A" }} /> : null}
                    </div>
                    <span style={{ fontSize: 14, color: i <= step ? "#1A1A1A" : "#BBB", letterSpacing: "-0.2px", transition: "all 0.3s" }}>{s}</span>
                    {i < step && <span style={{ marginLeft: "auto", fontSize: 11, color: "#00A651", fontWeight: 500 }}>Done</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#BBB" }}>Usually takes 15 seconds</span>
                  <span style={{ fontSize: 12, color: "#1A1A1A", fontWeight: 600 }}>{Math.round((step / steps.length) * 100)}%</span>
                </div>
                <div style={{ height: 3, background: "#EFEFEF", borderRadius: 2 }}>
                  <div style={{ height: "100%", background: "#1A1A1A", borderRadius: 2, width: `${(step / steps.length) * 100}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const getSeverityStyle = (severity) => {
      if (severity === "critical") return { color: "#DC2626", bg: "#FEF2F2", borderColor: "#FEE2E2", label: "Critical" };
      if (severity === "high" || severity === "moderate") return { color: "#D97706", bg: "#FFFBEB", borderColor: "#FDE68A", label: "High" };
      if (severity === "medium" || severity === "minor") return { color: "#B45309", bg: "#FFFBEB", borderColor: "#FDE68A", label: "Medium" };
      return { color: "#059669", bg: "#ECFDF5", borderColor: "#A7F3D0", label: "Win" };
    };

    const issues = analysisResult ? [
      ...(analysisResult.issues || []).map(i => ({ ...i, ...getSeverityStyle(i.severity), law: i.rule_violated, learnWhy: i.learn_why })),
      ...(analysisResult.wins || []).map(i => ({ ...i, ...getSeverityStyle("win"), law: i.rule_violated, learnWhy: i.learn_why })),
    ] : [];

    const overallScore = analysisResult?.overall_score || 0;
    const summary = analysisResult?.summary || "";
    const scores = analysisResult?.scores || { usability: 0, accessibility: 0, visual_design: 0, hierarchy: 0, cognitive_load: 0 };
    const priorityFixes = analysisResult?.priority_fixes || [];
    const readingPattern = analysisResult?.reading_pattern || null;
    const pm = readingPattern ? (patternMeta[readingPattern.type] || patternMeta["No Clear Pattern"]) : null;

    const toggleCard = (id) => setExpandedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const filtered = activeFilter === "all" ? issues
      : activeFilter === "wins" ? issues.filter(i => i.severity === "win")
      : activeFilter === "critical" ? issues.filter(i => i.severity === "critical")
      : activeFilter === "high" ? issues.filter(i => i.severity === "high" || i.severity === "moderate")
      : issues.filter(i => i.severity === "medium" || i.severity === "minor");

    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {/* TOP BAR */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ position: "relative", width: 48, height: 48 }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#F0F0F0" strokeWidth="3.5" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1A1A1A" strokeWidth="3.5" strokeDasharray="126" strokeDashoffset={126 - (126 * overallScore / 100)} strokeLinecap="round" transform="rotate(-90 24 24)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.5px" }}>{overallScore}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#999", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 2 }}>Score</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: overallScore >= 80 ? "#059669" : overallScore >= 60 ? "#D97706" : "#DC2626", letterSpacing: "-0.3px" }}>{overallScore >= 80 ? "Good Design" : overallScore >= 60 ? "Needs Work" : "Critical Issues"}</div>
            </div>
          </div>

          {/* Category scores */}
          <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
            {[["Usability", scores.usability, "#D97706"], ["Accessibility", scores.accessibility, "#DC2626"], ["Visual", scores.visual_design, "#059669"], ["Hierarchy", scores.hierarchy, "#2D0A4E"], ["Cognitive", scores.cognitive_load, "#D97706"]].map(([label, score, color]) => (
              <div key={label} style={{ background: "#FAFAFA", border: "1px solid #F0F0F0", borderRadius: 8, padding: "5px 10px", textAlign: "center", minWidth: 68 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.5px" }}>{score}</div>
                <div style={{ fontSize: 9, color: "#999", marginTop: 2, letterSpacing: "0.2px" }}>{label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { setScreen("home"); setUploaded(false); setFileName(""); setImagePreview(null); setAnalysisResult(null); setExpandedCards([]); }} style={{ background: "none", border: "1px solid #E8E8E8", borderRadius: 20, padding: "7px 14px", cursor: "pointer", fontSize: 12, color: "#666", letterSpacing: "-0.2px" }}>← New Analysis</button>
        </div>

        {/* MAIN */}
        <div style={{ display: "flex", height: "calc(100vh - 77px)" }}>
          {/* LEFT */}
          <div style={{ width: "38%", borderRight: "1px solid #F0F0F0", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 500, fontSize: 13, color: "#1A1A1A", letterSpacing: "-0.2px" }}>Annotated Design</span>
              <div style={{ display: "flex", gap: 10 }}>
                {[["#DC2626", "Critical"], ["#D97706", "High"], ["#B45309", "Medium"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 10, color: "#999" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {imagePreview
                  ? <img src={imagePreview} alt="Uploaded design" style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                  : <div style={{ height: 400, width: 280, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#CCC", fontSize: 13 }}>No design uploaded</div>}
                {issues.filter(i => i.severity !== "win").map((issue) => {
                  const loc = issue.location;
                  if (!loc || typeof loc.x !== "number") return null;
                  return (
                    <div key={issue.id} style={{ position: "absolute", top: `${loc.y}%`, left: `${loc.x}%`, width: `${loc.width}%`, height: `${loc.height}%`, border: `1.5px solid ${issue.color}`, borderRadius: 4, pointerEvents: "none", boxShadow: "0 0 0 2px rgba(255,255,255,0.9)" }}>
                      <div style={{ position: "absolute", top: -10, left: -10, width: 20, height: 20, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>{issue.id}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ flex: 1, overflow: "auto", background: "#FAFAFA" }}>

            {/* TL;DR */}
            <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "18px 24px" }}>
              <div style={{ fontSize: 9, letterSpacing: "1.5px", color: "#999", fontWeight: 500, marginBottom: 6, textTransform: "uppercase" }}>The Bottom Line</div>
              <p style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.55, margin: 0, fontWeight: 500, letterSpacing: "-0.2px" }}>{summary}</p>
            </div>

            {/* READING PATTERN */}
            {readingPattern && pm && (
              <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "14px 24px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: pm.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{pm.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>{readingPattern.type}</span>
                    <span style={{ background: readingPattern.is_following ? "#ECFDF5" : "#FEF2F2", color: readingPattern.is_following ? "#059669" : "#DC2626", fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 10 }}>
                      {readingPattern.is_following ? "✓ Following" : "✗ Not following"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#555", margin: "0 0 2px", lineHeight: 1.5, letterSpacing: "-0.1px" }}>{readingPattern.explanation}</p>
                  <p style={{ fontSize: 11, color: "#999", margin: 0, lineHeight: 1.4 }}>{readingPattern.impact}</p>
                </div>
              </div>
            )}

            {/* PRIORITY FIXES */}
            {priorityFixes.length > 0 && (
              <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "16px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>🎯</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>If you only fix three things</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {priorityFixes.slice(0, 3).map((text, idx) => {
                    const colors = ["#DC2626", "#D97706", "#B45309"];
                    return (
                      <div key={idx} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FAFAFA", borderRadius: 8, borderLeft: `2px solid ${colors[idx]}` }}>
                        <div style={{ width: 18, height: 18, background: colors[idx], borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{idx + 1}</div>
                        <p style={{ fontSize: 12, color: "#333", lineHeight: 1.5, margin: 0, letterSpacing: "-0.1px" }}>{text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETAILED CRITIQUE */}
            <div style={{ padding: "16px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>Detailed critique</span>
                <span style={{ fontSize: 11, color: "#BBB" }}>Click any card to expand</span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {[
                  ["all", `All (${issues.length})`],
                  ["critical", `Critical (${issues.filter(i => i.severity === "critical").length})`],
                  ["high", `High (${issues.filter(i => i.severity === "high" || i.severity === "moderate").length})`],
                  ["medium", `Medium (${issues.filter(i => i.severity === "medium" || i.severity === "minor").length})`],
                  ["wins", `Wins (${issues.filter(i => i.severity === "win").length})`],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setActiveFilter(val)} style={{ padding: "5px 11px", borderRadius: 14, border: activeFilter === val ? "none" : "1px solid #E8E8E8", background: activeFilter === val ? "#1A1A1A" : "#fff", color: activeFilter === val ? "#fff" : "#888", fontSize: 11, fontWeight: 500, cursor: "pointer", letterSpacing: "-0.1px" }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filtered.map((issue) => {
                  const isExpanded = expandedCards.includes(issue.id);
                  const bullets = issue.learnWhy ? issue.learnWhy.split("\n").filter(b => b.trim()) : [];
                  return (
                    <div key={issue.id} style={{ background: "#fff", border: "1px solid #F0F0F0", borderLeft: `2px solid ${issue.color}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                      <button onClick={() => toggleCard(issue.id)} style={{ width: "100%", background: "none", border: "none", padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 600, flexShrink: 0, marginTop: 1 }}>{issue.id}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A1A", letterSpacing: "-0.2px" }}>{issue.element}</span>
                            {issue.law && <span style={{ background: "#F5F0FF", color: "#6D28D9", fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 8, letterSpacing: "0.1px" }}>{issue.law}</span>}
                          </div>
                          {issue.problem && <div style={{ fontSize: 12, color: "#666", lineHeight: 1.45, letterSpacing: "-0.1px" }}>{issue.problem}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <span style={{ background: issue.bg, color: issue.color, fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 8 }}>{issue.label}</span>
                          <span style={{ color: "#CCC", fontSize: 10 }}>{isExpanded ? "▴" : "▾"}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div style={{ padding: "0 14px 14px 44px", borderTop: "1px solid #F5F5F5" }}>
                          {bullets.length > 0 && (
                            <div style={{ marginTop: 10, marginBottom: 10 }}>
                              {bullets.map((b, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                  <span style={{ color: "#2D0A4E", fontWeight: 600, fontSize: 11, flexShrink: 0, marginTop: 1 }}>•</span>
                                  <span style={{ fontSize: 12, color: "#444", lineHeight: 1.5, letterSpacing: "-0.1px" }}>{b.replace(/^[•\-]\s*/, "")}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {issue.fix && (
                            <div style={{ background: "#F0FDF4", border: "1px solid #D1FAE5", borderRadius: 6, padding: "8px 11px", display: "flex", gap: 7 }}>
                              <span style={{ color: "#059669", fontSize: 12, flexShrink: 0, fontWeight: 600 }}>→</span>
                              <span style={{ fontSize: 12, color: "#065F46", lineHeight: 1.5, letterSpacing: "-0.1px" }}>{issue.fix}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
