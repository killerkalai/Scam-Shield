"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";

const EXAMPLES = [
  {
    label: "📱 Suspicious SMS",
    text: "URGENT: Your Bank of America account has been LOCKED due to suspicious activity. Verify now or lose access permanently: http://boa-secure-verify.net/login",
  },
  {
    label: "💼 Fake Job Offer",
    text: "Hello! We found your resume online. We offer $5,000/week work from home. No experience needed. Just send $200 registration fee to start immediately. Reply YES to apply.",
  },
  {
    label: "🎁 Prize Scam",
    text: "Congratulations! You have been selected as a winner of our $1,000,000 lottery. To claim your prize, please provide your Social Security Number and pay a $50 processing fee.",
  },
  {
    label: "✅ Legitimate Message",
    text: "Hi, this is a reminder from your dentist office that you have an appointment scheduled for tomorrow, March 9th at 2pm. Reply CONFIRM to confirm or call us at (555) 234-5678 to reschedule.",
  },
];

const VERDICT_CONFIG: Record<string, {
  color: string; bg: string; border: string;
  icon: string; label: string; glow: string;
}> = {
  DANGER: {
    color: "#ff3b3b", bg: "rgba(255,59,59,0.06)", border: "rgba(255,59,59,0.35)",
    icon: "⛔", label: "CONFIRMED SCAM", glow: "0 0 60px rgba(255,59,59,0.25)",
  },
  WARNING: {
    color: "#ffb800", bg: "rgba(255,184,0,0.06)", border: "rgba(255,184,0,0.35)",
    icon: "⚠️", label: "SUSPICIOUS", glow: "0 0 60px rgba(255,184,0,0.25)",
  },
  SAFE: {
    color: "#00d97e", bg: "rgba(0,217,126,0.06)", border: "rgba(0,217,126,0.35)",
    icon: "✅", label: "LOOKS SAFE", glow: "0 0 60px rgba(0,217,126,0.25)",
  },
};

interface AnalysisResult {
  verdict: "DANGER" | "WARNING" | "SAFE";
  scamType: string;
  riskScore: number;
  summary: string;
  redFlags: string[];
  whatToDo: string[];
}

function useCountUp(target: number, duration: number = 1200, active: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    setCount(0);
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

export default function ScamShield() {
  const [input, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");
  const [phase, setPhase] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<"text" | "image">("text");
  const [hoveredExample, setHoveredExample] = useState<string | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [glitchText, setGlitchText] = useState("SCAM");
  const fileRef = useRef<HTMLInputElement>(null);
  const score = useCountUp(result?.riskScore ?? 0, 1500, showResult);

  // Staggered page load
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 700),
      setTimeout(() => setPhase(4), 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Glitch effect on SCAM text
  useEffect(() => {
    const chars = "X#@!%$&*?";
    let iterations = 0;
    const original = "SCAM";
    const interval = setInterval(() => {
      if (iterations > 12) { setGlitchText("SCAM"); clearInterval(interval); return; }
      setGlitchText(
        original.split("").map((c, i) =>
          i < iterations / 3 ? c : chars[Math.floor(Math.random() * chars.length)]
        ).join("")
      );
      iterations++;
    }, 80);
    const loop = setInterval(() => {
      let it = 0;
      const inner = setInterval(() => {
        if (it > 12) { setGlitchText("SCAM"); clearInterval(inner); return; }
        setGlitchText(
          original.split("").map((c, i) =>
            i < it / 3 ? c : chars[Math.floor(Math.random() * chars.length)]
          ).join("")
        );
        it++;
      }, 80);
    }, 6000);
    return () => { clearInterval(interval); clearInterval(loop); };
  }, []);

  useEffect(() => {
    if (!loading) { setDots(""); setScanLine(0); return; }
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    const scanId = setInterval(() => setScanLine((s) => (s + 2) % 102), 20);
    return () => { clearInterval(id); clearInterval(scanId); };
  }, [loading]);

  useEffect(() => {
    if (result) { setTimeout(() => setShowResult(true), 100); }
    else { setShowResult(false); }
  }, [result]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setImageName(file.name);
      setResult(null); setError("");
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (tab === "text" && !input.trim()) return;
    if (tab === "image" && !image) return;
    setLoading(true); setResult(null); setError(""); setShowResult(false);
    try {
      const body = tab === "text" ? { message: input } : { message: "", image };
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const cfg = result ? VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.WARNING : null;
  const btnActive = !loading && (tab === "text" ? input.trim().length > 0 : image !== null);

  const stagger = (i: number) => ({
    opacity: phase > i ? 1 : 0,
    transform: phase > i ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
  });

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes gridShift {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(255,184,0,0.2); box-shadow: 0 0 0 rgba(255,184,0,0); }
          50%       { border-color: rgba(255,184,0,0.5); box-shadow: 0 0 20px rgba(255,184,0,0.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(255,184,0,0.3); }
          50%       { text-shadow: 0 0 30px rgba(255,184,0,0.8), 0 0 60px rgba(255,184,0,0.4); }
        }
        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96%            { opacity: 0.4; }
          98%            { opacity: 0.8; }
        }
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        button { cursor: pointer; }
        .example-btn:hover {
          border-color: rgba(255,184,0,0.5) !important;
          color: #ffb800 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255,184,0,0.15);
        }
        .scan-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,184,0,0.35) !important;
        }
        .flag-row { animation: slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .action-row { animation: slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .about-card:hover {
          border-color: rgba(255,184,0,0.15) !important;
          background: rgba(255,255,255,0.035) !important;
          transform: translateX(4px);
        }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#060a10",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        color: "#c8d4e0", position: "relative", overflow: "hidden",
        
      }}>

        {/* Animated grid */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,184,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridShift 8s linear infinite",
        }} />

        {/* Moving scanline */}
        <div style={{
          position: "fixed", left: 0, right: 0, height: "2px", zIndex: 0, pointerEvents: "none",
          background: "linear-gradient(90deg, transparent, rgba(255,184,0,0.06), transparent)",
          animation: "scanline 8s linear infinite",
        }} />

        {/* Corner decorations */}
        {(["top-left","top-right","bottom-left","bottom-right"] as const).map((pos) => (
          <div key={pos} style={{
            position: "fixed", zIndex: 0, pointerEvents: "none",
            ...(pos.includes("top") ? { top: "16px" } : { bottom: "16px" }),
            ...(pos.includes("left") ? { left: "16px" } : { right: "16px" }),
            width: "48px", height: "48px",
            borderTop: pos.includes("top") ? "1px solid rgba(255,184,0,0.12)" : "none",
            borderBottom: pos.includes("bottom") ? "1px solid rgba(255,184,0,0.12)" : "none",
            borderLeft: pos.includes("left") ? "1px solid rgba(255,184,0,0.12)" : "none",
            borderRight: pos.includes("right") ? "1px solid rgba(255,184,0,0.12)" : "none",
          }} />
        ))}

        {/* Ambient glow */}
        <div style={{
          position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "700px",
          background: "radial-gradient(ellipse, rgba(255,184,0,0.07) 0%, transparent 65%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", top: "40%", left: "-100px", width: "300px", height: "300px",
          background: "radial-gradient(ellipse, rgba(255,59,59,0.04) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", top: "60%", right: "-100px", width: "300px", height: "300px",
          background: "radial-gradient(ellipse, rgba(0,217,126,0.04) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "700px", margin: "0 auto", padding: "52px 24px 80px",
        }}>

          {/* ── HEADER ── */}
          <div style={{ textAlign: "center", marginBottom: "52px", ...stagger(0) }}>

            {/* Floating shield */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: "28px", animation: "float 4s ease-in-out infinite" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", margin: "0 auto", position: "relative",
                boxShadow: "0 0 30px rgba(255,184,0,0.1)",
              }}>
                🛡️
                <div style={{
                  position: "absolute", inset: "-12px", borderRadius: "50%",
                  border: "1px solid transparent",
                  borderTopColor: "rgba(255,184,0,0.4)", borderRightColor: "rgba(255,184,0,0.2)",
                  animation: "spin 3s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: "-22px", borderRadius: "50%",
                  border: "1px solid transparent",
                  borderBottomColor: "rgba(255,184,0,0.15)", borderLeftColor: "rgba(255,184,0,0.08)",
                  animation: "spinReverse 5s linear infinite",
                }} />
              </div>
            </div>

            {/* Active badge */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)",
                color: "#ffb800", padding: "6px 18px", borderRadius: "20px",
                fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
                animation: "borderGlow 3s ease-in-out infinite",
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#ffb800", boxShadow: "0 0 6px #ffb800",
                  display: "inline-block", animation: "pulse 1.5s ease-in-out infinite",
                }} />
                ACTIVE PROTECTION
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#ffb800", boxShadow: "0 0 6px #ffb800",
                  display: "inline-block", animation: "pulse 1.5s ease-in-out infinite 0.75s",
                }} />
              </div>
            </div>

            {/* Glitch logo */}
            <h1 style={{
              fontSize: "clamp(52px, 9vw, 84px)", fontWeight: 700, lineHeight: 0.95,
              letterSpacing: "-0.05em", margin: "0 0 16px 0",
            }}>
              <span style={{
                background: "linear-gradient(135deg, #f0f4f8 0%, #a0b4c8 50%, #f0f4f8 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 4s linear infinite",
                display: "inline-block",
              }}>{glitchText}</span>
              <span style={{
                background: "linear-gradient(135deg, #ffb800 0%, #ffd700 50%, #ffb800 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 4s linear infinite 0.5s, glowPulse 3s ease-in-out infinite",
                display: "inline-block",
              }}>SHIELD</span>
            </h1>

            {/* Typewriter subtitle */}
            <div style={{
              fontSize: "13px", color: "rgba(200,212,224,0.45)",
              lineHeight: 1.7, maxWidth: "420px", margin: "0 auto",
              fontFamily: "sans-serif", fontWeight: 300, letterSpacing: "0.01em",
            }}>
              <span style={{ color: "rgba(255,184,0,0.4)" }}>{">"}</span>
              {" "}Paste suspicious text or upload a screenshot.
              <br />
              <span style={{ color: "rgba(255,184,0,0.4)" }}>{">"}</span>
              {" "}AI-powered scam detection — free, private, instant.
              <span style={{
                display: "inline-block", width: "2px", height: "13px",
                background: "#ffb800", marginLeft: "2px", verticalAlign: "middle",
                animation: "blink 1s step-end infinite",
              }} />
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", justifyContent: "center",
              marginTop: "32px", paddingTop: "28px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[["$1T+", "Lost to scams/yr"], ["3.2B", "Scam msgs daily"], ["0ms", "Data stored"]].map(([val, lbl], i) => (
                <div key={lbl} style={{
                  textAlign: "center", flex: 1, padding: "0 16px",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{
                    fontSize: "22px", fontWeight: 700, color: "#ffb800",
                    letterSpacing: "-0.02em", marginBottom: "4px",
                    animation: "glowPulse 3s ease-in-out infinite",
                    animationDelay: `${i * 0.5}s`,
                  }}>{val}</div>
                  <div style={{ fontSize: "9px", color: "rgba(200,212,224,0.3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ ...stagger(1), marginBottom: "20px" }}>
            <div style={{
              display: "flex", gap: "4px", padding: "4px",
              background: "rgba(255,255,255,0.025)", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {(["text", "image"] as const).map((t) => (
                <button key={t}
                  onClick={() => { setTab(t); setResult(null); setError(""); }}
                  style={{
                    flex: 1, padding: "11px",
                    background: tab === t ? "linear-gradient(135deg, #ffb800, #ffd000)" : "transparent",
                    border: "none", borderRadius: "7px",
                    color: tab === t ? "#060a10" : "rgba(200,212,224,0.4)",
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", fontFamily: "inherit",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: tab === t ? "0 4px 16px rgba(255,184,0,0.3)" : "none",
                  }}>
                  {t === "text" ? "📝  Paste Text" : "🖼️  Upload Image"}
                </button>
              ))}
            </div>
          </div>

          {/* ── TEXT TAB ── */}
          {tab === "text" && (
            <div style={{ ...stagger(2) }}>
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "9px", color: "rgba(200,212,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>
                  ↗ Try an example
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="example-btn"
                      onClick={() => { setText(ex.text); setResult(null); setError(""); }}
                      onMouseEnter={() => setHoveredExample(ex.label)}
                      onMouseLeave={() => setHoveredExample(null)}
                      style={{
                        background: hoveredExample === ex.label ? "rgba(255,184,0,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${hoveredExample === ex.label ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: hoveredExample === ex.label ? "#ffb800" : "rgba(200,212,224,0.55)",
                        padding: "6px 12px", borderRadius: "6px",
                        fontSize: "11px", fontFamily: "inherit",
                        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >{ex.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: "14px" }}>
                <textarea
                  value={input}
                  onChange={(e) => { setText(e.target.value); setResult(null); setError(""); }}
                  placeholder="Paste suspicious message here..."
                  rows={6}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "20px",
                    color: "#f0f4f8", fontSize: "14px", lineHeight: 1.75,
                    fontFamily: "inherit", resize: "none", transition: "all 0.3s ease",
                  } as CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,184,0,0.4)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,184,0,0.06)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.035)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  }}
                />
                {input && (
                  <button onClick={() => { setText(""); setResult(null); setError(""); }}
                    style={{
                      position: "absolute", top: "12px", right: "12px",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "50%", width: "24px", height: "24px",
                      color: "rgba(200,212,224,0.5)", fontSize: "12px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>✕</button>
                )}
                {input && (
                  <div style={{
                    position: "absolute", bottom: "12px", right: "12px",
                    fontSize: "10px", color: "rgba(200,212,224,0.2)",
                  }}>{input.length}/5000</div>
                )}
              </div>
            </div>
          )}

          {/* ── IMAGE TAB ── */}
          {tab === "image" && (
            <div style={{ marginBottom: "14px", ...stagger(2) }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {!image ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setDragOver(false);
                    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? "rgba(255,184,0,0.7)" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: "12px", padding: "56px 24px", textAlign: "center", cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    background: dragOver ? "rgba(255,184,0,0.06)" : "rgba(255,255,255,0.015)",
                    transform: dragOver ? "scale(1.01)" : "scale(1)",
                    boxShadow: dragOver ? "0 0 40px rgba(255,184,0,0.1)" : "none",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "16px", filter: dragOver ? "drop-shadow(0 0 12px rgba(255,184,0,0.5))" : "none", transition: "filter 0.3s" }}>🖼️</div>
                  <div style={{ fontSize: "15px", color: dragOver ? "#ffb800" : "rgba(200,212,224,0.5)", fontFamily: "sans-serif", fontWeight: 500, marginBottom: "8px", transition: "color 0.3s" }}>
                    {dragOver ? "Drop it!" : "Click to upload or drag & drop"}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(200,212,224,0.25)", fontFamily: "sans-serif" }}>PNG · JPG · WEBP · up to 5MB</div>
                </div>
              ) : (
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", animation: "fadeSlide 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                  <img src={image} alt="Uploaded" style={{ width: "100%", maxHeight: "280px", objectFit: "contain", background: "rgba(255,255,255,0.02)", display: "block" }} />
                  <div style={{ padding: "10px 16px", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "11px", color: "rgba(200,212,224,0.5)", fontFamily: "sans-serif" }}>📎 {imageName}</span>
                    <button onClick={() => { setImage(null); setImageName(""); setResult(null); setError(""); }}
                      style={{ background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.2)", borderRadius: "4px", color: "#ff6b6b", fontSize: "11px", padding: "3px 10px", fontFamily: "inherit", transition: "all 0.2s" }}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SCAN BUTTON ── */}
          <div style={{ position: "relative", marginBottom: "16px", ...stagger(3) }}>
            <button onClick={analyze} disabled={!btnActive} className="scan-btn"
              style={{
                width: "100%", padding: "18px",
                background: btnActive ? "linear-gradient(135deg, #ffb800 0%, #ffd000 50%, #ffb800 100%)" : "rgba(255,184,0,0.06)",
                backgroundSize: "200% auto",
                border: `1px solid ${btnActive ? "rgba(255,200,0,0.6)" : "rgba(255,184,0,0.15)"}`,
                borderRadius: "10px",
                color: btnActive ? "#060a10" : "rgba(255,184,0,0.3)",
                fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", fontFamily: "inherit",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                position: "relative", overflow: "hidden",
                animation: btnActive ? "shimmer 3s linear infinite" : "none",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <span style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    border: "2px solid rgba(6,10,16,0.3)", borderTopColor: "#060a10",
                    display: "inline-block", animation: "spin 0.8s linear infinite",
                  }} />
                  ANALYZING{dots}
                </span>
              ) : "⚡  SCAN FOR SCAM"}
            </button>
            {loading && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "rgba(0,0,0,0.3)", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${scanLine}%`, background: "linear-gradient(90deg, transparent, #060a10, transparent)", transition: "width 0.02s linear" }} />
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ marginBottom: "16px", padding: "20px", background: "rgba(255,184,0,0.04)", border: "1px solid rgba(255,184,0,0.15)", borderRadius: "10px", animation: "fadeSlide 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffb800", animation: "pulse 1s ease-in-out infinite", boxShadow: "0 0 8px #ffb800" }} />
                <span style={{ fontSize: "11px", color: "#ffb800", letterSpacing: "0.1em" }}>SCANNING MESSAGE</span>
              </div>
              {["Checking for phishing patterns", "Analyzing urgency signals", "Verifying sender credibility", "Computing risk score"].map((step, i) => (
                <div key={step} style={{ fontSize: "11px", color: "rgba(200,212,224,0.4)", padding: "4px 0", fontFamily: "sans-serif", animation: `fadeSlide 0.4s ease ${i * 0.15}s both`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ffb800", fontSize: "9px" }}>▶</span>
                  {step}
                  <span style={{ animation: `pulse ${1 + i * 0.2}s ease-in-out infinite`, color: "#ffb800" }}>...</span>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginBottom: "16px", padding: "16px", background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)", borderRadius: "10px", color: "#ff6b6b", fontSize: "13px", animation: "fadeSlide 0.3s ease", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>{error}
            </div>
          )}

          {/* ── RESULT ── */}
          {result && cfg && (
            <div style={{
              border: `1px solid ${cfg.border}`, borderRadius: "14px", background: cfg.bg,
              boxShadow: showResult ? cfg.glow : "none", overflow: "hidden",
              animation: "fadeSlide 0.6s cubic-bezier(0.16,1,0.3,1)", transition: "box-shadow 0.5s ease",
            }}>
              <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />

              {/* Verdict header */}
              <div style={{ padding: "28px 32px", borderBottom: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "60px", height: "60px", borderRadius: "50%",
                    background: `${cfg.color}18`, border: `1px solid ${cfg.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "26px", flexShrink: 0,
                    boxShadow: `0 0 20px ${cfg.color}20`,
                    animation: "float 3s ease-in-out infinite",
                  }}>{cfg.icon}</div>
                  <div>
                    <div style={{ fontSize: "10px", color: cfg.color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "5px", fontWeight: 700, animation: "glowPulse 2s ease-in-out infinite" }}>{cfg.label}</div>
                    <div style={{ fontSize: "18px", fontWeight: 600, color: "#f0f4f8", fontFamily: "sans-serif" }}>{result.scamType}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "9px", color: "rgba(200,212,224,0.35)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Risk Score</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "120px", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: "3px",
                        width: showResult ? `${result.riskScore}%` : "0%",
                        background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                        transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)",
                        boxShadow: `0 0 8px ${cfg.color}60`,
                      }} />
                    </div>
                    <span style={{ fontSize: "28px", fontWeight: 700, color: cfg.color, textShadow: `0 0 20px ${cfg.color}60` }}>{score}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: "22px 32px", borderBottom: `1px solid ${cfg.border}` }}>
                <p style={{ fontSize: "14px", color: "rgba(240,244,248,0.8)", lineHeight: 1.8, fontFamily: "sans-serif", margin: 0, fontWeight: 300 }}>{result.summary}</p>
              </div>

              {/* Red flags — FIXED: removed duplicate fontSize */}
              <div style={{ padding: "22px 32px", borderBottom: `1px solid ${cfg.border}` }}>
                <div style={{ fontSize: "9px", color: "rgba(200,212,224,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>
                  {result.verdict === "SAFE" ? "✓  Positive Signals" : "⚑  Red Flags Detected"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.redFlags.map((flag, i) => (
                    <div key={i} className="flag-row" style={{ display: "flex", gap: "12px", alignItems: "flex-start", animationDelay: `${i * 0.1}s` }}>
                      <span style={{
                        color: cfg.color, flexShrink: 0,
                        width: "18px", height: "18px", borderRadius: "50%",
                        background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", marginTop: "2px",
                      }}>
                        {result.verdict === "SAFE" ? "✓" : "!"}
                      </span>
                      <span style={{ fontSize: "13px", color: "rgba(240,244,248,0.7)", lineHeight: 1.6, fontFamily: "sans-serif" }}>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: "22px 32px" }}>
                <div style={{ fontSize: "9px", color: "rgba(200,212,224,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>◈  Recommended Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.whatToDo.map((action, i) => (
                    <div key={i} className="action-row" style={{
                      display: "flex", gap: "14px", alignItems: "flex-start",
                      background: "rgba(255,255,255,0.02)", padding: "14px 16px",
                      borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
                      animationDelay: `${i * 0.12}s`, transition: "all 0.2s",
                    }}>
                      <span style={{
                        width: "24px", height: "24px", borderRadius: "6px",
                        background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}aa)`,
                        color: "#060a10", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, flexShrink: 0,
                        boxShadow: `0 2px 8px ${cfg.color}40`,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: "13px", color: "rgba(240,244,248,0.75)", lineHeight: 1.6, fontFamily: "sans-serif", paddingTop: "2px" }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${cfg.color}30, transparent)` }} />
            </div>
          )}

          {/* ── ABOUT SECTION ── */}
          <div style={{ marginTop: "52px", padding: "32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", ...stagger(4) }}>
            <div style={{ fontSize: "9px", color: "rgba(255,184,0,0.6)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px", fontWeight: 700 }}>
              ◈ Why We Built This
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { icon: "💡", title: "The Problem", text: "Over $1 trillion is lost to scams every year. Elderly people, immigrants, and anyone unfamiliar with digital fraud are targeted daily through SMS, email, WhatsApp, and social media." },
                { icon: "🛡️", title: "Our Mission", text: "We built ScamShield to give everyone — for free — access to AI-powered scam detection. No sign-up, no tracking, no data stored. Just paste a message and get an instant verdict." },
                { icon: "🤖", title: "How It Works", text: "ScamShield uses Llama 3.3 (70B) running on Groq's ultra-fast infrastructure to analyze messages for phishing patterns, urgency manipulation, fake branding, suspicious links, and social engineering tactics." },
                { icon: "🔒", title: "Your Privacy", text: "Your messages are analyzed in real-time and never stored on our servers. We don't log, sell, or share any data. What you paste here stays here." },
              ].map((item, i) => (
                <div key={item.title} className="about-card" style={{
                  display: "flex", gap: "16px", alignItems: "flex-start",
                  padding: "16px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                  animation: `slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                }}>
                  <span style={{ fontSize: "22px", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f0f4f8", marginBottom: "5px", letterSpacing: "0.03em" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "rgba(200,212,224,0.45)", lineHeight: 1.7, fontFamily: "sans-serif", fontWeight: 300 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ textAlign: "center", marginTop: "36px", fontSize: "10px", color: "rgba(200,212,224,0.15)", lineHeight: 2, letterSpacing: "0.05em", ...stagger(4) }}>
            <div style={{ marginBottom: "8px" }}>
              {["ScamShield AI", "Groq + Llama 3.3", "100% Free"].map((item, i) => (
                <span key={item}>
                  {item}
                  {i < 2 && <span style={{ margin: "0 10px", color: "rgba(255,184,0,0.2)" }}>·</span>}
                </span>
              ))}
            </div>
            <div style={{ color: "rgba(200,212,224,0.1)", marginBottom: "14px" }}>Messages never stored · Privacy first · Built to protect everyone</div>
            <a href="mailto:nobodyai.contact@gmail.com" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "8px 18px", borderRadius: "6px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,184,0,0.45)", fontSize: "10px",
              textDecoration: "none", letterSpacing: "0.04em", transition: "all 0.25s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ffb800"; e.currentTarget.style.borderColor = "rgba(255,184,0,0.3)"; e.currentTarget.style.background = "rgba(255,184,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,184,0,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              ✉️ &nbsp;Bugs or issues? &nbsp;nobodyai.contact@gmail.com
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
