"use client";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const stagger = (i: number) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
  });

  const cards = [
    {
      icon: "🌍",
      title: "The Problem We're Solving",
      color: "#ff3b3b",
      text: "Every year, over $1 trillion is stolen from people through scams. Phishing texts, fake job offers, lottery fraud, romance scams — they target everyone, especially the elderly, immigrants, and people unfamiliar with digital threats. Most people can't tell a scam from a real message.",
    },
    {
      icon: "🛡️",
      title: "Why We Built ScamShield",
      color: "#ffb800",
      text: "We got tired of seeing people we care about fall for scams. Existing tools cost money, require sign-ups, or just aren't smart enough. So we built ScamShield — a completely free, no-account-needed AI scam detector that anyone can use in seconds. Our goal: protect everyone, not just people who can afford it.",
    },
    {
      icon: "🤖",
      title: "How It Works",
      color: "#00d97e",
      text: "ScamShield is powered by Llama 3.3 (70B) — one of the most capable open AI models — running on Groq's lightning-fast infrastructure. When you paste a message, our AI analyzes it for phishing patterns, urgency manipulation, fake branding, suspicious URLs, requests for personal info, and dozens of other scam signals.",
    },
    {
      icon: "🔒",
      title: "Privacy First",
      color: "#7b8cff",
      text: "We never store your messages. We never log what you type. We don't use cookies to track you. Your data stays yours — the analysis happens in real-time and is never saved. You can use ScamShield completely anonymously.",
    },
    {
      icon: "💸",
      title: "Always Free",
      color: "#ffb800",
      text: "ScamShield will always be free. No premium tier, no paywalls, no ads. We believe protection from fraud is a basic right, not a product feature. If you find it useful, share it with someone who needs it.",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#060a10",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#c8d4e0",
    }}>
      {/* Grid bg */}
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
            fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            ◈ Our Story
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 16px 0", color: "#f0f4f8",
          }}>
            Why We Built<br />
            <span style={{ color: "#ffb800" }}>ScamShield</span>
          </h1>
          <p style={{
            fontSize: "14px", color: "rgba(200,212,224,0.45)", lineHeight: 1.8,
            maxWidth: "440px", margin: "0 auto", fontFamily: "sans-serif", fontWeight: 300,
          }}>
            Free, private, AI-powered scam detection for everyone — no sign-up required.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cards.map((card, i) => (
            <div key={card.title} style={{
              padding: "28px 28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              borderLeft: `3px solid ${card.color}`,
              ...stagger(i + 1),
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <span style={{ fontSize: "24px" }}>{card.icon}</span>
                <h2 style={{
                  fontSize: "14px", fontWeight: 700, color: "#f0f4f8",
                  margin: 0, letterSpacing: "0.02em",
                }}>{card.title}</h2>
              </div>
              <p style={{
                fontSize: "13px", color: "rgba(200,212,224,0.5)", lineHeight: 1.8,
                margin: 0, fontFamily: "sans-serif", fontWeight: 300,
              }}>{card.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "48px", ...stagger(cards.length + 1) }}>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "14px 32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #ffb800, #ffd000)",
            color: "#060a10", fontSize: "12px", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            textDecoration: "none", fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(255,184,0,0.3)",
            transition: "all 0.25s",
          }}>
            ⚡ Try ScamShield Now
          </a>
        </div>

      </div>
    </div>
  );
}
