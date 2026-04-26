"use client";
import { useEffect, useRef, useState } from "react";

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

function parseBullets(learnWhy) {
  if (!learnWhy) return [];
  if (Array.isArray(learnWhy)) return learnWhy.map(b => String(b).replace(/^[•\-]\s*/, ""));
  if (typeof learnWhy === "string") return learnWhy.split("\n").filter(b => b.trim()).map(b => b.replace(/^[•\-]\s*/, ""));
  return [];
}

function HomeScreen({ onStart, uploaded, fileName, imagePreview, fileInputRef, isDragging, setIsDragging, handleInputChange, handleDrop }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const iconsRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const initIcons = (w, h) => {
      const spacing = 40;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      iconsRef.current = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c + 0.5) * spacing;
          const by = (r + 0.5) * spacing;
          iconsRef.current.push({
            icon: DESIGN_ICONS[(r * cols + c) % DESIGN_ICONS.length],
            x: bx + (Math.random() - 0.5) * 10,
            y: by + (Math.random() - 0.5) * 10,
            baseX: bx,
            baseY: by,
            size: 14,
            opacity: 0.07 + Math.random() * 0.06,
            vx: 0,
            vy: 0,
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

    const onMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
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
        icon.vx *= 0.82;
        icon.vy *= 0.82;
        icon.x += icon.vx;
        icon.y += icon.vy;

        ctx.save();
        ctx.translate(icon.x, icon.y);
        ctx.rotate(icon.rotation);
        ctx.strokeStyle = `rgba(29, 29, 31, ${icon.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const scale = icon.size / 24;
        ctx.scale(scale, scale);
        ctx.translate(-12, -12);
        try { ctx.stroke(new Path2D(icon.icon.path)); } catch (e) {}
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
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#F5F5F7", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      <nav style={{ position: "relative", zIndex: 10, background: "rgba(245,245,247,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#1D1D1F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>✦</span>
          </div>
          <span style={{ fontWeight: 700, color: "#1D1D1F", fontSize: 16, letterSpacing: "-0.4px" }}>Design Bestie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Examples", "How it works"].map((l) => (
            <span key={l} style={{ fontSize: 15, color: "#6E6E73", cursor: "pointer", letterSpacing: "-0.2px" }}>{l}</span>
          ))}
          <button style={{ background: "#1D1D1F", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 22, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try Free →</button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", padding: "24px" }}>
        <div style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 28, padding: "48px 56px", maxWidth: 540, width: "100%", boxShadow: "0 4px 60px rgba(0,0,0,0.07)", textAlign: "center" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: "#1D1D1F", fontWeight: 600 }}>✦ AI-Powered UX Critique</span>
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.08, margin: "0 0 16px", letterSpacing: "-2px", color: "#1D1D1F" }}>
            Your Designs Deserve<br />
            <span style={{ color: "#2D0A4E" }}>Better Feedback.</span>
          </h1>

          <p style={{ fontSize: 17, color: "#6E6E73", lineHeight: 1.6, margin: "0 0 32px", letterSpacing: "-0.3px" }}>
            Upload any screen. Get senior designer critique backed by real research — not bullet points.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{ border: `2px dashed ${isDragging ? "#2D0A4E" : uploaded ? "#2D0A4E" : "rgba(0,0,0,0.15)"}`, borderRadius: 16, padding: "28px 20px", marginBottom: 14, cursor: "pointer", background: isDragging ? "rgba(45,10,78,0.03)" : "rgba(0,0,0,0.01)", transition: "all 0.2s" }}
          >
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleInputChange} />
            {uploaded && imagePreview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 72, height: 52, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F", margin: 0 }}>{fileName}</p>
                <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Click to change file</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 52, background: "rgba(0,0,0,0.05)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v13M12 3L8 7M12 3l4 4M3 18h18" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#1D1D1F", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Drop your screenshot here</p>
                  <p style={{ fontSize: 13, color: "#999", margin: 0 }}>PNG · JPG · PDF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onStart}
            style={{ width: "100%", background: uploaded ? "#2D0A4E" : "rgba(0,0,0,0.08)", color: uploaded ? "#fff" : "#999", border: "none", padding: "16px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: uploaded ? "pointer" : "default", marginBottom: 20, letterSpacing: "-0.3px", transition: "all 0.25s", boxShadow: uploaded ? "0 4px 24px rgba(45,10,78,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {uploaded ? <>Analyse My Design <span style={{ fontSize: 18 }}>→</span></> : "Select a Screenshot to Begin"}
          </button>

          <div style={{ display: "flex", justifyContent: "center", gap: 7, flexWrap: "wrap" }}>
            {["50+ UX Laws", "WCAG 2.2", "Nielsen Heuristics", "Gestalt", "Reading Patterns"].map((b) => (
              <span key={b} style={{ fontSize: 12, color: "#888", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "5px 13px" }}>{b}</span>
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
    return <HomeScreen onStart={() => { if (uploaded && imagePreview) setScreen("analysing"); else fileInputRef.current?.click(); }} uploaded={uploaded} fileName={fileName} imagePreview={imagePreview} fileInputRef={fileInputRef} isDragging={isDragging} setIsDragging={setIsDragging} handleInputChange={handleInputChange} handleDrop={handleDrop} />;
  }

  if (screen === "analysing") {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <nav style={{ background: "rgba(245,245,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#1D1D1F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14 }}>✦</span></div>
            <span style={{ fontWeight: 700, color: "#1D1D1F", fontSize: 16, letterSpacing: "-0.4px" }}>Design Bestie</span>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 20, padding: "8px 18px", cursor: "pointer", fontSize: 14, color: "#6E6E73" }}>← Back</button>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: 48 }}>
          <div style={{ display: "flex", gap: 80, alignItems: "center", maxWidth: 900, width: "100%" }}>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 220, height: 440 }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #3A3A3A, #1A1A1A)", borderRadius: 44, boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                  <div style={{ position: "absolute", left: -3, top: 80, width: 3, height: 26, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", left: -3, top: 114, width: 3, height: 40, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", left: -3, top: 162, width: 3, height: 40, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", right: -3, top: 128, width: 3, height: 58, background: "#2A2A2A", borderRadius: "0 2px 2px 0" }} />
                  <div style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, borderRadius: 36, overflow: "hidden", background: "#000" }}>
                    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                      {imagePreview ? <img src={imagePreview} alt="Design" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#444", fontSize: 13 }}>Your design</span></div>}
                    </div>
                    <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 72, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#6E6E73", fontWeight: 600, marginBottom: 14, textTransform: "uppercase" }}>Processing</div>
              <h2 style={{ fontSize: 34, fontWeight: 700, color: "#1D1D1F", margin: "0 0 8px", letterSpacing: "-1px" }}>Analysing your design</h2>
              <p style={{ fontSize: 15, color: "#6E6E73", margin: "0 0 32px" }}>Running against 50+ expert frameworks</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < step ? "#1D1D1F" : "transparent", border: i < step ? "none" : i === step ? "2px solid #1D1D1F" : "2px solid #D2D2D7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                      {i < step ? <span style={{ color: "#fff", fontSize: 12 }}>✓</span> : i === step ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D1D1F" }} /> : null}
                    </div>
                    <span style={{ fontSize: 15, color: i <= step ? "#1D1D1F" : "#C7C7CC", transition: "all 0.3s" }}>{s}</span>
                    {i < step && <span style={{ marginLeft: "auto", fontSize: 12, color: "#34C759", fontWeight: 600 }}>Done</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#C7C7CC" }}>Usually takes 15 seconds</span>
                  <span style={{ fontSize: 13, color: "#1D1D1F", fontWeight: 700 }}>{Math.round((step / steps.length) * 100)}%</span>
                </div>
                <div style={{ height: 4, background: "#E5E5EA", borderRadius: 2 }}>
                  <div style={{ height: "100%", background: "#1D1D1F", borderRadius: 2, width: `${(step / steps.length) * 100}%`, transition: "width 0.6s ease" }} />
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
      if (severity === "critical") return { color: "#FF3B30", bg: "#FFF5F4", borderColor: "#FFD5D2", label: "Critical" };
      if (severity === "high" || severity === "moderate") return { color: "#FF9500", bg: "#FFFBF0", borderColor: "#FFE5B0", label: "High" };
      if (severity === "medium" || severity === "minor") return { color: "#FF6B00", bg: "#FFF8F0", borderColor: "#FFD9B0", label: "Medium" };
      return { color: "#34C759", bg: "#F0FFF4", borderColor: "#B0F0C0", label: "Win" };
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
      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>

        {/* TOP BAR */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
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
            {[["Usability", scores.usability, "#FF9500"], ["Accessibility", scores.accessibility, "#FF3B30"], ["Visual", scores.visual_design, "#34C759"], ["Hierarchy", scores.hierarchy, "#007AFF"], ["Cognitive", scores.cognitive_load, "#FF9500"]].map(([label, score, color]) => (
              <div key={label} style={{ background: "#F5F5F7", border: "1px solid #E5E5EA", borderRadius: 10, padding: "6px 12px", textAlign: "center", minWidth: 72 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, color: "#AEAEB2", marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { setScreen("home"); setUploaded(false); setFileName(""); setImagePreview(null); setAnalysisResult(null); setExpandedCards([]); }} style={{ background: "none", border: "1px solid #D2D2D7", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6E6E73", fontWeight: 500 }}>← New Analysis</button>
        </div>

        {/* MAIN */}
        <div style={{ display: "flex", height: "calc(100vh - 82px)" }}>

          {/* LEFT — annotation */}
          <div style={{ width: "38%", borderRight: "1px solid #E5E5EA", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E5EA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1D1D1F" }}>Annotated Design</span>
              <div style={{ display: "flex", gap: 12 }}>
                {[["#FF3B30", "Critical"], ["#FF9500", "High"], ["#FF6B00", "Medium"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 11, color: "#AEAEB2" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              {/* KEY FIX: position relative + inline-block, NO overflow hidden */}
              <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
                {imagePreview
                  ? <img src={imagePreview} alt="Uploaded design" style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }} />
                  : <div style={{ height: 400, width: 280, background: "#F5F5F7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#C7C7CC", fontSize: 14 }}>No design uploaded</div>
                }
                {issues.filter(i => i.severity !== "win").map((issue) => {
                  const loc = issue.location;
                  if (!loc || typeof loc.x !== "number" || typeof loc.y !== "number") return null;
                  return (
                    <div
                      key={issue.id}
                      style={{
                        position: "absolute",
                        top: `${loc.y}%`,
                        left: `${loc.x}%`,
                        width: `${loc.width}%`,
                        height: `${loc.height}%`,
                        border: `2px solid ${issue.color}`,
                        borderRadius: 4,
                        pointerEvents: "none",
                        boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
                      }}
                    >
                      <div style={{ position: "absolute", top: -11, left: -11, width: 22, height: 22, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                        {issue.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — critique */}
          <div style={{ flex: 1, overflow: "auto", background: "#F5F5F7" }}>

            {/* TL;DR */}
            <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "18px 24px" }}>
              <div style={{ fontSize: 10, letterSpacing: "2px", color: "#AEAEB2", fontWeight: 600, marginBottom: 7, textTransform: "uppercase" }}>The Bottom Line</div>
              <p style={{ fontSize: 15, color: "#1D1D1F", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{summary}</p>
            </div>

            {/* READING PATTERN */}
            {readingPattern && pm && (
              <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "14px 24px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: pm.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{pm.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F" }}>{readingPattern.type}</span>
                    <span style={{ background: readingPattern.is_following ? "#F0FFF4" : "#FFF5F4", color: readingPattern.is_following ? "#34C759" : "#FF3B30", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>
                      {readingPattern.is_following ? "✓ Following" : "✗ Not following"}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6E6E73", margin: "0 0 3px", lineHeight: 1.55 }}>{readingPattern.explanation}</p>
                  <p style={{ fontSize: 12, color: "#AEAEB2", margin: 0, lineHeight: 1.4 }}>{readingPattern.impact}</p>
                </div>
              </div>
            )}

            {/* PRIORITY FIXES */}
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

            {/* DETAILED CRITIQUE */}
            <div style={{ padding: "18px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F" }}>Detailed critique</span>
                <span style={{ fontSize: 12, color: "#C7C7CC" }}>Click any card to expand</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {[
                  ["all", `All (${issues.length})`],
                  ["critical", `Critical (${issues.filter(i => i.severity === "critical").length})`],
                  ["high", `High (${issues.filter(i => i.severity === "high" || i.severity === "moderate").length})`],
                  ["medium", `Medium (${issues.filter(i => i.severity === "medium" || i.severity === "minor").length})`],
                  ["wins", `Wins (${issues.filter(i => i.severity === "win").length})`],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setActiveFilter(val)} style={{ padding: "6px 14px", borderRadius: 16, border: activeFilter === val ? "none" : "1px solid #D2D2D7", background: activeFilter === val ? "#1D1D1F" : "#fff", color: activeFilter === val ? "#fff" : "#6E6E73", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((issue) => {
                  const isExpanded = expandedCards.includes(issue.id);
                  const bullets = parseBullets(issue.learnWhy);
                  return (
                    <div key={issue.id} style={{ background: "#fff", border: "1px solid #E5E5EA", borderLeft: `3px solid ${issue.color}`, borderRadius: 10, overflow: "hidden" }}>
                      <button onClick={() => toggleCard(issue.id)} style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 22, height: 22, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{issue.id}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F" }}>{issue.element}</span>
                            {issue.law && <span style={{ background: "#F0F0FF", color: "#5856D6", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8 }}>{issue.law}</span>}
                          </div>
                          {issue.problem && <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.5 }}>{issue.problem}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <span style={{ background: issue.bg, color: issue.color, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10 }}>{issue.label}</span>
                          <span style={{ color: "#C7C7CC", fontSize: 11 }}>{isExpanded ? "▴" : "▾"}</span>
                        </div>
                      </button>
                      {isExpanded && (
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
