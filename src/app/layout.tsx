import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ScamShield — Free AI Scam Detector",
  description: "Paste any suspicious message, email, or text. ScamShield AI detects scams instantly — 100% free, private, powered by Groq AI.",
  keywords: ["scam detector", "phishing detector", "fraud detection", "free scam checker", "AI scam detector"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Nav />
        <div style={{ paddingTop: "56px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
