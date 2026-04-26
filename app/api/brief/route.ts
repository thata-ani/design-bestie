import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { requirements } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior UX designer and product consultant helping a designer prepare before they open Figma.

The designer has received these requirements from their PM, BA, or team:
---
${requirements}
---

Your job: analyse these requirements and give the designer everything they need to know before they start designing.

Generate:

1. "feature_name": short name for this feature (3-5 words max)

2. "summary": 2 sentences — what this feature does and who it's for

3. "screens_needed": list every screen that needs to be designed. For each:
   - "screen": screen name (e.g. "Product Scanner", "Points Dashboard")
   - "purpose": one sentence — what the user does on this screen

4. "states_needed": every UI state that needs designing. For each:
   - "state": state name (e.g. "Empty state", "Error state", "Loading state", "Offline state", "First-time user", "Success state", "Permission denied")
   - "description": one sentence — what triggers this state and what should the user see

5. "edge_cases": things the requirements don't cover that will cause problems. For each:
   - "case": short name (e.g. "Same product scanned twice by same user")
   - "what_to_design": one sentence — what the UI needs to handle

6. "questions_to_ask": list of questions the designer must get answered before starting. Each is one sentence starting with "What happens when..." or "How should..." or "What does..."

7. "conflicts": any contradictions or ambiguities in the requirements. Each is one sentence describing the conflict. Return empty array if none.

8. "checklist": design considerations to keep in mind. Examples: "Design for mobile first", "Consider dark mode", "Ensure accessibility contrast", "Design for slow network". Return 6-8 items as plain strings.

Be specific to THESE requirements — not generic. Every item must be directly related to what was described.

Return ONLY raw JSON, no markdown, no backticks:

{"feature_name":"name","summary":"2 sentences","screens_needed":[{"screen":"name","purpose":"one sentence"}],"states_needed":[{"state":"name","description":"one sentence"}],"edge_cases":[{"case":"name","what_to_design":"one sentence"}],"questions_to_ask":["question 1","question 2"],"conflicts":["conflict 1"],"checklist":["item 1","item 2"]}`;

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
