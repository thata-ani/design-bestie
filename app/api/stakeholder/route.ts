import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { analysisResult } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a senior product consultant translating a UX audit into business language for a CEO, CPO, or PM.

UX analysis:
${JSON.stringify(analysisResult, null, 2)}

Rewrite this in pure business language. No UX jargon. No design terms.

Return:

1. "executive_summary": 2 sentences max. State of the product experience + what it means for business. Use: revenue, retention, conversion, churn, support cost.

2. "business_issues": for each issue, reframe as a business problem:
   - "element": same element name
   - "business_impact": 1 sentence — what this costs (revenue, users, trust, tickets)
   - "user_impact": 1 sentence — what the user does (leaves, gets confused, doesn't convert)
   - "effort": "Low" | "Medium" | "High"
   - "priority": "Ship this sprint" | "Next sprint" | "Backlog"

3. "wins_to_keep": 1 short sentence per win — business value only, no design language.

4. "priority_matrix": exactly 3 items, highest ROI first:
   - "action": short plain English action
   - "why": 1 sentence business case
   - "effort": "Low" | "Medium" | "High"
   - "impact": "Low" | "Medium" | "High"

5. "sprint_recommendation": exactly 3 Jira-ready tickets.
   Format: "[Action] [element] to [business outcome]"

6. "overall_business_score": 0-100

7. "score_label": short phrase. Examples: "Not ready to scale" | "Needs work before launch" | "Good enough to ship" | "Strong foundation"

NEVER use: Fitts's Law, heuristics, cognitive load, visual hierarchy, gestalt, affordance, UX, UI.
ALWAYS use: conversion, revenue, retention, churn, support cost, user trust, drop-off, engagement.

Return ONLY raw JSON, no markdown, no backticks:

{"overall_business_score":0,"score_label":"phrase","executive_summary":"2 sentences max","business_issues":[{"element":"name","business_impact":"1 sentence","user_impact":"1 sentence","effort":"Low","priority":"Ship this sprint"}],"wins_to_keep":["1 sentence per win"],"priority_matrix":[{"action":"short action","why":"1 sentence","effort":"Low","impact":"High"}],"sprint_recommendation":["ticket 1","ticket 2","ticket 3"]}`;

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
