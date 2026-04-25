import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a Design Architect with 20 years auditing digital products at companies like Airbnb, Stripe, and Linear. Analyze this design screen against UX laws, WCAG 2.2 accessibility, Nielsen heuristics, Gestalt principles, 8pt grid, typography, visual hierarchy, and cognitive load.

Find 4-6 specific issues and 2-3 wins. For each, write a learn_why field with 4 sentences:
1. What the law says
2. How it applies to THIS exact element on THIS screen with specific measurements
3. What happens to users if broken
4. How a real app like Stripe, Linear, Apple, Swiggy, or Zomato handles this

Reference exact elements you can see. Use exact numbers. Use plain language.

Location: percentages 0-100 of where element appears (x=left, y=top, width, height).

Return ONLY raw JSON, no markdown:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"2 sentence assessment","issues":[{"id":1,"element":"name","severity":"critical","category":"ux_law","rule_violated":"law","problem":"specific problem","learn_why":"4 sentence explanation","fix":"specific fix","location":{"x":5,"y":10,"width":90,"height":8}}],"wins":[{"id":1,"element":"name","severity":"win","category":"ux_law","rule_violated":"principle","problem":"","learn_why":"4 sentence explanation","fix":"maintain","location":{"x":5,"y":80,"width":90,"height":10}}],"priority_fixes":["fix 1","fix 2","fix 3"]}`;

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
