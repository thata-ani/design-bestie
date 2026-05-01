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

    const prompt = `You are a senior UX researcher giving feedback to a designer. Be sharp, concise, and educational — not prescriptive.

Analyse this screen. Find exactly 3 issues and 2 wins.

ISSUE TYPE — classify each issue as exactly one of:
- "missing_cta" → no clear primary action, or CTA is hidden/buried
- "low_contrast" → poor contrast between text/elements and background
- "too_many_cta" → multiple competing primary actions
- "cluttered_layout" → overwhelming, too dense, visually noisy
- "poor_spacing" → cramped elements, inconsistent spacing
- "other" → only if none above apply

For each ISSUE return:
- "element": name of the UI element (5 words max)
- "severity": "critical" | "high" | "medium"
- "type": one of the 6 types above
- "what": what is wrong — 6-8 words, plain English
- "why": the UX principle being violated — cite law + one line explanation
- "user_impact": what the user feels or does — 1 sentence in user voice
- "business_impact": what this costs the business — 1 sentence
- "direction": describe the QUALITY this element needs — not a solution, not a placement instruction. What characteristic must it have? Max 12 words. Example: "Needs clear visual dominance and immediate recognisability as primary action"
- "zone": exactly one of: "top-left" | "top-center" | "top-right" | "mid-left" | "mid-center" | "mid-right" | "bottom-left" | "bottom-center" | "bottom-right"

For each WIN return:
- "element": name of the UI element
- "severity": "win"
- "type": "other"
- "what": what is working — 6-8 words
- "why": the principle being followed — 1 line
- "user_impact": why users benefit — 1 sentence
- "business_impact": why good for business — 1 sentence
- "direction": "Keep this pattern"
- "zone": one of the 9 zones

READING PATTERN:
Choose one: "F-Pattern" | "Z-Pattern" | "Gutenberg Pattern" | "Spotted Pattern" | "Layer Cake Pattern" | "No Clear Pattern"
- "is_following": true if used correctly, false if broken
- "explanation": 1 sentence for the designer
- "impact": 1 sentence on user effect

SUMMARY: 1 sharp sentence — the single most important insight.

PRIORITY FIXES: exactly 3 items.
Format: "Fix [element] — [quality it needs] → [what it prevents]"

Return ONLY raw JSON, no markdown, no backticks:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"one sharp sentence","reading_pattern":{"type":"F-Pattern","is_following":true,"explanation":"one sentence","impact":"one sentence"},"issues":[{"id":1,"element":"element name","severity":"critical","type":"missing_cta","what":"what is wrong in 6-8 words","why":"UX law — one line explanation","user_impact":"one sentence in user voice","business_impact":"one sentence on business cost","direction":"quality to achieve max 15 words","zone":"top-center"}],"wins":[{"id":1,"element":"element name","severity":"win","type":"other","what":"what is working","why":"principle — one line","user_impact":"why users benefit","business_impact":"why good for business","direction":"Keep this pattern","zone":"bottom-center"}],"priority_fixes":["Fix [element] — [quality needed] → [what it prevents]","second","third"]}`;

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
