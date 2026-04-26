import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { analysisResult } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior product consultant translating a UX audit into business language for a CEO, CPO, or PM who doesn't speak design.

Here is the UX analysis result:
${JSON.stringify(analysisResult, null, 2)}

Your job: rewrite this entire critique in business terms. No UX jargon. No design terminology. Pure business impact language.

Generate:

1. "executive_summary": 2-3 sentences. What is the overall state of this product experience and what does it mean for the business? Use words like revenue, retention, conversion, churn, support cost.

2. "business_issues": for each issue in the analysis, reframe it as a business problem. Each item:
   - "element": same element name
   - "business_impact": one sentence — what this costs the business (revenue, users, trust, support tickets)
   - "user_impact": one sentence — what the user does because of this (leaves, gets confused, calls support, doesn't convert)
   - "effort": "Low" / "Medium" / "High" — estimated dev effort to fix
   - "priority": "Ship this sprint" / "Next sprint" / "Backlog"

3. "wins_to_keep": for each win, one sentence on why it's good for the business — not design language, business language.

4. "priority_matrix": exactly 3 items ordered by highest ROI (impact vs effort). Each:
   - "action": one short action in plain English
   - "why": one sentence business case
   - "effort": "Low" / "Medium" / "High"
   - "impact": "Low" / "Medium" / "High"

5. "sprint_recommendation": exactly 3 ticket-ready items a PM could paste straight into Jira or Linear. Format: "[Action] [element] to [business outcome]". Example: "Increase CTA size to improve conversion on checkout screen"

6. "overall_business_score": 0-100. How business-ready is this product experience right now?

7. "score_label": one short phrase. Examples: "Not ready to scale", "Needs work before launch", "Good enough to ship", "Strong foundation"

NEVER use words like: Fitts's Law, heuristics, cognitive load, visual hierarchy, gestalt, affordance, UX, UI.
ALWAYS use words like: conversion, revenue, retention, churn, support cost, user trust, drop-off, engagement.

Return ONLY raw JSON, no markdown, no backticks:

{"overall_business_score":0,"score_label":"phrase","executive_summary":"2-3 sentences","business_issues":[{"element":"name","business_impact":"one sentence","user_impact":"one sentence","effort":"Low","priority":"Ship this sprint"}],"wins_to_keep":["one sentence per win"],"priority_matrix":[{"action":"short action","why":"one sentence","effort":"Low","impact":"High"}],"sprint_recommendation":["ticket 1","ticket 2","ticket 3"]}`;

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
    console.error("Stakeholder API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Stakeholder translation failed" }, { status: 500 });
  }
}
