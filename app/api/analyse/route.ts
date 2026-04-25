import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a Design Architect with 20 years auditing digital products at companies like Airbnb, Stripe, and Linear. Analyze this design screen pixel by pixel against:

UX Laws: Fitts's Law, Hick's Law, Miller's Law, Jakob's Law, Aesthetic-Usability Effect, Von Restorff Effect, Law of Proximity, Law of Similarity, Figure-Ground
UI Rules: 8pt grid, typography scale (16px min body), touch targets (44x44px min), color contrast, whitespace, shadows, border radius
Accessibility WCAG 2.2: Contrast 4.5:1 normal text and 3:1 large text, focus states, error identification, touch target size
Nielsen Heuristics: All 10
Gestalt: Proximity, Similarity, Closure, Continuity, Figure-Ground
Cognitive Load: Information density, F-pattern reading, scannability, chunking
Benchmarks: Compare to Stripe, Linear, Notion, Apple, Swiggy, Zomato, Amazon

Find 4-6 specific issues and 2-3 wins. For each, the learn_why field MUST contain 4 sentences:
1. What the law says in one sentence
2. How it applies to THIS exact element on THIS screen with specific pixel measurements you can see
3. What happens to real users if this stays broken
4. A real example - how Stripe, Linear, Apple, Swiggy, or Zomato handles this exact pattern

Never be generic. Reference exact elements you can see in the screen. Use exact numbers and measurements. Use plain language.

Location: percentages 0-100 of where element actually appears on screen (x=left, y=top, width, height).

Return ONLY raw JSON, no markdown, no backticks, no explanation:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"2 sentence specific assessment of this exact screen","issues":[{"id":1,"element":"exact name","severity":"critical","category":"ux_law","rule_violated":"exact law","problem":"specific problem with measurements","learn_why":"4 sentence deep explanation as specified above","fix":"specific fix with pixel values","location":{"x":5,"y":10,"width":90,"height":8}}],"wins":[{"id":1,"element":"name","severity":"win","category":"ux_law","rule_violated":"principle","problem":"","learn_why":"4 sentence explanation","fix":"maintain","location":{"x":5,"y":80,"width":90,"height":10}}],"priority_fixes":["specific fix 1","specific fix 2","specific fix 3"]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType || "image/png",
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Claude error", full: data }, { status: 500 });
    }

    const text = data.content?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "No response from Claude", full: data }, { status: 500 });
    }

    const cleaned = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace > 0) {
        try {
          result = JSON.parse(cleaned.substring(0, lastBrace + 1));
        } catch {
          return NextResponse.json({ error: "Claude returned malformed JSON", raw: cleaned.substring(0, 1000) }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "Claude returned malformed JSON", raw: cleaned.substring(0, 1000) }, { status: 500 });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
