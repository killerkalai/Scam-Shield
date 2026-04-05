"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <style>{`
        .nav-link:hover { color: #ffb800 !important; }
        .hamburger:hover { border-color: rgba(255,184,0,0.4) !important; }
      `}</style>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(6,10,16,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          maxWidth: "700px", margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "56px",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "16px", fontWeight: 700, letterSpacing: "-0.03em",
            }}>
              <span style={{ color: "#f0f4f8" }}>SCAM</span>
              <span style={{ color: "#ffb800" }}>SHIELD</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: "flex", gap: "4px" }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" style={{
                padding: "6px 14px", borderRadius: "6px",
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", textDecoration: "none",
                fontFamily: "'IBM Plex Mono', monospace",
                color: path === l.href ? "#ffb800" : "rgba(200,212,224,0.45)",
                background: path === l.href ? "rgba(255,184,0,0.08)" : "transparent",
                border: path === l.href ? "1px solid rgba(255,184,0,0.2)" : "1px solid transparent",
                transition: "all 0.2s",
              }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
