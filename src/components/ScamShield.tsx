"use client";

import { useState, useEffect, CSSProperties } from "react";

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
    color: "#ff3b3b",
    bg: "rgba(255,59,59,0.08)",
    border: "rgba(255,59,59,0.3)",
    icon: "⛔",
    label: "CONFIRMED SCAM",
    glow: "0 0 40px rgba(255,59,59,0.2)",
  },
  WARNING: {
    color: "#ffb800",
    bg: "rgba(255,184,0,0.08)",
    border: "rgba(255,184,0,0.3)",
    icon: "⚠️",
    label: "SUSPICIOUS",
    glow: "0 0 40px rgba(255,184,0,0.2)",
  },
  SAFE: {
    color: "#00d97e",
    bg: "rgba(0,217,126,0.08)",
    border: "rgba(0,217,126,0.3)",
    icon: "✅",
    label: "LOOKS SAFE",
    glow: "0 0 40px rgba(0,217,126,0.2)",
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

export default function ScamShield() {
  const [input, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const [hoveredExample, setHoveredExample] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading) { setDots(""); return; }
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(id);
  }, [loading]);

  async function analyze() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
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
  const btnActive = !loading && input.trim().length > 0;

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        button { cursor: pointer; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080c12",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        color: "#c8d4e0",
        position: "relative",
        overflow: "hidden",
      }}>

        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,184,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div style={{
          position: "fixed", top: "-300px", left: "50%",
          transform: "translateX(-50%)",
          width: "800px", height: "600px",
          background: "radial-gradient(ellipse, rgba(255,184,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "680px", margin: "0 auto",
          padding: "48px 24px 80px",
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>

          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.25)",
              color: "#ffb800", padding: "6px 16px", borderRadius: "4px",
              fontSize: "10px", letterSpacing: "0.15em", marginBottom: "24px",
              textTransform: "uppercase",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#ffb800", boxShadow: "0 0 8px #ffb800",
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              }} />
              ACTIVE PROTECTION
            </div>

            <h1 style={{
              fontSize: "clamp(44px, 7vw, 72px)",
              fontWeight: 700, lineHeight: 1,
              letterSpacing: "-0.04em",
              margin: "0 0 12px 0",
              color: "#f0f4f8",
            }}>
              SCAM<span style={{ color: "#ffb800" }}>SHIELD</span>
            </h1>

            <p style={{
              fontSize: "14px", color: "rgba(200,212,224,0.5)",
              lineHeight: 1.6, maxWidth: "400px", margin: "12px auto 0",
              fontFamily: "sans-serif", fontWeight: 300,
            }}>
              Paste any suspicious text, email, or message.<br />
              AI detects scams in seconds — free, private, instant.
            </p>

            <div style={{
              display: "flex", justifyContent: "center", gap: "32px",
              marginTop: "28px", paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              {[
                ["$1T+", "Lost to scams/year"],
                ["3.2B", "Scam msgs sent daily"],
                ["Free", "Always & forever"],
              ].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffb800" }}>{val}</div>
                  <div style={{ fontSize: "10px", color: "rgba(200,212,224,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", color: "rgba(200,212,224,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
              Try an example →
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {EXAMPLES.map((ex) => {
                const hovered = hoveredExample === ex.label;
                return (
                  <button key={ex.label}
                    onClick={() => { setText(ex.text); setResult(null); setError(""); }}
                    onMouseEnter={() => setHoveredExample(ex.label)}
                    onMouseLeave={() => setHoveredExample(null)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${hovered ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: hovered ? "#ffb800" : "rgba(200,212,224,0.7)",
                      padding: "6px 12px", borderRadius: "4px",
                      fontSize: "11px", fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                  >{ex.label}</button>
                );
              })}
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: "16px" }}>
            <textarea
              value={input}
              onChange={(e) => { setText(e.target.value); setResult(null); setError(""); }}
              placeholder="Paste suspicious message here..."
              rows={6}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "20px",
                color: "#f0f4f8", fontSize: "14px", lineHeight: 1.7,
                fontFamily: "inherit", resize: "none",
                transition: "border-color 0.2s",
              } as CSSProperties}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,184,0,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            {input && (
              <button
                onClick={() => { setText(""); setResult(null); setError(""); }}
                style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "none", border: "none",
                  color: "rgba(200,212,224,0.3)", fontSize: "18px", lineHeight: 1, padding: "4px",
                }}
              >✕</button>
            )}
          </div>

          <button
            onClick={analyze}
            disabled={!btnActive}
            style={{
              width: "100%", padding: "16px",
              background: btnActive ? "#ffb800" : "rgba(255,184,0,0.1)",
              border: `1px solid ${btnActive ? "#ffb800" : "rgba(255,184,0,0.2)"}`,
              borderRadius: "6px",
              color: btnActive ? "#080c12" : "rgba(255,184,0,0.4)",
              fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", fontFamily: "inherit",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => { if (btnActive) e.currentTarget.style.background = "#ffd000"; }}
            onMouseLeave={(e) => { if (btnActive) e.currentTarget.style.background = "#ffb800"; }}
          >
            {loading ? `ANALYZING${dots}` : "⚡ SCAN FOR SCAM"}
          </button>

          {error && (
            <div style={{
              marginTop: "16px", padding: "14px",
              background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.2)",
              borderRadius: "6px", color: "#ff6b6b", fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          {result && cfg && (
            <div style={{
              marginTop: "28px",
              border: `1px solid ${cfg.border}`,
              borderRadius: "12px",
              background: cfg.bg,
              boxShadow: cfg.glow,
              overflow: "hidden",
              animation: "fadeSlide 0.5s cubic-bezier(0.16,1,0.3,1)",
            }}>

              <div style={{
                padding: "24px 28px",
                borderBottom: `1px solid ${cfg.border}`,
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "36px" }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontSize: "11px", color: cfg.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 600, color: "#f0f4f8", fontFamily: "sans-serif" }}>
                      {result.scamType}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "rgba(200,212,224,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Risk Score
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "100px", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: "3px",
                        width: `${result.riskScore}%`,
                        background: result.riskScore > 70 ? "#ff3b3b" : result.riskScore > 40 ? "#ffb800" : "#00d97e",
                        transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                      }} />
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: cfg.color }}>{result.riskScore}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px 28px", borderBottom: `1px solid ${cfg.border}` }}>
                <p style={{ fontSize: "14px", color: "rgba(240,244,248,0.85)", lineHeight: 1.7, fontFamily: "sans-serif", margin: 0 }}>
                  {result.summary}
                </p>
              </div>

              <div style={{ padding: "20px 28px", borderBottom: `1px solid ${cfg.border}` }}>
                <div style={{ fontSize: "10px", color: "rgba(200,212,224,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
                  {result.verdict === "SAFE" ? "✓ Positive Signals" : "⚑ Red Flags Detected"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.redFlags.map((flag, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: cfg.color, fontSize: "12px", marginTop: "2px", flexShrink: 0 }}>
                        {result.verdict === "SAFE" ? "✓" : "→"}
                      </span>
                      <span style={{ fontSize: "13px", color: "rgba(240,244,248,0.75)", lineHeight: 1.5, fontFamily: "sans-serif" }}>
                        {flag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "20px 28px" }}>
                <div style={{ fontSize: "10px", color: "rgba(200,212,224,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
                  ◈ What You Should Do
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.whatToDo.map((action, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "12px", alignItems: "flex-start",
                      background: "rgba(255,255,255,0.03)", padding: "12px 14px",
                      borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <span style={{
                        width: "22px", height: "22px", borderRadius: "50%",
                        background: cfg.color, color: "#080c12",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: "13px", color: "rgba(240,244,248,0.8)", lineHeight: 1.5, fontFamily: "sans-serif", paddingTop: "2px" }}>
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "48px", fontSize: "11px", color: "rgba(200,212,224,0.2)", lineHeight: 1.8 }}>
            <div>ScamShield AI · Powered by Groq + Llama 3.3 · 100% Free</div>
            <div style={{ marginTop: "4px" }}>Your messages are never stored · Built to protect everyone</div>
          </div>

        </div>
      </div>
    </>
  );
}
