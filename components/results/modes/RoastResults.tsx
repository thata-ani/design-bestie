"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const severityAccent = (s: string) =>
  s === "critical" ? "border-l-red-500" : s === "high" ? "border-l-amber-500" : "border-l-orange-500";

type Props = {
  result: any;
  isLoading: boolean;
  onRun: () => void;
};

export default function RoastResults({ result, isLoading, onRun }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-red-500/30 border-t-red-500" />
        <div className="text-[13px] font-semibold text-[#333]">Roasting your design…</div>
        <p className="max-w-sm text-[12px] text-[#888]">Brutal feedback incoming. This takes a few seconds.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <h3 className="text-[15px] font-semibold text-[#333]">Want the brutal truth?</h3>
        <p className="max-w-sm text-[12px] text-[#888]">
          A no-holds-barred roast of your design. Editorial, harsh, and weirdly useful.
        </p>
        <button
          onClick={onRun}
          className="rounded-lg bg-[#5a47b0] px-4 text-white text-[12px] font-medium hover:bg-[#4a3a96] transition-colors"
          style={{ minHeight: "42px" }}
        >
          Roast this design
        </button>
      </div>
    );
  }

  const score: number = result.roast_score || 0;
  const scoreColor = score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-neutral-900 p-8 text-white shadow-lg">
        <div className="mb-4 text-3xl">🔥</div>
        <p className="text-lg italic leading-relaxed text-white/90">"{result.opening}"</p>
        <div className="mt-6 flex items-center gap-6">
          <div>
            <div className={`text-5xl font-black leading-none ${scoreColor}`}>{score}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[2px] text-white/40">Roast Score</div>
          </div>
          <Badge className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-sm font-bold text-white">
            "{result.roast_label}"
          </Badge>
        </div>
      </div>

      <div>
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-red-600">The Roast 🔥</div>
        <div className="flex flex-col gap-3">
          {(result.roasts || []).map((r: any, idx: number) => (
            <Card
              key={idx}
              className={`border border-red-100 bg-red-50/40 p-5 shadow-sm border-l-4 ${severityAccent(r.severity)}`}
            >
              <div className="text-base font-bold leading-snug text-neutral-900">"{r.roast}"</div>
              <div className="mt-1 text-xs italic text-neutral-600">
                {r.element} — {r.real_talk}
              </div>
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                → {r.fix}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {(result.hypes || []).length > 0 && (
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-emerald-600">The Hype ✨</div>
          <div className="flex flex-col gap-3">
            {(result.hypes || []).map((h: any, idx: number) => (
              <Card key={idx} className="border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-base font-bold text-neutral-900">"{h.hype}"</div>
                <div className="mt-1 text-xs italic text-neutral-600">
                  {h.element} — {h.real_talk}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {result.redemption && (
        <Card className="border-neutral-200 bg-[#FAFAFA] p-5 text-center shadow-sm">
          <span className="text-sm italic text-neutral-600">"{result.redemption}"</span>
        </Card>
      )}
    </div>
  );
}
