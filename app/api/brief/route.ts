import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { requirements } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX designer at a top product company — the kind who's shipped dozens of features and knows exactly what junior designers miss before they open Figma.

The designer has received these requirements from their PM, BA, or team:
---
${requirements}
---

Your job: tear these requirements apart and give the designer everything they need before they start designing. Be specific to THESE requirements — no generic advice.

Generate:

1. "feature_name": short name for this feature (3-5 words max)

2. "summary": 2 sentences — what this feature does and who it's for. Be direct and specific.

3. "screens_needed": every screen that needs designing. For each:
   - "screen": screen name (e.g. "Product Scanner", "Points Dashboard")
   - "purpose": one sentence — what the user does on this screen
   - "solution": 2-3 sentences — exactly what to design. What are the key UI elements, layout approach, and most important interaction? Be specific — mention actual components, not vague suggestions.

4. "states_needed": every UI state that needs designing. For each:
   - "state": state name (e.g. "Empty state", "Error state", "Loading state")
   - "description": one sentence — what triggers this state
   - "solution": 2-3 sentences — exactly what to show the user in this state. What copy, illustration, CTA, or UI pattern should be used? Give a concrete direction.

5. "edge_cases": things the requirements don't cover that will cause real problems. For each:
   - "case": short name (e.g. "Same product scanned twice")
   - "what_to_design": one sentence — what the UI needs to handle
   - "solution": 2-3 sentences — how to solve this in the UI. What should happen, what should the user see, and how does it recover gracefully?

6. "questions_to_ask": questions the designer must get answered before starting. Each starts with "What happens when..." or "How should..." or "What does..." — make them specific to these requirements, not generic.

7. "conflicts": contradictions or ambiguities in the requirements that will cause problems later. Each is one sentence. Return empty array if none.

8. "checklist": design considerations specific to this feature. Not generic — tied to what was described. 6-8 items as plain strings.

Return ONLY raw JSON, no markdown, no backticks:

{"feature_name":"name","summary":"2 sentences","screens_needed":[{"screen":"name","purpose":"one sentence","solution":"2-3 sentences"}],"states_needed":[{"state":"name","description":"one sentence","solution":"2-3 sentences"}],"edge_cases":[{"case":"name","what_to_design":"one sentence","solution":"2-3 sentences"}],"questions_to_ask":["question 1","question 2"],"conflicts":["conflict 1"],"checklist":["item 1","item 2"]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
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
