"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEELING_STYLES: Record<string, { text: string; bg: string; border: string; emoji: string }> = {
  safe: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", emoji: "🛡️" },
  trustworthy: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", emoji: "🤝" },
  exciting: { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", emoji: "⚡" },
  boring: { text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200", emoji: "💤" },
  confusing: { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", emoji: "❓" },
  overwhelming: { text: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-200", emoji: "🌀" },
};

type Props = {
  result: any;
  isLoading: boolean;
  onRun: () => void;
};

export default function FirstFiveResults({ result, isLoading, onRun }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-pink-500/30 border-t-pink-500" />
        <div className="text-[13px] font-semibold text-[#333]">Reading your design's first impression…</div>
        <p className="max-w-sm text-[12px] text-[#888]">Capturing what registers in the first 5 seconds.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <h3 className="text-[15px] font-semibold text-[#333]">First 5 Seconds Test</h3>
        <p className="max-w-sm text-[12px] text-[#888]">
          What does a user feel, notice, and miss in the first glance? Before conscious thought kicks in.
        </p>
        <button
          onClick={onRun}
          className="rounded-lg bg-[#5a47b0] px-4 text-white text-[12px] font-medium hover:bg-[#4a3a96] transition-colors"
          style={{ minHeight: "42px" }}
        >
          Run First 5 test
        </button>
      </div>
    );
  }

  const feeling = (result.firstFeeling || "").toLowerCase().trim();
  const fStyle = FEELING_STYLES[feeling] || { text: "text-neutral-700", bg: "bg-neutral-50", border: "border-neutral-200", emoji: "👁️" };
  const noticed: string[] = Array.isArray(result.noticed) ? result.noticed : [];
  const missed: string[] = Array.isArray(result.missed) ? result.missed : [];
  const misunderstood: string[] = Array.isArray(result.misunderstood) ? result.misunderstood : [];
  const score = typeof result.attentionScore === "number" ? Math.max(0, Math.min(100, result.attentionScore)) : 0;
  const scoreColor = score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  const scoreBar = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex flex-col gap-5">
      <Card className={`${fStyle.bg} ${fStyle.border} p-6 text-center shadow-sm`}>
        <div className={`mb-2 text-[10px] font-bold uppercase tracking-[3px] ${fStyle.text} opacity-80`}>First Feeling</div>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">{fStyle.emoji}</span>
          <span className={`text-5xl font-black lowercase leading-none tracking-tight ${fStyle.text}`}>
            {feeling || "—"}
          </span>
        </div>
      </Card>

      <Card className="border-blue-200 bg-blue-50/40 p-5 shadow-sm border-l-4 border-l-blue-500">
        <div className="flex items-start gap-3">
          <span className="text-xl">👁️</span>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-blue-600">Eye Goes to First</div>
            <div className="mt-1 text-base font-medium leading-snug text-neutral-900">{result.noticeFirst || "—"}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[2px] text-emerald-600">Noticed</div>
          <div className="flex flex-col gap-2">
            {noticed.length > 0 ? (
              noticed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-neutral-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <span className="text-sm italic text-neutral-400">—</span>
            )}
          </div>
        </Card>

        <Card className="border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[2px] text-red-600">Missed</div>
          <div className="flex flex-col gap-2">
            {missed.length > 0 ? (
              missed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-neutral-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <span className="text-sm italic text-neutral-400">—</span>
            )}
          </div>
        </Card>
      </div>

      {misunderstood.length > 0 && (
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[2px] text-amber-600">Misunderstood</div>
          <div className="flex flex-col gap-2">
            {misunderstood.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 border-l-4 border-l-amber-500"
              >
                <span className="text-sm">⚠</span>
                <span className="text-sm text-neutral-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-neutral-400">Attention Score</div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className={`h-full rounded-full transition-all ${scoreBar}`} style={{ width: `${score}%` }} />
            </div>
          </div>
          <div className="flex shrink-0 items-baseline gap-1">
            <span className={`text-4xl font-black leading-none ${scoreColor}`}>{score}</span>
            <span className="text-sm font-semibold text-neutral-400">/100</span>
          </div>
        </div>
      </Card>

      {result.verdict && (
        <div className="px-2 pt-2 text-center text-lg italic leading-relaxed text-neutral-500">
          "{result.verdict}"
        </div>
      )}
    </div>
  );
}
