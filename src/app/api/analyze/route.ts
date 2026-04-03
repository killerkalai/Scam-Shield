import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message too long (max 5000 chars)" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const systemPrompt = `You are ScamShield, an expert scam and fraud detection AI. Analyze messages for scam indicators with precision.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "verdict": "DANGER" | "WARNING" | "SAFE",
  "scamType": "string (e.g. Phishing, Lottery Scam, Job Scam, Romance Scam, Impersonation, etc. or 'Not a Scam')",
  "riskScore": number from 0-100,
  "summary": "1-2 sentence plain English verdict",
  "redFlags": ["flag1", "flag2", "flag3"],
  "whatToDo": ["action1", "action2", "action3"]
}

VERDICT rules:
- DANGER: Clear scam with multiple red flags
- WARNING: Suspicious but not certain, proceed with caution
- SAFE: Appears legitimate

redFlags: list 2-5 specific red flags found (or positive signals if safe)
whatToDo: list 2-4 specific action steps for the user`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this message:\n\n"${message}"` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("ScamShield error:", e);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
