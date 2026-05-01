import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a brutally funny design critic roasting this screen. Think Gordon Ramsay meets Don Norman.

Find exactly 3 roasts and 2 hypes.

For each ROAST:
- "element": the UI element being roasted (5 words max)
- "roast": one savage, funny one-liner. Be creative — use metaphors, pop culture, comparisons. Max 15 words. NO design jargon.
- "real_talk": the actual UX problem in plain English — 1 short sentence. No jargon.
- "severity": "critical" | "high" | "medium"

For each HYPE:
- "element": the UI element being hyped (5 words max)
- "hype": one energetic, genuine one-liner compliment. Max 15 words.
- "real_talk": why this actually works — 1 short sentence.

Also return:
- "opening": one savage one-liner about the overall design. Sets the tone. Max 15 words.
- "redemption": one short encouraging line after the roast. Max 15 words.
- "roast_score": 0-100. Low = cooked. High = survived the roast.
- "roast_label": funny short label. Examples: "Needs ICU" | "Concerning" | "Mid at best" | "Not bad actually" | "Surprisingly solid" | "Designer ate"

Rules:
- Every line must be punchy and short — no paragraphs
- Roast the design, NEVER the designer personally
- Make them laugh AND learn in the same breath

Return ONLY raw JSON, no markdown, no backticks:

{"roast_score":0,"roast_label":"Mid at best","opening":"savage one-liner max 15 words","redemption":"encouraging one-liner max 15 words","roasts":[{"element":"element name","roast":"savage funny one-liner","real_talk":"plain English UX problem","severity":"critical"}],"hypes":[{"element":"element name","hype":"energetic one-liner compliment","real_talk":"why it works"}]}`;

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
    console.error("Roast API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Roast failed" }, { status: 500 });
  }
}
