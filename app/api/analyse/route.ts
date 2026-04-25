import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX researcher and design mentor reviewing this screen. You see designs through TWO lenses simultaneously: (1) the user actually living through this screen right now, and (2) the designer who needs research-backed feedback to defend in stakeholder meetings.

Find 3-4 issues that genuinely matter. Skip nitpicks.

For each issue, write feedback that includes ALL of these layers:

LAYER 1 - The user's reality (always start here):
Write 1-2 sentences from the user's actual experience. What are they trying to do? What do they see? What confuses, frustrates, or slows them down? Use words a real user would think, not designer jargon.

LAYER 2 - What the designer sees:
Name the design element in plain language and describe what's off, conversationally. No coordinates.

LAYER 3 - Research validation:
Cite real research naturally. Sources: Baymard Institute, Nielsen Norman Group, Google UX research, Apple HIG reasoning, published conversion studies. Use specific numbers when you genuinely know them. If unsure of exact stats, cite the principle without inventing numbers.

LAYER 4 - Business impact:
What does this cost the business? Conversion loss, support tickets, abandonment, brand trust.

LAYER 5 - Benchmark + reasoning:
How does Stripe / Linear / Apple / Swiggy / Zomato / Amazon / Booking.com handle this exact pattern, and WHY did they make that choice.

LAYER 6 - Design direction:
Suggest a direction using "consider" and "what if" - not prescription. Give one concrete example.

Also find 2 wins - patterns that align with established research. Include the user's perspective for each win.

End with: if they only fix ONE thing, what is it? Frame it as: "Your user right now is [doing X / feeling Y]. This costs you [impact]. The fix is [direction]."

Tone: a senior researcher who genuinely cares about both users and the designer. Empathetic to users, respectful to the designer. Never preachy. Never robotic.

CRITICAL: Every issue and win MUST include accurate location coordinates. Look at the screen carefully and provide the exact x (left edge), y (top edge), width, and height as percentages from 0-100 of where that element appears on the screen. Coordinates are mandatory - do not return any issue without them. Be precise: a button at the bottom of the screen has high y value (like 85), a header has low y (like 5).

Return ONLY raw JSON, no markdown:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"2 sentence honest take that mentions both what the user experiences and what the designer should focus on","issues":[{"id":1,"element":"plain name","severity":"critical","category":"ux","rule_violated":"the principle plus research source","problem":"the user's perspective in their words: what they're feeling, doing, thinking right now on this screen","learn_why":"5-6 sentences covering: user reality, designer view, research with source, business impact, benchmark with reasoning","fix":"design direction with concrete benchmark example and the user outcome it creates","location":{"x":5,"y":10,"width":90,"height":8}}],"wins":[{"id":1,"element":"name","severity":"win","category":"ux","rule_violated":"the pattern being followed","problem":"","learn_why":"why this works for both the user and the business, backed by research","fix":"keep doing this","location":{"x":5,"y":80,"width":90,"height":10}}],"priority_fixes":["framed as: user is [feeling/doing X], costing [impact], fix is [direction]","second priority","third priority"]}`;

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
