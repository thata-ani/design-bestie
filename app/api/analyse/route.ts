import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX researcher reviewing this screen with a designer. Be sharp and concise.

Find exactly 3 issues and 2 wins.

For each issue:
- "element": plain name of the UI element
- "severity": exactly one of: "critical", "high", "medium"
- "rule_violated": the UX law or research source (e.g. "Fitts's Law", "Baymard Institute — Checkout UX", "Nielsen Norman — Visibility of System Status")
- "problem": ONE sentence in the user's voice. What they feel or do.
- "learn_why": exactly 4 bullet points, each max 15 words. Format:
  • What the law says
  • How it applies to THIS specific element on THIS screen
  • What the user does when this goes wrong
  • How [Stripe / Swiggy / Amazon / Linear / Apple] handles this
- "fix": one sentence starting with "Consider" or "What if"
- "zone": which of the 9 zones best describes where this element appears on screen. Choose exactly one: "top-left", "top-center", "top-right", "mid-left", "mid-center", "mid-right", "bottom-left", "bottom-center", "bottom-right"

For each win:
- "element": plain name
- "severity": exactly "win"
- "rule_violated": the principle being followed
- "problem": ""
- "learn_why": exactly 2 bullet points (max 15 words each):
  • Why this works for the user
  • Why this works for the business
- "fix": "Keep this pattern"
- "zone": one of the 9 zones above

Reading pattern analysis:
Look at the overall layout and identify which reading pattern this screen follows. Choose exactly one:
- "F-Pattern": users scan horizontally across the top, then down the left side. Common in text-heavy or list-based screens.
- "Z-Pattern": users scan top-left to top-right, diagonal to bottom-left, then bottom-right. Common in simple screens with one CTA.
- "Gutenberg Pattern": users move from top-left (primary optical area) to bottom-right (terminal area). Common in clean, minimal layouts.
- "Spotted Pattern": users jump to specific high-contrast elements (images, buttons, badges). No linear flow.
- "Layer Cake Pattern": users scan horizontal bands across the screen. Common in card-based or section-heavy layouts.
- "No Clear Pattern": layout has no visual hierarchy guiding the eye. Cognitive overload.

For the reading pattern, provide:
- "type": exactly one of the pattern names above
- "is_following": true if the design correctly uses this pattern, false if it's broken or accidental
- "explanation": one sentence — what this means for the designer and what to do about it
- "impact": one sentence — how this affects the user's ability to find what they need

Summary: 1 crisp sentence. The single most important thing about this screen.

Priority fixes: 3 items. Each one sentence: "Your user [does X]. This costs [impact]. Consider [direction]."

NEVER invent statistics. Only cite principles you are certain about.

Return ONLY raw JSON, no markdown, no backticks:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"one crisp sentence","reading_pattern":{"type":"F-Pattern","is_following":true,"explanation":"one sentence for the designer","impact":"one sentence on user impact"},"issues":[{"id":1,"element":"name","severity":"critical","category":"ux","rule_violated":"law name and source","problem":"one sentence in user voice","learn_why":"• point 1\n• point 2\n• point 3\n• point 4","fix":"Consider or What if...","zone":"top-center"}],"wins":[{"id":1,"element":"name","severity":"win","category":"ux","rule_violated":"principle","problem":"","learn_why":"• point 1\n• point 2","fix":"Keep this pattern","zone":"bottom-center"}],"priority_fixes":["Your user [X]. This costs [impact]. Consider [direction].","second","third"]}`;

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
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "Claude error", full: data }, { status: 500 });

    const text = data.content?.[0]?.text;
    if (!text) return NextResponse.json({ error: "No response from Claude", full: data }, { status: 500 });

    const cleaned = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace > 0) {
        try { result = JSON.parse(cleaned.substring(0, lastBrace + 1)); }
        catch { return NextResponse.json({ error: "Malformed JSON", raw: cleaned.substring(0, 1000) }, { status: 500 }); }
      } else {
        return NextResponse.json({ error: "Malformed JSON", raw: cleaned.substring(0, 1000) }, { status: 500 });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
