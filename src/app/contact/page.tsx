"use client";
import { useEffect, useState } from "react";

export default function ContactPage() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const stagger = (i: number) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
  });

  function copyEmail() {
    navigator.clipboard.writeText("nobodyai.contact@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const reasons = [
    { icon: "🐛", title: "Bug Reports", text: "Found something broken? Let us know what happened and we'll fix it fast." },
    { icon: "💡", title: "Feature Ideas", text: "Have an idea to make ScamShield better? We'd love to hear it." },
    { icon: "🤝", title: "Partnerships", text: "Want to integrate ScamShield or collaborate? Reach out." },
    { icon: "❤️", title: "Just Say Hi", text: "Did ScamShield help you? We'd love to hear your story." },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#060a10",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: "#c8d4e0",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,184,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div style={{
        position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "600px",
        background: "radial-gradient(ellipse, rgba(255,184,0,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "52px", ...stagger(0) }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)",
            color: "#ffb800", padding: "6px 18px", borderRadius: "20px",
            fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "24px",
          }}>✉️ Get In Touch</div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 16px 0", color: "#f0f4f8",
          }}>
            Contact<br /><span style={{ color: "#ffb800" }}>ScamShield</span>
          </h1>
          <p style={{
            fontSize: "14px", color: "rgba(200,212,224,0.45)", lineHeight: 1.8,
            maxWidth: "400px", margin: "0 auto", fontFamily: "sans-serif", fontWeight: 300,
          }}>
            Have a question, found a bug, or just want to say hi? We read every email.
          </p>
        </div>

        {/* Big email card */}
        <div style={{
          padding: "36px", borderRadius: "16px", textAlign: "center",
          background: "rgba(255,184,0,0.04)",
          border: "1px solid rgba(255,184,0,0.15)",
          marginBottom: "32px",
          ...stagger(1),
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📬</div>
          <div style={{ fontSize: "11px", color: "rgba(200,212,224,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
            Email Us At
          </div>
          <div style={{
            fontSize: "clamp(14px, 3vw, 20px)", fontWeight: 700, color: "#ffb800",
            letterSpacing: "0.02em", marginBottom: "24px",
            textShadow: "0 0 20px rgba(255,184,0,0.3)",
          }}>
            nobodyai.contact@gmail.com
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:nobodyai.contact@gmail.com" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", borderRadius: "8px",
              background: "linear-gradient(135deg, #ffb800, #ffd000)",
              color: "#060a10", fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              textDecoration: "none", fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(255,184,0,0.3)",
              transition: "all 0.25s",
            }}>
              ✉️ Send Email
            </a>
            <button onClick={copyEmail} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", borderRadius: "8px",
              background: copied ? "rgba(0,217,126,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${copied ? "rgba(0,217,126,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: copied ? "#00d97e" : "rgba(200,212,224,0.6)",
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", fontFamily: "inherit",
              transition: "all 0.25s",
            }}>
              {copied ? "✓ Copied!" : "📋 Copy Email"}
            </button>
          </div>
        </div>

        {/* Reason cards */}
        <div style={{ marginBottom: "16px", ...stagger(2) }}>
          <div style={{ fontSize: "9px", color: "rgba(200,212,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Why People Reach Out
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {reasons.map((r, i) => (
              <div key={r.title} style={{
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                ...stagger(i + 3),
              }}>
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>{r.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f0f4f8", marginBottom: "6px" }}>{r.title}</div>
                <div style={{ fontSize: "11px", color: "rgba(200,212,224,0.4)", lineHeight: 1.6, fontFamily: "sans-serif" }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Response time note */}
        <div style={{
          padding: "16px 20px", borderRadius: "10px",
          background: "rgba(0,217,126,0.04)", border: "1px solid rgba(0,217,126,0.1)",
          display: "flex", alignItems: "center", gap: "12px",
          ...stagger(7),
        }}>
          <span style={{ fontSize: "18px" }}>⚡</span>
          <span style={{ fontSize: "12px", color: "rgba(200,212,224,0.45)", fontFamily: "sans-serif" }}>
            We typically respond within <strong style={{ color: "rgba(200,212,224,0.7)" }}>24–48 hours</strong>. We read every message personally.
          </span>
        </div>

      </div>
    </div>
  );
}
