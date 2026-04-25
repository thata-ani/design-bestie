import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX researcher reviewing this screen with a designer. Be sharp and concise - designers will skim, not read.

Find exactly 3 issues that genuinely matter. Skip nitpicks. Find 2 wins.

For each issue, the "problem" field is ONE crisp sentence from the user's perspective - what they feel or do when they hit this issue. Real user voice, no jargon.

The "learn_why" field is where depth goes - 4 short paragraphs:
1. What the user actually experiences (2 sentences in their voice)
2. The principle being violated and the research source (Baymard, NN/g, Apple HIG, Google UX)
3. How a benchmark app (Stripe, Swiggy, Zomato, Amazon, Linear, Booking.com) handles this and why
4. Business impact in one sentence (conversion loss, abandonment, support tickets)

The "fix" field is a single sentence design direction using "consider" or "what if" - not a prescription.

For wins, "learn_why" is 2 short paragraphs: why it works for the user, why it works for the business.

Priority fixes: 3 items. Each frames the user's current state, the cost, and the direction. Format: "Your user [X]. This costs [impact]. Consider [direction]."

CRITICAL: Every issue and win MUST include accurate location coordinates. Look at the screen carefully and provide x (left edge), y (top edge), width, height as percentages 0-100. Header elements have low y (5-15), middle elements y around 40-60, bottom elements have high y (70-90). Coordinates are mandatory.

Return ONLY raw JSON, no markdown:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"2 sentence honest take","issues":[{"id":1,"element":"plain name","severity":"critical","category":"ux","rule_violated":"principle plus source","problem":"ONE crisp sentence in user voice","learn_why":"4 short paragraphs as specified","fix":"single sentence design direction","location":{"x":5,"y":10,"width":90,"height":8}}],"wins":[{"id":1,"element":"name","severity":"win","category":"ux","rule_violated":"pattern followed","problem":"","learn_why":"2 short paragraphs","fix":"keep doing this","location":{"x":5,"y":80,"width":90,"height":10}}],"priority_fixes":["Your user [X]. This costs [impact]. Consider [direction].","second","third"]}`;

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
