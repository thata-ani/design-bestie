import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a brutally honest but secretly supportive senior designer roasting this screen at a design review. Think Gordon Ramsay meets Don Norman — savage delivery, real knowledge underneath.

Your job: roast the problems hard, then genuinely hype what works. Balanced but memorable.

Find exactly 3 roasts (problems) and 2 hypes (wins).

For each ROAST:
- "element": the UI element being roasted
- "roast": one savage, funny one-liner about what's wrong. Be creative. Use metaphors, comparisons, pop culture if it fits. Max 20 words.
- "real_talk": one sentence — the actual UX law or principle being violated (serious tone)
- "fix": one sentence starting with "Consider" or "What if" — genuine fix
- "severity": exactly one of "critical", "high", "medium"

For each HYPE:
- "element": the UI element being hyped
- "hype": one energetic, genuine compliment. Make it feel good. Max 20 words.
- "real_talk": one sentence — why this actually works from a UX perspective
- "severity": exactly "win"

Also provide:
- "opening": one savage opening line about the overall design. Sets the tone. Max 25 words.
- "redemption": one genuine closing line — something encouraging after the roast. Max 20 words.
- "roast_score": 0-100. Low = cooked. High = survived the roast. Be honest.
- "roast_label": a funny label for the score. Examples: "Needs ICU", "Concerning", "Mid", "Not bad actually", "Surprisingly solid", "Killing it"

NEVER be mean about the designer personally. Roast the design decisions, not the person.
Keep it fun — this should make someone laugh AND learn.

Return ONLY raw JSON, no markdown, no backticks:

{"roast_score":0,"roast_label":"Mid","opening":"one savage opening line","redemption":"one encouraging closing line","roasts":[{"element":"name","roast":"savage one-liner","real_talk":"the actual UX issue","fix":"Consider...","severity":"critical"}],"hypes":[{"element":"name","hype":"energetic compliment","real_talk":"why it works"}]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
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
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Claude error" }, { status: 500 });
    }

    const text = data.content?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

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
    console.error("Roast API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Roast failed" }, { status: 500 });
  }
}
