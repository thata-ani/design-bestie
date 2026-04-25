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

  // Canvas animation
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
          points.push({
            ox: (c / COLS) * canvas.width,
            oy: (r / ROWS) * canvas.height,
            x: (c / COLS) * canvas.width,
            y: (r / ROWS) * canvas.height,
          });
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

  // Auto progress on analysing screen
  useEffect(() => {
    if (screen !== "analysing") return;
    setStep(0);
    setApiError(false);

    // Call Gemini API and track completion
    let apiDone = false;
    let stepsDone = false;

    const checkBothDone = () => {
      if (apiDone && stepsDone) {
        setTimeout(() => setScreen("results"), 500);
      }
    };

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
        } else {
          setApiError(true);
        }
      } catch (error) {
        setApiError(true);
      } finally {
        apiDone = true;
        checkBothDone();
      }
    };
    callAPI();

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= steps.length) {
        clearInterval(interval);
        stepsDone = true;
        checkBothDone();
      }
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
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  // ─── ANALYSING SCREEN ───────────────────────────────────────────────────────
  if (screen === "analysing") {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "Inter, sans-serif" }}>
        {/* Navbar */}
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#2D0A4E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14 }}>✦</span>
            </div>
            <span style={{ fontWeight: 600, color: "#2D0A4E", fontSize: 15 }}>Design Bestie</span>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6B7280" }}>← Back</button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 48 }}>
          <div style={{ display: "flex", gap: 80, alignItems: "center", maxWidth: 960, width: "100%" }}>

            {/* iPhone 15 Pro Mockup */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 240, height: 480 }}>
                {/* Outer frame */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #3D3D3D, #1A1A1A)", borderRadius: 48, boxShadow: "0 32px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.05)" }}>
                  {/* Side buttons left */}
                  <div style={{ position: "absolute", left: -3, top: 88, width: 3, height: 28, background: "#2A2A2A", borderRadius: "2px 0 0 2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />
                  <div style={{ position: "absolute", left: -3, top: 124, width: 3, height: 44, background: "#2A2A2A", borderRadius: "2px 0 0 2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />
                  <div style={{ position: "absolute", left: -3, top: 176, width: 3, height: 44, background: "#2A2A2A", borderRadius: "2px 0 0 2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />
                  {/* Side button right */}
                  <div style={{ position: "absolute", right: -3, top: 140, width: 3, height: 64, background: "#2A2A2A", borderRadius: "0 2px 2px 0", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />

                  {/* Screen */}
                  <div style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, borderRadius: 40, overflow: "hidden", background: "#000" }}>
                    {/* Dynamic Island */}
                    <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 90, height: 30, background: "#000", borderRadius: 15, zIndex: 10 }} />
                    {/* Screen content */}
                    <div style={{ width: "100%", height: "100%", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Design" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "#333", fontSize: 12 }}>Your design</span>
                      )}
                    </div>
                    {/* Home indicator */}
                    <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 80, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#2D0A4E", fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Processing</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px", lineHeight: 1.2 }}>Analysing Your Design...</h2>
              <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 36px" }}>Running against 50+ expert frameworks</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < step ? "#2D0A4E" : "transparent", border: i < step ? "none" : i === step ? "2px solid #2D0A4E" : "2px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.4s" }}>
                      {i < step ? (
                        <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                      ) : i === step ? (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D0A4E" }} />
                      ) : null}
                    </div>
                    <span style={{ fontSize: 15, color: i < step ? "#1A1A1A" : i === step ? "#1A1A1A" : "#9CA3AF", fontWeight: i === step ? 600 : 400, transition: "all 0.3s" }}>{s}</span>
                    {i < step && <span style={{ marginLeft: "auto", fontSize: 12, color: "#00A651", fontWeight: 600 }}>Done</span>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>Usually takes 15 seconds</span>
                  <span style={{ fontSize: 13, color: "#2D0A4E", fontWeight: 700 }}>{Math.round((step / steps.length) * 100)}%</span>
                </div>
                <div style={{ height: 6, background: "#F0EBF8", borderRadius: 3 }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #2D0A4E, #6B21A8)", borderRadius: 3, width: `${(step / steps.length) * 100}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ─────────────────────────────────────────────────────────
  if (screen === "results") {
    // Use real API data if available, otherwise use dummy data
    const getSeverityStyle = (severity) => {
      if (severity === "critical") return { color: "#FF4444", bg: "#FFF5F5", borderColor: "#FECACA" };
      if (severity === "moderate") return { color: "#FF8C00", bg: "#FFF8F0", borderColor: "#FED7AA" };
      if (severity === "minor") return { color: "#FFB020", bg: "#FFFBF0", borderColor: "#FDE68A" };
      return { color: "#00A651", bg: "#F0FDF4", borderColor: "#BBF7D0" };
    };

    const realIssues = analysisResult ? [
      ...(analysisResult.issues || []).map(i => ({ ...i, ...getSeverityStyle(i.severity), law: i.rule_violated, learnWhy: i.learn_why })),
      ...(analysisResult.wins || []).map(i => ({ ...i, ...getSeverityStyle("win"), law: i.rule_violated, learnWhy: i.learn_why })),
    ] : null;

    const overallScore = analysisResult?.overall_score || 72;
    const categoryScores = analysisResult?.scores || { usability: 71, accessibility: 58, visual_design: 84, hierarchy: 76, cognitive_load: 69 };
    const priorityFixes = analysisResult?.priority_fixes || ["Increase CTA button height to minimum 48px", "Fix text contrast to meet WCAG 4.5:1 ratio", "Standardise spacing to 8pt grid system"];

    const issues = realIssues || [
      { id: 1, severity: "critical", color: "#FF4444", bg: "#FFF5F5", borderColor: "#FECACA", element: "Primary CTA Button", law: "Fitts's Law", category: "ux_law", problem: "Touch target is approximately 28px height — well below the 44px minimum recommended by Apple HIG and Google Material Design. Users with larger fingers or motor impairments will frequently mis-tap this button.", learnWhy: "Fitts's Law states that the time to reach a target depends on its size and distance from the user. On this screen, the small CTA button means users take longer to tap accurately and make more errors. This directly increases frustration and reduces conversion rates. Apps like Swiggy and Zomato use minimum 48px height buttons for all primary actions to ensure reliable tapping.", fix: "Increase button height to minimum 48px (ideally 52-56px for primary CTAs). Ensure horizontal padding of at least 24px on each side." },
      { id: 2, severity: "moderate", color: "#FF8C00", bg: "#FFF8F0", borderColor: "#FED7AA", element: "Text Contrast", law: "WCAG 2.2 — 1.4.3", category: "accessibility", problem: "Secondary text elements have an approximate contrast ratio of 2.8:1 against the white background, failing the WCAG AA minimum of 4.5:1 for normal text.", learnWhy: "WCAG contrast rules exist because low contrast text becomes invisible for users with visual impairments, colour blindness, or those viewing in bright sunlight. On this screen, the light grey text forces users to strain their eyes to read important information. Failing this standard excludes a significant portion of your users. Stripe uses carefully chosen grey tones (#6B7280 minimum) to ensure readability while maintaining a clean aesthetic.", fix: "Darken all secondary text from current grey to minimum #767676 to achieve 4.5:1 contrast ratio against white backgrounds." },
      { id: 3, severity: "minor", color: "#FFB020", bg: "#FFFBF0", borderColor: "#FDE68A", element: "Spacing Consistency", law: "8pt Grid System", category: "ui_rule", problem: "Vertical spacing between sections appears inconsistent — some gaps are approximately 12px while others are 20px, breaking the visual rhythm.", learnWhy: "The 8pt grid system creates visual harmony by using multiples of 8 for all spacing values. On this screen, inconsistent spacing creates a subtle but noticeable lack of polish that experienced designers immediately notice. It makes the interface feel rushed rather than considered. Linear and Notion use strict 8pt grids throughout their products to create the premium feel that users trust.", fix: "Standardise all spacing to multiples of 8px: use 8, 16, 24, 32, or 48px. Audit every margin and padding value in the design." },
      { id: 4, severity: "win", color: "#00A651", bg: "#F0FDF4", borderColor: "#BBF7D0", element: "Navigation Pattern", law: "Jakob's Law", category: "ux_law", problem: "", learnWhy: "Jakob's Law states that users spend most of their time on other apps and expect your app to work the same way. This screen follows familiar navigation conventions that users already know from apps like Amazon and Flipkart. By meeting user expectations, the app reduces the learning curve to near zero. This is a significant win that directly contributes to user retention and satisfaction.", fix: "Excellent pattern — maintain this consistent navigation structure. Avoid any temptation to 'innovate' on core navigation as it would confuse returning users." },
    ];

    const toggleCard = (id) => {
      setExpandedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const filtered = activeFilter === "all" ? issues : issues.filter(i => i.severity === activeFilter || (activeFilter === "wins" && i.severity === "win"));

    return (
      <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "Inter, sans-serif" }}>
        {/* Score bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 32px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="#F0EBF8" strokeWidth="6" />
                <circle cx="36" cy="36" r="30" fill="none" stroke="#2D0A4E" strokeWidth="6" strokeDasharray="188" strokeDashoffset={188 - (188 * overallScore / 100)} strokeLinecap="round" transform="rotate(-90 36 36)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>{overallScore}</span>
                <span style={{ fontSize: 9, color: "#9CA3AF" }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Overall Score</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: overallScore >= 80 ? "#00A651" : overallScore >= 60 ? "#FF8C00" : "#FF4444" }}>{overallScore >= 80 ? "Good Design" : overallScore >= 60 ? "Needs Work" : "Critical Issues"}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{(analysisResult?.issues?.length || 3)} issues · {(analysisResult?.wins?.length || 1)} wins found</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
            {[["Usability", categoryScores.usability, "#FF8C00"], ["Accessibility", categoryScores.accessibility, "#FF4444"], ["Visual Design", categoryScores.visual_design, "#00A651"], ["Hierarchy", categoryScores.hierarchy, "#2D0A4E"], ["Cognitive Load", categoryScores.cognitive_load, "#FF8C00"]].map(([label, score, color]) => (
              <div key={label} style={{ background: "#F8F9FA", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}>{label}</div>
                <div style={{ height: 2, background: color, borderRadius: 1, marginTop: 6 }} />
              </div>
            ))}
          </div>

          <button onClick={() => { setScreen("home"); setUploaded(false); setFileName(""); setImagePreview(null); }} style={{ background: "#F8F9FA", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 13, color: "#6B7280", whiteSpace: "nowrap", fontWeight: 500 }}>← New Analysis</button>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", height: "calc(100vh - 101px)" }}>
          {/* Left — Annotated screenshot */}
          <div style={{ width: "44%", borderRight: "1px solid #E5E7EB", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1A1A1A" }}>Annotated Design</span>
              <div style={{ display: "flex", gap: 12 }}>
                {[["#FF4444", "Critical"], ["#FF8C00", "Moderate"], ["#FFB020", "Minor"], ["#00A651", "Win"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 10, color: "#6B7280" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#F3F4F6" }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Uploaded design" style={{ width: "100%", display: "block" }} />
                ) : (
                  <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>Your uploaded design appears here</div>
                )}
                {/* {/* Annotation boxes - use real coordinates from API */}
{issues.map((issue) => { - use real coordinates from API */}
                {issues.map((issue) => {
                  const loc = issue.location || { x: 5, y: 10, width: 90, height: 12 };
                  return (
                    <div key={issue.id} style={{ position: "absolute", top: `${loc.y}%`, left: `${loc.x}%`, width: `${loc.width}%`, height: `${loc.height}%`, border: `2px solid ${issue.color}`, borderRadius: 6, pointerEvents: "none" }}>
                      <div style={{ position: "absolute", top: -10, left: -10, width: 20, height: 20, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{issue.id}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Critique cards */}
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>Detailed Critique</h3>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 16px" }}>Ordered by impact. Fix critical issues first.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  ["all", `All (${issues.length})`],
                  ["critical", `Critical (${issues.filter(i=>i.severity==="critical").length})`],
                  ["moderate", `Moderate (${issues.filter(i=>i.severity==="moderate").length})`],
                  ["minor", `Minor (${issues.filter(i=>i.severity==="minor").length})`],
                  ["wins", `Wins (${issues.filter(i=>i.severity==="win").length})`],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setActiveFilter(val)} style={{ padding: "7px 16px", borderRadius: 20, border: activeFilter === val ? "none" : "1px solid #E5E7EB", background: activeFilter === val ? "#2D0A4E" : "#fff", color: activeFilter === val ? "#fff" : "#6B7280", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((issue) => (
                <div key={issue.id} style={{ background: "#fff", border: `1px solid ${issue.borderColor}`, borderLeft: `4px solid ${issue.color}`, borderRadius: "0 12px 12px 0", padding: 20, transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, background: issue.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{issue.id}</div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>{issue.element}</span>
                    </div>
                    <span style={{ background: issue.bg, color: issue.color, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: `1px solid ${issue.color}40`, whiteSpace: "nowrap", textTransform: "capitalize" }}>
                      {issue.severity === "win" ? "✓ Win" : issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </span>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <span style={{ background: "#F0EBF8", color: "#2D0A4E", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{issue.law}</span>
                  </div>

                  {issue.problem && <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, margin: "0 0 12px" }}>{issue.problem}</p>}

                  <button onClick={() => toggleCard(issue.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#2D0A4E", fontSize: 13, fontWeight: 500, padding: "6px 0", marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>📖</span>
                    Learn why {expandedCards.includes(issue.id) ? "▴" : "▾"}
                  </button>

                  {expandedCards.includes(issue.id) && (
                    <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                      <p style={{ fontSize: 13, color: "#4C1D95", lineHeight: 1.7, margin: 0 }}>{issue.learnWhy}</p>
                    </div>
                  )}

                  <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8 }}>
                    <span style={{ color: "#00A651", fontSize: 14, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#166534", lineHeight: 1.5 }}>{issue.fix}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Priority fixes */}
            <div style={{ marginTop: 28 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", margin: "0 0 14px" }}>Priority Fixes</h4>
              <div style={{ display: "flex", gap: 12 }}>
                {priorityFixes.slice(0, 3).map((text, idx) => {
                  const colors = ["#FF4444", "#FF8C00", "#FFB020"];
                  const n = String(idx + 1);
                  const c = colors[idx];
                  return (
                    <div key={n} style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: 16 }}>
                      <div style={{ width: 26, height: 26, background: c, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{n}</div>
                      <p style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5, margin: 0 }}>{text}</p>
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

  // ─── HOME SCREEN ────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#fff", fontFamily: "Inter, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      {/* Navbar */}
      <nav style={{ position: "relative", zIndex: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(45,10,78,0.08)", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#2D0A4E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>✦</span>
          </div>
          <span style={{ fontWeight: 700, color: "#2D0A4E", fontSize: 15 }}>Design Bestie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Features", "Examples", "How it works"].map((l) => (
            <span key={l} style={{ fontSize: 13, color: "#6B7280", cursor: "pointer" }}>{l}</span>
          ))}
          <button style={{ background: "#2D0A4E", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Try It Free</button>
        </div>
      </nav>

      {/* Hero */}
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

          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.65, margin: "14px 0 28px", maxWidth: 400 }}>
            Upload any screen. Get instant expert critique against 50+ UX laws, accessibility standards and cognitive principles.
          </p>

          {/* Upload zone — ONLY for file selection */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{ border: `2px dashed ${isDragging ? "#2D0A4E" : uploaded ? "rgba(45,10,78,0.5)" : "rgba(45,10,78,0.2)"}`, borderRadius: 16, padding: "22px 16px", marginBottom: 14, cursor: "pointer", background: isDragging ? "rgba(240,235,248,0.7)" : uploaded ? "rgba(240,235,248,0.4)" : "rgba(248,249,250,0.6)", transition: "all 0.2s" }}
          >
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleInputChange} />
            {uploaded && imagePreview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 72, height: 52, borderRadius: 8, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2D0A4E", margin: 0 }}>{fileName}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Click to change file</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, background: "#2D0A4E", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v12M11 3L7 7M11 3l4 4M3 17h16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>Drop your screenshot here</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>PNG · JPG · PDF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Analyse button — COMPLETELY SEPARATE */}
          <button
            onClick={() => {
              if (uploaded && imagePreview) {
                setScreen("analysing");
              } else {
                fileInputRef.current?.click();
              }
            }}
            style={{ width: "100%", background: uploaded ? "#00A651" : "rgba(45,10,78,0.4)", color: "#fff", border: "none", padding: "15px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: uploaded ? "pointer" : "default", transition: "all 0.3s", marginBottom: 18, boxShadow: uploaded ? "0 4px 20px rgba(0,166,81,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {uploaded ? (
              <>Analyse My Design <span style={{ fontSize: 16 }}>→</span></>
            ) : (
              "Select a Screenshot to Begin"
            )}
          </button>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {[["#2D0A4E", "50+ UX Laws"], ["#00A651", "WCAG 2.2"], ["#FF8C00", "Nielsen Heuristics"], ["#2D0A4E", "Gestalt"], ["#FF4444", "Cognitive Load"]].map(([c, b]) => (
              <span key={b} style={{ fontSize: 11, color: "#9CA3AF", background: "rgba(255,255,255,0.8)", border: "1px solid #E5E7EB", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: c, display: "inline-block" }} />{b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
