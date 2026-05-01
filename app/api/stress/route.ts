import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const PERSONA_DESCRIPTIONS: Record<string, string> = {
  "First-time User": "someone using this product for the very first time, with no prior knowledge. They rely entirely on what they can see.",
  "Power User": "an experienced frequent user who wants efficiency and speed. They get frustrated by friction or being treated like a beginner.",
  "Accessibility User": "a user with visual, motor, or cognitive needs — screen reader, keyboard-only navigation, high contrast requirements.",
  "Older User": "a user aged 60+, reduced fine motor control, needs larger targets, clarity over cleverness, familiar patterns.",
  "Distracted User": "a user commuting or multitasking, interrupted frequently. Every interaction must be instantly obvious.",
  "Mobile User": "a user on a 375px screen with one thumb, slow connection. Tap targets and scroll fatigue matter.",
  "Non-native Speaker": "a user for whom English is a second language. Jargon, idioms, and dense text create barriers.",
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, personas } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    if (!personas || personas.length < 1) {
      return NextResponse.json({ error: "At least 1 persona required" }, { status: 400 });
    }

    const personaBlocks = personas.map((name: string) => {
      const desc = PERSONA_DESCRIPTIONS[name] || name;
      return `PERSONA: ${name}\nDescription: ${desc}\nFind exactly 2 issues and 1 win for THIS persona only.`;
    }).join("\n\n");

    const prompt = `You are a senior UX researcher stress-testing this screen through ${personas.length} user persona lens${personas.length > 1 ? "es" : ""}.

${personaBlocks}

For each ISSUE return:
- "element": name of the UI element (5 words max)
- "severity": "critical" | "high" | "medium"
- "what": what is wrong for THIS persona — 6-8 words
- "why": UX principle being violated — cite law + one line
- "user_impact": what THIS persona feels or does — 1 sentence in their voice
- "business_impact": what this costs the business — 1 sentence
- "direction": quality the element needs to serve this persona — max 15 words. Guide, don't prescribe.
- "zone": exactly one of: "top-left" | "top-center" | "top-right" | "mid-left" | "mid-center" | "mid-right" | "bottom-left" | "bottom-center" | "bottom-right"

For each WIN return:
- "element": name of the UI element
- "severity": "win"
- "what": what works for THIS persona — 6-8 words
- "why": principle being followed — 1 line
- "user_impact": why this persona benefits — 1 sentence
- "business_impact": why good for business — 1 sentence
- "direction": "Keep this pattern"
- "zone": one of the 9 zones

Also return:
- "persona_score": 0-100 — how well this screen serves this persona
- "overall_stress_score": 0-100 — average across all personas
- "weakest_persona": name of persona with lowest score
- "strongest_persona": name of persona with highest score
- "cross_persona_insight": 1 sentence — the most important pattern across all personas

Return ONLY raw JSON, no markdown, no backticks:

{"overall_stress_score":0,"weakest_persona":"name","strongest_persona":"name","cross_persona_insight":"one sentence","personas":[{"name":"persona name","persona_score":0,"issues":[{"id":1,"element":"element name","severity":"critical","what":"what is wrong 6-8 words","why":"law — one line","user_impact":"one sentence in persona voice","business_impact":"one sentence","direction":"quality needed max 15 words","zone":"top-center"}],"wins":[{"id":1,"element":"element name","severity":"win","what":"what works","why":"principle — one line","user_impact":"why persona benefits","business_impact":"why good for business","direction":"Keep this pattern","zone":"bottom-center"}]}]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType || "image/png", data: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
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
    console.error("Stress API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Stress test failed" }, { status: 500 });
  }
}
