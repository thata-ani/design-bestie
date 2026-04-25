import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // ✅ SYSTEM PROMPT (controls behavior)
    const systemPrompt = `
You are concise, structured, and practical.
You prioritize clarity over completeness.
You give actionable UX feedback, not essays.
`;

    // ✅ MAIN PROMPT (this is your brain)
    const prompt = `
You are a senior UX researcher and product design mentor.

Your job is to help a designer quickly understand:
- what is broken
- why it matters
- what to fix first

---

FOCUS:
- Find ONLY 3–4 high-impact issues
- Skip minor or visual nitpicks
- Prioritize clarity, usability, and accessibility

---

FOR EACH ISSUE:

1. USER MOMENT
Describe what the user is trying to do and what feels confusing

2. CORE ISSUE
Name the UI problem clearly

3. WHY IT BREAKS
Explain using ONE principle (UX law, Nielsen heuristic, or WCAG if relevant)
Explain simply — no long theory

4. IMPACT
What happens (confusion, hesitation, drop-off, errors)

5. DESIGN MOVE
Give ONE clear direction using “consider” or “what if”
Include ONE example

---

WINS:
- Find 2 good patterns
- Explain why they help users feel faster or more confident

---

STRICT RULES:
- Max 4–5 sentences per issue
- No repetition
- No long paragraphs
- Every sentence must be useful

---

ANNOTATION RULES (CRITICAL):
- Coordinates must be precise (0–100 scale)
- Anchor to ONE visible UI element only (button, text, input, icon)
- DO NOT mark full sections or large containers
- Max width: 40
- Max height: 25
- If unsure → make box smaller, not bigger

---

OUTPUT:
Return ONLY JSON:

{
  "overall_score": 0,
  "scores": {
    "usability": 0,
    "accessibility": 0,
    "visual_design": 0,
    "hierarchy": 0,
    "cognitive_load": 0
  },
  "summary": "2 short sentences: what the user struggles with + what to fix first",
  "issues": [
    {
      "id": 1,
      "element": "specific UI element",
      "severity": "critical",
      "category": "ux",
      "rule_violated": "principle used",
      "problem": "user experience in plain words",
      "learn_why": "issue + principle + impact (short)",
      "fix": "clear direction with example",
      "location": { "x": 0, "y": 0, "width": 0, "height": 0 }
    }
  ],
  "wins": [
    {
      "id": 1,
      "element": "pattern",
      "severity": "win",
      "category": "ux",
      "rule_violated": "best practice",
      "problem": "",
      "learn_why": "why it works for user",
      "fix": "keep this",
      "location": { "x": 0, "y": 0, "width": 0, "height": 0 }
    }
  ],
  "priority_fixes": [
    "User is [doing X], costing [impact], fix is [direction]",
    "Second priority",
    "Third priority"
  ]
}

---

FINAL:
Remove any sentence that does not add value.
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",

        // ✅ IMPORTANT FIXES
        max_tokens: 1200,
        temperature: 0.4,

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
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
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Claude error", full: data },
        { status: 500 }
      );
    }

    const text = data.content?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "No response from Claude", full: data },
        { status: 500 }
      );
    }

    // ✅ CLEAN RESPONSE
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
          return NextResponse.json(
            {
              error: "Claude returned malformed JSON",
              raw: cleaned.substring(0, 1000),
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error: "Claude returned malformed JSON",
            raw: cleaned.substring(0, 1000),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);

    const message =
      error instanceof Error ? error.message : "Analysis failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
