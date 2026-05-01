import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { requirements } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX designer helping a designer prepare before opening Figma.

Requirements:
---
${requirements}
---

Analyse these requirements. Be specific to THESE requirements only. Be concise and actionable.

Return ONLY this JSON, no markdown, no backticks:

{
  "feature_name": "3-5 word name",
  "summary": "1 sentence — what it does and who it's for",
  "screens_needed": [
    {
      "screen": "Screen name",
      "purpose": "What the user does here — 1 short sentence",
      "solution": "Key UI elements needed — bullet points, max 3 items"
    }
  ],
  "states_needed": [
    {
      "state": "State name",
      "description": "What triggers this — 1 short sentence",
      "solution": "What to show — copy, CTA, pattern. 1 short sentence."
    }
  ],
  "edge_cases": [
    {
      "case": "Short name",
      "what_to_design": "What the UI needs to handle — 1 sentence",
      "solution": "How to solve it — 1 sentence"
    }
  ],
  "questions_to_ask": ["Sharp question starting with: What happens when / How should / What does / Who decides"],
  "conflicts": ["Specific contradiction in the requirements — empty array if none"],
  "checklist": ["Specific design consideration for this feature — actionable, not generic"]
}

Rules:
- screens_needed: 3-6 screens
- states_needed: 4-6 states
- edge_cases: 3-5 cases
- questions_to_ask: 4-6 questions
- checklist: 6-8 items
- Every solution must be specific — no generic advice
- Keep all text short and scannable`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "Claude error" }, { status: 500 });

    const text = data.content?.[0]?.text;
    if (!text) return NextResponse.json({ error: "No response from Claude" }, { status: 500 });

    const cleaned = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace > 0) {
        try { result = JSON.parse(cleaned.substring(0, lastBrace + 1)); }
        catch { return NextResponse.json({ error: "Malformed JSON", raw: cleaned.substring(0, 500) }, { status: 500 }); }
      } else {
        return NextResponse.json({ error: "Malformed JSON", raw: cleaned.substring(0, 500) }, { status: 500 });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Brief API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Brief generation failed" }, { status: 500 });
  }
}
