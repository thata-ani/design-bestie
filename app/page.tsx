"use client";
import { useEffect, useRef, useState } from "react";

export default function DesignBestie() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCards, setExpandedCards] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    "UX Laws and Principles",
    "UI Rules and Standards",
    "Accessibility WCAG 2.2",
    "Nielsen Heuristics",
    "Gestalt Principles",
    "Cognitive Load Analysis",
  ];

  useEffect(() => {
    if (screen !== "home") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const COLS = 18;
    const ROWS = 12;
    let points = [];

    const buildPoints = () => {
      points = [];
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          points.push({ ox: (c / COLS) * canvas.width, oy: (r / ROWS) * canvas.height, x: (c / COLS) * canvas.width, y: (r / ROWS) * canvas.height });
        }
      }
    };
    buildPoints();

    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x * canvas.width;
      const my = mouseRef.current.y * canvas.height;
      points.forEach((p) => {
        const dx = mx - p.ox;
        const dy = my - p.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 320);
        const wave = Math.sin(t + p.ox * 0.006 + p.oy * 0.006) * 14;
        p.x = p.ox + dx * influence * 0.2 + wave;
        p.y = p.oy + dy * influence * 0.2 + wave * 0.5;
      });
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tl = points[r * (COLS + 1) + c];
          const tr = points[r * (COLS + 1) + c + 1];
          const bl = points[(r + 1) * (COLS + 1) + c];
          const br = points[(r + 1) * (COLS + 1) + c + 1];
          const cx = (tl.x + tr.x + bl.x + br.x) / 4;
          const cy = (tl.y + tr.y + bl.y + br.y) / 4;
          const ddx = mx - cx;
          const ddy = my - cy;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          const proximity = Math.max(0, 1 - dist / 280);
          const hue = 255 + (c / COLS) * 50 + proximity * 30;
          const lightness = 93 - proximity * 14;
          const alpha = 0.05 + proximity * 0.14;
          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y);
          ctx.lineTo(tr.x, tr.y);
          ctx.lineTo(br.x, br.y);
          ctx.lineTo(bl.x, bl.y);
          ctx.closePath();
          ctx.fillStyle = `hsla(${hue},65%,${lightness}%,${alpha})`;
          ctx.fill();
          ctx.strokeStyle = `hsla(${hue},50%,78%,0.12)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "analysing") return;
    setStep(0);
    setApiError(false);
    let apiDone = false;
    let stepsDone = false;
    const checkBothDone = () => { if (apiDone && stepsDone) setTimeout(() => setScreen("results"), 500); };
    const callAPI = async () => {
      try {
        const base64 = imagePreview.split(",")[1];
        const mimeType = imagePreview.split(";")[0].split(":")[1];
        const response = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        if (response.ok) {
          const result = await response.json();
          setAnalysisResult(result);
        } else { setApiError(true); }
      } catch (error) { setApiError(true); }
      finally { apiDone = true; checkBothDone(); }
    };
    callAPI();
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= steps.length) { clearInterval(interval); stepsDone = true; checkBothDone(); }
    }, 1500);
    return () => clearInterval(interval);
  }, [screen]);

  const handleFile = (file) => {
    if (!file) return;
    setUploaded(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => handleFile(e.target.files?.[0]);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };

  if (screen === "analysing") {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "Inter, sans-serif" }}>
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#2D0A4E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14 }}>✦</span></div>
            <span style={{ fontWeight: 600, color: "#2D0A4E", fontSize: 15 }}>Design Bestie</span>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6B7280" }}>← Back</button>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 48 }}>
          <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#2D0A4E", fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Processing</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px" }}>Analysing your design</h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 32px" }}>Running against UX laws, accessibility, and benchmarks</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < step ? "#2D0A4E" : "transparent", border: i < step ? "none" : i === step ? "2px solid #2D0A4E" : "2px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {i < step ? <span style={{ color: "#fff", fontSize: 12 }}>✓</span> : i === step ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D0A4E" }} /> : null}
                  </div>
                  <span style={{ fontSize: 14, color: i <= step ? "#1A1A1A" : "#9CA3AF" }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <div style={{ height: 4, background: "#F0EBF8", borderRadius: 2 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, #2D0A4E, #6B21A8)", borderRadius: 2, width: `${(step / steps.length) * 100}%`, transition: "width 0.6s ease" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const getSeverityStyle = (severity) => {
      if (severity === "critical") return { color: "#FF4444", bg: "#FFF5F5", borderColor: "#FECACA", label: "Critical" };
      if (severity === "high" || severity === "moderate") return { color: "#FF8C00", bg: "#FFF8F0", borderColor: "#FED7AA", label: severity === "high" ? "High" : "Moderate" };
      if (severity === "minor" || severity === "medium") return { color: "#FFB020", bg: "#FFFBF0", borderColor: "#FDE68A", label: severity === "medium" ? "Medium" : "Minor" };
      return { color: "#00A651", bg: "#F0FDF4", borderColor: "#BBF7D0", label: "Win" };
    };

    const realIssues = analysisResult ? [
      ...(analysisResult.issues || []).map(i => ({ ...i, ...getSeverityStyle(i.severity), law: i.rule_violated, learnWhy: i.learn_why })),
      ...(analysisResult.wins || []).map(i => ({ ...i, ...getSeverityStyle("win"), law: i.rule_violated, learnWhy: i.learn_why })),
    ] : null;

    const overallScore = analysisResult?.overall_score || 72;
    const summary = analysisResult?.summary || "Your design has solid bones but a few critical issues are blocking conversion. Fix the priority items first.";
    const categoryScores = analysisResult?.scores || { usability: 71, accessibility: 58, visual_design: 84, hierarchy: 76, cognitive_load: 69 };
    const priorityFixes = analysisResult?.priority_fixes || ["Increase CTA button height", "Fix text contrast", "Standardise spacing"];

    const issues = realIssues || [];

    const toggleCard = (id) => {
      setExpandedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const filtered = activeFilter === "all" ? issues : issues.filter(i => {
      if (activeFilter === "wins") return i.severity === "win";
      if (activeFilter === "critical") return i.severity === "critical";
      if (activeFilter === "high") return i.severity === "high" || i.severity === "moderate";
      if (activeFilter === "medium") return i.severity === "medium" || i.severity === "minor";
      return false;
    });

    return (
      <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "Inter, sans-serif" }}>
        {/* TOP BAR — score + new analysis button */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#F0EBF8" strokeWidth="5" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#2D0A4E" strokeWidth="5" strokeDasharray="151" strokeDashoffset={151 - (151 * overallScore / 100)} strokeLinecap="round" transform="rotate(-90 28 28)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>{overallScore}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Design Score</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: overallScore >= 80 ? "#00A651" : overallScore >= 60 ? "#FF8C00" : "#FF4444" }}>{overallScore >= 80 ? "Good" : overallScore >= 60 ? "Needs Work" : "Critical Issues"}</div>
            </div>
          </div>
          <button onClick={() => { setScreen("home"); setUploaded(false); setFileName(""); setImagePreview(null); setAnalysisResult(null); setExpandedCards([]); }} style={{ background: "#F8F9FA", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6B7280", fontWeight: 500 }}>← New Analysis</button>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: "flex", height: "calc(100vh - 81px)" }}>
          {/* LEFT — Annotated screen */}
          <div style={{ width: "40%", borderRight: "1px solid #E5E7EB", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#1A1A1A" }}>Annotated Design</span>
              <div style={{ display: "flex", gap: 10 }}>
                {[["#FF4444", "Critical"], ["#FF8C00", "High"], ["#FFB020", "Medium"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 10, color: "#6B7280" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                {imagePreview ? <img src={imagePreview} alt="Uploaded design" style={{ display: "block", maxWidth: "100%", height: "auto" }} /> : <div style={{ height: 500, width: 320, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>No design uploaded</div>}
                {issues.filter(i => i.severity !== "win").map((issue) => {
                  const loc = issue.location;
                  if (!loc || typeof loc.x !== "number") return null;
                  return (
                    <div key={issue.id} style={{ position: "absolute", top: `${loc.y}%`, left: `${loc.x}%`, width: `${loc.width}%`, height: `${loc.height}%`, border: `2px solid ${issue.color}`, borderRadius: 4, pointerEvents: "none", boxShadow: "0 0 0 2px rgba(255,255,255,0.7)" }}>
                      <div style={{ position: "absolute", top: -10, left: -10, width: 22, height: 22, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>{issue.id}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Critique */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {/* TL;DR */}
            <div style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #F0EBF8 100%)", borderBottom: "1px solid #E5E7EB", padding: "20px 28px" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#2D0A4E", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>The Bottom Line</div>
              <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{summary}</p>
            </div>

            {/* PRIORITY FIXES */}
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #E5E7EB", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", margin: 0 }}>If you only fix three things</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {priorityFixes.slice(0, 3).map((text, idx) => {
                  const colors = ["#FF4444", "#FF8C00", "#FFB020"];
                  return (
                    <div key={idx} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "#FAFAFA", borderRadius: 8, borderLeft: `3px solid ${colors[idx]}` }}>
                      <div style={{ width: 22, height: 22, background: colors[idx], borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                      <p style={{ fontSize: 13, color: "#1F2937", lineHeight: 1.5, margin: 0 }}>{text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DETAILED CRITIQUE */}
            <div style={{ padding: "20px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", margin: 0 }}>Detailed critique</h3>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Click any card for full reasoning</span>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {[
                  ["all", `All (${issues.length})`],
                  ["critical", `Critical (${issues.filter(i=>i.severity==="critical").length})`],
                  ["high", `High (${issues.filter(i=>i.severity==="high"||i.severity==="moderate").length})`],
                  ["medium", `Medium (${issues.filter(i=>i.severity==="medium"||i.severity==="minor").length})`],
                  ["wins", `Wins (${issues.filter(i=>i.severity==="win").length})`],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setActiveFilter(val)} style={{ padding: "6px 14px", borderRadius: 16, border: activeFilter === val ? "none" : "1px solid #E5E7EB", background: activeFilter === val ? "#2D0A4E" : "#fff", color: activeFilter === val ? "#fff" : "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{label}</button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((issue) => {
                  const isExpanded = expandedCards.includes(issue.id);
                  return (
                    <div key={issue.id} style={{ background: "#fff", border: `1px solid ${issue.borderColor}`, borderLeft: `3px solid ${issue.color}`, borderRadius: 8, overflow: "hidden" }}>
                      {/* Card header — always visible */}
                      <button onClick={() => toggleCard(issue.id)} style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 22, height: 22, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{issue.id}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>{issue.element}</div>
                          {issue.problem && <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isExpanded ? 99 : 2, WebkitBoxOrient: "vertical" }}>{issue.problem}</div>}
                        </div>
                        <span style={{ background: issue.bg, color: issue.color, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 12, border: `1px solid ${issue.color}30`, whiteSpace: "nowrap", flexShrink: 0 }}>{issue.label}</span>
                        <span style={{ color: "#9CA3AF", fontSize: 12, flexShrink: 0 }}>{isExpanded ? "▴" : "▾"}</span>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div style={{ padding: "0 16px 16px 16px", borderTop: `1px solid ${issue.borderColor}` }}>
                          {issue.law && (
                            <div style={{ marginTop: 12, marginBottom: 10 }}>
                              <span style={{ background: "#F0EBF8", color: "#2D0A4E", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 12 }}>{issue.law}</span>
                            </div>
                          )}
                          {issue.learnWhy && (
                            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 6, padding: "10px 12px", marginBottom: 10 }}>
                              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{issue.learnWhy}</p>
                            </div>
                          )}
                          {issue.fix && (
                            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "10px 12px", display: "flex", gap: 8 }}>
                              <span style={{ color: "#00A651", fontSize: 13, flexShrink: 0, fontWeight: 700 }}>→</span>
                              <span style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>{issue.fix}</span>
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

  // HOME SCREEN
  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#fff", fontFamily: "Inter, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <nav style={{ position: "relative", zIndex: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(45,10,78,0.08)", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#2D0A4E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14 }}>✦</span></div>
          <span style={{ fontWeight: 700, color: "#2D0A4E", fontSize: 15 }}>Design Bestie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Features", "Examples", "How it works"].map((l) => <span key={l} style={{ fontSize: 13, color: "#6B7280", cursor: "pointer" }}>{l}</span>)}
          <button style={{ background: "#2D0A4E", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Try It Free</button>
        </div>
      </nav>
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 64px)", padding: "24px" }}>
        <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 28, padding: "40px 52px", maxWidth: 540, width: "100%", boxShadow: "0 8px 48px rgba(45,10,78,0.10)", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F0EBF8", border: "1px solid rgba(45,10,78,0.15)", borderRadius: 20, padding: "6px 16px", marginBottom: 22 }}>
            <div style={{ width: 6, height: 6, background: "#2D0A4E", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: "#2D0A4E", fontWeight: 600 }}>AI-Powered UX Critique</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: "0 0 6px" }}>
            <span style={{ display: "block", background: "linear-gradient(180deg,#1A1A1A,#3A3A3A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Designs Deserve</span>
            <span style={{ display: "block", background: "linear-gradient(180deg,#2D0A4E,#6B21A8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Better Feedback.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.65, margin: "14px 0 28px", maxWidth: 400 }}>Upload any screen. Get instant expert critique against 50+ UX laws, accessibility standards and cognitive principles.</p>
          <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} style={{ border: `2px dashed ${isDragging ? "#2D0A4E" : uploaded ? "rgba(45,10,78,0.5)" : "rgba(45,10,78,0.2)"}`, borderRadius: 16, padding: "22px 16px", marginBottom: 14, cursor: "pointer", background: isDragging ? "rgba(240,235,248,0.7)" : uploaded ? "rgba(240,235,248,0.4)" : "rgba(248,249,250,0.6)", transition: "all 0.2s" }}>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleInputChange} />
            {uploaded && imagePreview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 72, height: 52, borderRadius: 8, overflow: "hidden", border: "1px solid #E5E7EB" }}><img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2D0A4E", margin: 0 }}>{fileName}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Click to change file</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, background: "#2D0A4E", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v12M11 3L7 7M11 3l4 4M3 17h16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <div><p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>Drop your screenshot here</p><p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>PNG · JPG · PDF up to 10MB</p></div>
              </div>
            )}
          </div>
          <button onClick={() => { if (uploaded && imagePreview) setScreen("analysing"); else fileInputRef.current?.click(); }} style={{ width: "100%", background: uploaded ? "#00A651" : "rgba(45,10,78,0.4)", color: "#fff", border: "none", padding: "15px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: uploaded ? "pointer" : "default", marginBottom: 18, boxShadow: uploaded ? "0 4px 20px rgba(0,166,81,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {uploaded ? <>Analyse My Design <span style={{ fontSize: 16 }}>→</span></> : "Select a Screenshot to Begin"}
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {[["#2D0A4E", "50+ UX Laws"], ["#00A651", "WCAG 2.2"], ["#FF8C00", "Nielsen Heuristics"], ["#2D0A4E", "Gestalt"], ["#FF4444", "Cognitive Load"]].map(([c, b]) => <span key={b} style={{ fontSize: 11, color: "#9CA3AF", background: "rgba(255,255,255,0.8)", border: "1px solid #E5E7EB", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: c, display: "inline-block" }} />{b}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
