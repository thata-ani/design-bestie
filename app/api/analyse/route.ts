import { NextRequest, NextResponse } from "next/server";
import { calculateUXScore } from "@/lib/scoringEngine";
import { getBenchmark } from "@/lib/benchmarkEngine";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, context } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const contextBlock =
      typeof context === "string" && context.trim()
        ? `\n\nContext from the designer:\n${context.trim()}`
        : "";

    const prompt = `You are a senior UX designer conducting a structured design audit. Analyse this UI screenshot and identify exactly 3-5 issues and 1-2 wins. Be consistent — if you analyse the same image twice you should find the same issues.

Follow this strict evaluation framework:
- Check contrast ratios (fail if below 4.5:1 for text)
- Check CTA clarity (fail if primary action is unclear)
- Check visual hierarchy (fail if eye flow is not clear)
- Check spacing consistency (fail if spacing is irregular)
- Check cognitive load (fail if too many competing elements)

The "type" field must be exactly one of: missing_cta, low_contrast, too_many_cta, cluttered_layout, poor_spacing, other — no other values allowed.

For each issue be specific — reference the exact element name you can see. Do not generalise.

Severity rules:
- critical: breaks core functionality or accessibility
- high: significantly impacts usability
- medium: noticeable friction
- win: genuinely well executed

"zone": "MUST be exactly one of these 9 values: top-left, top-center, top-right, mid-left, mid-center, mid-right, bottom-left, bottom-center, bottom-right — no other values, no variations, no underscores instead of hyphens, no single words like top or center"

Return ONLY raw JSON, no markdown, no backticks:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"one sharp sentence","reading_pattern":{"type":"F-Pattern","is_following":true,"explanation":"one sentence","impact":"one sentence"},"issues":[{"id":1,"element":"exact element name","severity":"critical","type":"missing_cta","what":"what is wrong in 6-8 words","why":"UX law — one line explanation","user_impact":"one sentence in user voice","business_impact":"one sentence on business cost","direction":"quality to achieve max 15 words","zone":"top-center"}],"wins":[{"id":1,"element":"exact element name","severity":"win","type":"other","what":"what is working","why":"principle — one line","user_impact":"why users benefit","business_impact":"why good for business","direction":"Keep this pattern","zone":"bottom-center"}],"priority_fixes":["Fix [element] — [quality needed] → [what it prevents]","second","third"]}

CRITICAL: Every zone field must use only the 9 allowed values listed above. Default to mid-center if unsure.`;

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
      type: ["missing_cta", "low_contrast", "too_many_cta", "cluttered_layout", "poor_spacing", "other"].includes(issue.type || "") ? issue.type : "other",
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
      overall_score: uxScore.score,
      benchmark: benchmark,
      justification: [],
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
