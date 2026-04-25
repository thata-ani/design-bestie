import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX expert. Analyze this design screen against UX laws (Fitts, Hick, Jakob, Miller, Gestalt), WCAG 2.2 accessibility (4.5:1 contrast, 44px touch targets), Nielsen heuristics, 8pt grid, typography, and visual hierarchy.

Find 3-5 issues and 1-2 wins. For each, write a learn_why of 2-3 sentences explaining the rule, how it applies to this screen, and the user impact.

Location must be accurate percentages (0-100) of where the element appears.

Return ONLY raw JSON, no markdown, no backticks:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"2 sentence assessment","issues":[{"id":1,"element":"name","severity":"critical","category":"ux_law","rule_violated":"law name","problem":"specific problem","learn_why":"explanation","fix":"specific fix","location":{"x":5,"y":10,"width":90,"height":8}}],"wins":[{"id":1,"element":"name","severity":"win","category":"ux_law","rule_violated":"principle","problem":"","learn_why":"why this works","fix":"maintain","location":{"x":5,"y":80,"width":90,"height":10}}],"priority_fixes":["fix 1","fix 2","fix 3"]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType || "image/png", data: imageBase64 } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 16384, responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Gemini error", full: data }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "No response from Gemini", full: data }, { status: 500 });
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
          return NextResponse.json({ error: "Gemini returned malformed JSON", raw: cleaned.substring(0, 1000) }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "Gemini returned malformed JSON", raw: cleaned.substring(0, 1000) }, { status: 500 });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
