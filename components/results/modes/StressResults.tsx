"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PERSONA_EMOJI: Record<string, string> = {
  "First-time User": "👋",
  "Power User": "⚡",
  "Accessibility User": "♿",
  "Older User": "👴",
  "Distracted User": "😵",
  "Mobile User": "📱",
  "Non-native Speaker": "🌍",
};

const PERSONA_DESC: Record<string, string> = {
  "First-time User": "No prior knowledge, relies on what they see",
  "Power User": "Wants speed, efficiency, no hand-holding",
  "Accessibility User": "Screen reader, keyboard nav, high contrast",
  "Older User": "Needs clarity, larger targets, familiar patterns",
  "Distracted User": "Multitasking, interrupted, can't re-read",
  "Mobile User": "One thumb, small screen, slow connection",
  "Non-native Speaker": "Struggles with jargon, idioms, dense text",
};

const sevText = (s: string) =>
  s === "critical"
    ? "text-red-600 bg-red-50"
    : s === "high" || s === "moderate"
    ? "text-amber-600 bg-amber-50"
    : s === "win"
    ? "text-emerald-600 bg-emerald-50"
    : "text-orange-600 bg-orange-50";

const sevLabel = (s: string) =>
  s === "critical" ? "Critical" : s === "high" || s === "moderate" ? "High" : s === "win" ? "Win" : "Medium";

type Props = {
  result: any;
  isLoading: boolean;
  onRun: () => void;
};

export default function StressResults({ result, isLoading, onRun }: Props) {
  const [activePersona, setActivePersona] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#5a47b0]/30 border-t-[#5a47b0]" />
        <div className="text-[13px] font-semibold text-[#333]">Running stress test…</div>
        <p className="max-w-sm text-[12px] text-[#888]">Testing your design through multiple persona lenses.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <h3 className="text-[15px] font-semibold text-[#333]">Stress test against personas</h3>
        <p className="max-w-sm text-[12px] text-[#888]">
          See how your design holds up against accessibility users, power users, first-timers, and more.
        </p>
        <button
          onClick={onRun}
          className="rounded-lg bg-[#5a47b0] px-4 text-white text-[12px] font-medium hover:bg-[#4a3a96] transition-colors"
          style={{ minHeight: "42px" }}
        >
          Run stress test
        </button>
      </div>
    );
  }

  const personas: any[] = result.personas || [];
  const persona = personas[activePersona];
  const stressIssues = persona ? [...(persona.issues || []), ...(persona.wins || [])] : [];

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-400">Cross-Persona Insight</div>
        <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-800">{result.cross_persona_insight}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
            Weakest: {result.weakest_persona}
          </Badge>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600">
            Strongest: {result.strongest_persona}
          </Badge>
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        {personas.map((p: any, idx: number) => {
          const isActive = idx === activePersona;
          const sc: number = p.persona_score || 0;
          const scText = sc >= 70 ? "text-emerald-600" : sc >= 50 ? "text-amber-600" : "text-red-600";
          return (
            <button
              key={p.name}
              onClick={() => setActivePersona(idx)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? "border-[#5a47b0] bg-[#5a47b0]/5 shadow-sm"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <span className="text-xl">{PERSONA_EMOJI[p.name] || "👤"}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-900">{p.name}</div>
                <div className="text-xs text-neutral-500">
                  {(p.issues || []).length} issues · {(p.wins || []).length} win
                </div>
              </div>
              <div className={`text-xl font-bold ${scText}`}>{sc}</div>
            </button>
          );
        })}
      </div>

      {persona && (
        <Card className="border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5a47b0]/10 text-2xl">
              {PERSONA_EMOJI[persona.name] || "👤"}
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-neutral-900">{persona.name}</div>
              <div className="text-sm text-neutral-500">{PERSONA_DESC[persona.name] || ""}</div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-black leading-none ${(persona.persona_score || 0) >= 70 ? "text-emerald-600" : (persona.persona_score || 0) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                {persona.persona_score || 0}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400">Score</div>
            </div>
          </div>

          <div className="mb-3 text-sm font-bold text-neutral-900">Issues &amp; wins</div>
          <div className="flex flex-col gap-2">
            {stressIssues.map((issue: any, i: number) => (
              <div
                key={`${issue.id}-${i}`}
                className="rounded-lg border border-neutral-200 bg-[#FAFAFA] p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">{issue.element}</span>
                  <Badge variant="outline" className={`${sevText(issue.severity)} border-transparent text-[10px] font-semibold`}>
                    {sevLabel(issue.severity)}
                  </Badge>
                </div>
                {issue.what && <div className="text-sm text-neutral-700">{issue.what}</div>}
                {issue.user_impact && (
                  <div className="mt-1 text-xs text-neutral-500">{issue.user_impact}</div>
                )}
                {issue.direction && issue.direction !== "Keep this pattern" && (
                  <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-900">
                    → {issue.direction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
