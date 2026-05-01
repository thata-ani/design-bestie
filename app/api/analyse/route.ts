import { NextRequest, NextResponse } from "next/server";
import { calculateUXScore } from "@/lib/scoringEngine";
import { getBenchmark } from "@/lib/benchmarkEngine";

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

For each issue, you MUST classify the "type" field using ONLY these exact values:
- "missing_cta" → if the screen has no clear primary call-to-action, or the CTA is hidden/buried
- "low_contrast" → if text or UI elements have poor contrast against background
- "too_many_cta" → if there are multiple competing primary actions confusing the user
- "cluttered_layout" → if the layout feels overwhelming, too dense, or visually noisy
- "poor_spacing" → if elements are too cramped, lack breathing room, or have inconsistent spacing
- "other" → only if none of the above apply

For each issue:
- "element": plain name of the UI element
- "severity": exactly one of: "critical", "high", "medium"
- "type": exactly one of the 6 types above — pick the BEST match, avoid "other" unless truly necessary
- "rule_violated": the UX law or research source
- "problem": ONE sentence in the user's voice
- "learn_why": exactly 4 bullet points, each max 15 words. Format:
  • What the law says
  • How it applies to THIS specific element on THIS screen
  • What the user does when this goes wrong
  • How [Stripe / Swiggy / Amazon / Linear / Apple] handles this
- "fix": one sentence starting with "Consider" or "What if"
- "zone": exactly one of: "top-left", "top-center", "top-right", "mid-left", "mid-center", "mid-right", "bottom-left", "bottom-center", "bottom-right"

For each win:
- "element": plain name
- "severity": exactly "win"
- "type": "other"
- "rule_violated": the principle being followed
- "problem": ""
- "learn_why": exactly 2 bullet points (max 15 words each)
- "fix": "Keep this pattern"
- "zone": one of the 9 zones above

Reading pattern: Choose exactly one: "F-Pattern", "Z-Pattern", "Gutenberg Pattern", "Spotted Pattern", "Layer Cake Pattern", "No Clear Pattern"
- "type": pattern name
- "is_following": true or false
- "explanation": one sentence for the designer
- "impact": one sentence on user impact

Summary: 1 crisp sentence about the most important thing on this screen.

Priority fixes: 3 items. Each: "Your user [does X]. This costs [impact]. Consider [direction]."

Return ONLY raw JSON, no markdown, no backticks:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"one crisp sentence","reading_pattern":{"type":"F-Pattern","is_following":true,"explanation":"one sentence","impact":"one sentence"},"issues":[{"id":1,"element":"name","severity":"critical","type":"missing_cta","category":"ux","rule_violated":"law name","problem":"one sentence in user voice","learn_why":"• point 1\n• point 2\n• point 3\n• point 4","fix":"Consider...","zone":"top-center"}],"wins":[{"id":1,"element":"name","severity":"win","type":"other","category":"ux","rule_violated":"principle","problem":"","learn_why":"• point 1\n• point 2","fix":"Keep this pattern","zone":"bottom-center"}],"priority_fixes":["Your user [X]. This costs [impact]. Consider [direction].","second","third"]}`;

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

    // Run scoring engine on issues
    const scoringIssues = (result.issues || []).map((issue: { type?: string; severity?: string }) => ({
      type: issue.type || "other",
      severity: (issue.severity as "low" | "medium" | "high") || "medium",
    }));

    const uxScore = calculateUXScore(scoringIssues);
    const benchmark = getBenchmark(uxScore.score, result.issues || []);

    return NextResponse.json({
      score: uxScore,
      issues: result.issues || [],
      wins: result.wins || [],
      summary: result.summary || "",
      reading_pattern: result.reading_pattern || null,
      priority_fixes: result.priority_fixes || [],
      overall_score: result.overall_score || 0,
      benchmark: benchmark,
      justification: [],
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
