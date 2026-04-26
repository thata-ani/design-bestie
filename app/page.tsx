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

const ALL_PERSONAS = [
  { name: "First-time User", emoji: "👋", desc: "No prior knowledge, relies on what they see" },
  { name: "Power User", emoji: "⚡", desc: "Wants speed, efficiency, no hand-holding" },
  { name: "Accessibility User", emoji: "♿", desc: "Screen reader, keyboard nav, high contrast" },
  { name: "Older User", emoji: "👴", desc: "Needs clarity, larger targets, familiar patterns" },
  { name: "Distracted User", emoji: "😵", desc: "Multitasking, interrupted, can't re-read" },
  { name: "Mobile User", emoji: "📱", desc: "One thumb, small screen, slow connection" },
  { name: "Non-native Speaker", emoji: "🌍", desc: "Struggles with jargon, idioms, dense text" },
];

const patternMeta = {
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

// ── Home Screen ─────────────────────────────────────────────────────────────
function HomeScreen({ onStart, uploaded, fileName, imagePreview, fileInputRef, isDragging, setIsDragging, handleInputChange, handleDrop }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const iconsRef = useRef<any[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const initIcons = (w: number, h: number) => {
      const spacing = 18;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      iconsRef.current = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c + 0.5) * spacing;
          const by = (r + 0.5) * spacing;
          iconsRef.current.push({
            icon: DESIGN_ICONS[(r * cols + c) % DESIGN_ICONS.length],
            x: bx + (Math.random() - 0.5) * 6,
            y: by + (Math.random() - 0.5) * 6,
            baseX: bx, baseY: by,
            size: 13,
            opacity: 0.40 + Math.random() * 0.20,
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
        ctx.strokeStyle = `rgba(29,29,29,${icon.opacity})`;
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
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#F5F5F7", fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <nav style={{ position: "relative", zIndex: 10, background: "rgba(245,245,247,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#1D1D1F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>✦</span>
          </div>
          <span style={{ fontWeight: 700, color: "#1D1D1F", fontSize: 16, letterSpacing: "-0.4px" }}>Design Bestie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Examples", "How it works"].map((l) => (
            <span key={l} style={{ fontSize: 15, color: "#6E6E73", cursor: "pointer" }}>{l}</span>
          ))}
          <button style={{ background: "#1D1D1F", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 22, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try Free →</button>
        </div>
      </nav>
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", padding: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(40px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 28, padding: "48px 56px", maxWidth: 540, width: "100%", boxShadow: "0 4px 60px rgba(0,0,0,0.07)", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: "#1D1D1F", fontWeight: 600 }}>✦ AI-Powered UX Critique</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.08, margin: "0 0 16px", letterSpacing: "-2px", color: "#1D1D1F" }}>
            Your Designs Deserve<br /><span style={{ color: "#2D0A4E" }}>Better Feedback.</span>
          </h1>
          <p style={{ fontSize: 17, color: "#6E6E73", lineHeight: 1.6, margin: "0 0 32px" }}>
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
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#1D1D1F", margin: "0 0 4px" }}>Drop your screenshot here</p>
                  <p style={{ fontSize: 13, color: "#999", margin: 0 }}>PNG · JPG · PDF up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onStart}
            style={{ width: "100%", background: uploaded ? "#2D0A4E" : "rgba(0,0,0,0.08)", color: uploaded ? "#fff" : "#999", border: "none", padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: uploaded ? "pointer" : "default", marginBottom: 20, transition: "all 0.25s", boxShadow: uploaded ? "0 4px 24px rgba(45,10,78,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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

// ── Persona Modal ────────────────────────────────────────────────────────────
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

// ── Issue Card ───────────────────────────────────────────────────────────────
function IssueCard({ issue, expanded, onToggle }: { issue: any; expanded: boolean; onToggle: () => void }) {
  const style = getSeverityStyle(issue.severity);
  const bullets = parseBullets(issue.learn_why || issue.learnWhy);
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5EA", borderLeft: `3px solid ${style.color}`, borderRadius: 10, overflow: "hidden" }}>
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

// ── Annotated Image ──────────────────────────────────────────────────────────
function AnnotatedImage({ imagePreview, issues }: { imagePreview: string; issues: any[] }) {
  return (
    <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
        <img src={imagePreview} alt="Design" style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }} />
        {issues.filter((i) => i.severity !== "win").map((issue) => {
          const loc = issue.location;
          if (!loc || typeof loc.x !== "number") return null;
          const style = getSeverityStyle(issue.severity);
          return (
            <div key={issue.id} style={{ position: "absolute", top: `${loc.y}%`, left: `${loc.x}%`, width: `${loc.width}%`, height: `${loc.height}%`, border: `2px solid ${style.color}`, borderRadius: 4, pointerEvents: "none", boxShadow: "0 0 0 2px rgba(255,255,255,0.9)" }}>
              <div style={{ position: "absolute", top: -11, left: -11, width: 22, height: 22, background: style.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>{issue.id}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function DesignBestie() {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [screen, setScreen] = useState<"home" | "analysing" | "results">("home");
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysingSteps = ["UX Laws and Principles", "UI Rules and Standards", "Accessibility WCAG 2.2", "Nielsen Heuristics", "Gestalt Principles", "Cognitive Load Analysis"];
  const stressSteps = ["Loading personas", "Analysing persona lenses", "Checking accessibility", "Cognitive friction scan", "Cross-persona comparison", "Synthesising insights"];

  // ── Standard analysis ────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "analysing") return;
    setStep(0);
    setAnalysisResult(null);

    let apiDone = false;
    let stepsDone = false;

    const checkDone = () => {
      if (apiDone && stepsDone) {
        setTimeout(() => setScreen("results"), 400);
      }
    };

    const callAPI = async () => {
      try {
        const base64 = imagePreview!.split(",")[1];
        const mimeType = imagePreview!.split(";")[0].split(":")[1];
        const res = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        const json = await res.json();
        if (res.ok && json) {
          setAnalysisResult(json);
        } else {
          console.error("Analyse API error:", json);
          // Still go to results so we don't get stuck
          setAnalysisResult({ overall_score: 0, scores: { usability: 0, accessibility: 0, visual_design: 0, hierarchy: 0, cognitive_load: 0 }, summary: "Analysis failed — please try again.", issues: [], wins: [], priority_fixes: [] });
        }
      } catch (e) {
        console.error("Analyse fetch error:", e);
        setAnalysisResult({ overall_score: 0, scores: { usability: 0, accessibility: 0, visual_design: 0, hierarchy: 0, cognitive_load: 0 }, summary: "Network error — please try again.", issues: [], wins: [], priority_fixes: [] });
      } finally {
        apiDone = true;
        checkDone();
      }
    };

    callAPI();

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= analysingSteps.length) {
        clearInterval(interval);
        stepsDone = true;
        checkDone();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [screen]);

  // ── Stress test ──────────────────────────────────────────────────────────
  const runStressTest = async (personas: string[]) => {
    setShowPersonaModal(false);
    setStressPersonas(personas);
    setIsStressTesting(true);
    setStressStep(0);
    setStressResult(null);
    setActivePersona(0);
    setStressExpandedCards([]);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStressStep(current);
      if (current >= stressSteps.length) clearInterval(interval);
    }, 1400);

    try {
      const base64 = imagePreview!.split(",")[1];
      const mimeType = imagePreview!.split(";")[0].split(":")[1];
      const res = await fetch("/api/stress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, personas }),
      });
      const json = await res.json();
      if (res.ok && json && json.personas) {
        setStressResult(json);
        setActiveTab("stress");
      } else {
        console.error("Stress API error:", json);
        alert("Stress test failed: " + (json?.error || "Unknown error. Check console."));
      }
    } catch (e) {
      console.error("Stress fetch error:", e);
      alert("Stress test network error. Check console.");
    } finally {
      clearInterval(interval);
      setIsStressTesting(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setUploaded(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };

  // ── HOME ─────────────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <HomeScreen
        onStart={() => { if (uploaded && imagePreview) { setActiveTab("analysis"); setAnalysisResult(null); setStressResult(null); setScreen("analysing"); } else fileInputRef.current?.click(); }}
        uploaded={uploaded} fileName={fileName} imagePreview={imagePreview}
        fileInputRef={fileInputRef} isDragging={isDragging} setIsDragging={setIsDragging}
        handleInputChange={handleInputChange} handleDrop={handleDrop}
      />
    );
  }

  // ── ANALYSING ────────────────────────────────────────────────────────────
  if (screen === "analysing") {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <nav style={{ background: "rgba(245,245,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#1D1D1F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14 }}>✦</span></div>
            <span style={{ fontWeight: 700, color: "#1D1D1F", fontSize: 16 }}>Design Bestie</span>
          </div>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 20, padding: "8px 18px", cursor: "pointer", fontSize: 14, color: "#6E6E73" }}>← Back</button>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: 48 }}>
          <div style={{ display: "flex", gap: 80, alignItems: "center", maxWidth: 900, width: "100%" }}>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 220, height: 440 }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg,#3A3A3A,#1A1A1A)", borderRadius: 44, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                  <div style={{ position: "absolute", left: -3, top: 80, width: 3, height: 26, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", left: -3, top: 114, width: 3, height: 40, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", left: -3, top: 162, width: 3, height: 40, background: "#2A2A2A", borderRadius: "2px 0 0 2px" }} />
                  <div style={{ position: "absolute", right: -3, top: 128, width: 3, height: 58, background: "#2A2A2A", borderRadius: "0 2px 2px 0" }} />
                  <div style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, borderRadius: 36, overflow: "hidden", background: "#000" }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="Design" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#444", fontSize: 13 }}>Your design</span></div>}
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
                {analysingSteps.map((s, i) => (
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
                  <span style={{ fontSize: 13, color: "#1D1D1F", fontWeight: 700 }}>{Math.round((step / analysingSteps.length) * 100)}%</span>
                </div>
                <div style={{ height: 4, background: "#E5E5EA", borderRadius: 2 }}>
                  <div style={{ height: "100%", background: "#1D1D1F", borderRadius: 2, width: `${(step / analysingSteps.length) * 100}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
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

    const filtered = activeFilter === "all" ? issues
      : activeFilter === "wins" ? issues.filter((i: any) => i.severity === "win")
      : activeFilter === "critical" ? issues.filter((i: any) => i.severity === "critical")
      : activeFilter === "high" ? issues.filter((i: any) => i.severity === "high" || i.severity === "moderate")
      : issues.filter((i: any) => i.severity === "medium" || i.severity === "minor");

    const hasTabs = stressResult || isStressTesting;
    const topBarH = 82;
    const tabBarH = hasTabs ? 48 : 0;
    const mainH = `calc(100vh - ${topBarH + tabBarH}px)`;

    // Stress tab data
    const persona = stressResult?.personas?.[activePersona];
    const stressIssues = persona ? [
      ...(persona.issues || []),
      ...(persona.wins || []),
    ] : [];
    const toggleStressCard = (id: number) => setStressExpandedCards((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

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
              <div style={{ fontSize: 15, fontWeight: 700, color: overallScore >= 80 ? "#34C759" : overallScore >= 60 ? "#FF9500" : "#FF3B30" }}>
                {overallScore >= 80 ? "Good Design" : overallScore >= 60 ? "Needs Work" : "Critical Issues"}
              </div>
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
            <button
              onClick={() => setShowPersonaModal(true)}
              style={{ background: stressResult ? "#2D0A4E" : "none", color: stressResult ? "#fff" : "#2D0A4E", border: `1px solid ${stressResult ? "#2D0A4E" : "#C4B0D8"}`, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
            >
              {isStressTesting
                ? <><div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> Running…</>
                : <><span>🧪</span>{stressResult ? "Stress Test ✓" : "Stress Test"}</>}
            </button>
            <button
              onClick={() => { setScreen("home"); setUploaded(false); setFileName(""); setImagePreview(null); setAnalysisResult(null); setStressResult(null); setExpandedCards([]); setActiveTab("analysis"); }}
              style={{ background: "none", border: "1px solid #D2D2D7", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6E6E73", fontWeight: 500 }}
            >← New Analysis</button>
          </div>
        </div>

        {/* TAB BAR */}
        {hasTabs && (
          <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "0 24px", display: "flex", height: tabBarH, boxSizing: "border-box" }}>
            {(["analysis", "stress"] as const).map((key) => (
              <button
                key={key}
                onClick={() => { if (!isStressTesting || key === "analysis") setActiveTab(key); }}
                style={{ background: "none", border: "none", padding: "0 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: activeTab === key ? "#1D1D1F" : "#AEAEB2", borderBottom: activeTab === key ? "2px solid #1D1D1F" : "2px solid transparent" }}
              >
                {key === "analysis" ? "Analysis" : isStressTesting ? "Running Stress Test…" : `Stress Test · ${stressPersonas.length} persona${stressPersonas.length > 1 ? "s" : ""}`}
              </button>
            ))}
          </div>
        )}

        {/* MAIN */}
        <div style={{ display: "flex", height: mainH }}>

          {/* ── ANALYSIS TAB ── */}
          {activeTab === "analysis" && (
            <>
              {/* LEFT */}
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
                {imagePreview && <AnnotatedImage imagePreview={imagePreview} issues={issues} />}
              </div>

              {/* RIGHT */}
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
                        <span style={{ background: readingPattern.is_following ? "#F0FFF4" : "#FFF5F4", color: readingPattern.is_following ? "#34C759" : "#FF3B30", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>
                          {readingPattern.is_following ? "✓ Following" : "✗ Not following"}
                        </span>
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
                      <IssueCard key={issue.id} issue={issue} expanded={expandedCards.includes(issue.id)} onToggle={() => toggleCard(issue.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── STRESS TAB ── */}
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
                {/* LEFT — persona list */}
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
                  {imagePreview && persona && <AnnotatedImage imagePreview={imagePreview} issues={stressIssues} />}
                </div>

                {/* RIGHT — persona detail */}
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
                            <IssueCard key={issue.id} issue={issue} expanded={stressExpandedCards.includes(issue.id)} onToggle={() => toggleStressCard(issue.id)} />
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

  // Fallback — analysis in progress but result not yet set
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

  return null;
}
