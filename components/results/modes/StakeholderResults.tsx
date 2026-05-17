"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const effortStyle = (e: string) =>
  e === "Low" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : e === "Medium" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";
const priorityStyle = (p: string) =>
  p === "Ship this sprint" ? "text-red-600 bg-red-50 border-red-200" : p === "Next sprint" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-neutral-500 bg-neutral-50 border-neutral-200";
const impactStyle = (i: string) =>
  i === "High" ? "text-emerald-600" : i === "Medium" ? "text-amber-600" : "text-neutral-500";

type Props = {
  result: any;
  isLoading: boolean;
  onRun: () => void;
};

export default function StakeholderResults({ result, isLoading, onRun }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-500/30 border-t-blue-500" />
        <div className="text-[13px] font-semibold text-[#333]">Translating for stakeholders…</div>
        <p className="max-w-sm text-[12px] text-[#888]">Converting design issues into business risks and priorities.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <h3 className="text-[15px] font-semibold text-[#333]">Make it stakeholder-ready</h3>
        <p className="max-w-sm text-[12px] text-[#888]">
          Turn this analysis into a business report — exec summary, risks, priority matrix, sprint plan.
        </p>
        <button
          onClick={onRun}
          className="rounded-lg bg-[#5a47b0] px-4 text-white text-[12px] font-medium hover:bg-[#4a3a96] transition-colors"
          style={{ minHeight: "42px" }}
        >
          Generate stakeholder report
        </button>
      </div>
    );
  }

  const score: number = result.overall_business_score || 0;
  const scoreColor = score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-400">Executive Summary</div>
        <p className="mt-3 text-base leading-relaxed text-neutral-800">{result.executive_summary}</p>
        <div className="mt-5 flex items-center gap-5">
          <div>
            <div className={`text-5xl font-black leading-none ${scoreColor}`}>{score}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400">Business Score</div>
          </div>
          <Badge variant="outline" className={`${scoreColor} border-neutral-200 bg-[#FAFAFA] px-3 py-1 text-sm font-bold`}>
            {result.score_label}
          </Badge>
        </div>
      </Card>

      {(result.business_issues || []).length > 0 && (
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-red-600">Business Risks</div>
          <div className="flex flex-col gap-3">
            {result.business_issues.map((issue: any, idx: number) => (
              <Card key={idx} className="border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-neutral-900">{issue.element}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`${priorityStyle(issue.priority)} text-[10px] font-semibold`}>
                      {issue.priority}
                    </Badge>
                    <Badge variant="outline" className={`${effortStyle(issue.effort)} text-[10px] font-semibold`}>
                      {issue.effort} effort
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-neutral-700">💸 {issue.business_impact}</p>
                <p className="mt-1 text-xs text-neutral-500">👤 {issue.user_impact}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(result.wins_to_keep || []).length > 0 && (
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-emerald-600">What's Working</div>
          <div className="flex flex-col gap-2">
            {result.wins_to_keep.map((win: string, idx: number) => (
              <div key={idx} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                ✓ {win}
              </div>
            ))}
          </div>
        </div>
      )}

      {(result.priority_matrix || []).length > 0 && (
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-blue-600">Priority Matrix — Highest ROI First</div>
          <div className="flex flex-col gap-2">
            {result.priority_matrix.map((item: any, idx: number) => (
              <Card key={idx} className="border-blue-100 bg-blue-50/40 p-4 shadow-sm">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-neutral-900">
                    #{idx + 1} {item.action}
                  </span>
                  <div className="flex gap-3 text-[11px] font-semibold">
                    <span className={impactStyle(item.impact)}>↑ {item.impact} impact</span>
                    <span className={impactStyle(item.effort)}>⚡ {item.effort} effort</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">{item.why}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(result.sprint_recommendation || []).length > 0 && (
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-[#5a47b0]">Ready for Sprint Planning</div>
          <Card className="overflow-hidden border-neutral-200 bg-white p-0 shadow-sm">
            {result.sprint_recommendation.map((ticket: string, idx: number) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-4 ${idx < result.sprint_recommendation.length - 1 ? "border-b border-neutral-100" : ""}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#5a47b0] text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <span className="text-sm text-neutral-800">{ticket}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
