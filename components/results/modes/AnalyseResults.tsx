"use client";

import React, { useState } from "react";

const severityMeta = (severity: string) => {
  if (severity === "critical") return { label: "Critical", borderColor: "#ef4444", bg: "bg-red-50" };
  if (severity === "high" || severity === "moderate") return { label: "High", borderColor: "#f59e0b", bg: "bg-amber-50" };
  if (severity === "medium" || severity === "minor") return { label: "Medium", borderColor: "#f97316", bg: "bg-orange-50" };
  return { label: "Win", borderColor: "#10b981", bg: "bg-emerald-50" };
};

type Props = {
  analysisResult: any;
  issues: any[];
  expandedCards: number[];
  setExpandedCards: React.Dispatch<React.SetStateAction<number[]>>;
  activeIssueId: number | null;
  setActiveIssueId: React.Dispatch<React.SetStateAction<number | null>>;
};

type Filter = "all" | "high" | "medium" | "wins";

export default function AnalyseResults({
  analysisResult,
  issues,
  expandedCards,
  setExpandedCards,
  activeIssueId,
  setActiveIssueId,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [hoveredFix, setHoveredFix] = useState<number | null>(null);

  const priorityFixes: string[] = analysisResult?.priority_fixes || [];

  const counts = {
    all: issues.length,
    high: issues.filter((i) => i.severity === "critical" || i.severity === "high" || i.severity === "moderate").length,
    medium: issues.filter((i) => i.severity === "medium" || i.severity === "minor").length,
    wins: issues.filter((i) => i.severity === "win").length,
  };

  const filtered =
    filter === "all"
      ? issues
      : filter === "wins"
      ? issues.filter((i) => i.severity === "win")
      : filter === "high"
      ? issues.filter((i) => i.severity === "critical" || i.severity === "high" || i.severity === "moderate")
      : issues.filter((i) => i.severity === "medium" || i.severity === "minor");

  const handleCardClick = (id: number) => {
    setActiveIssueId(prev => prev === id ? null : id);
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "wins", label: "Wins" },
  ];

  const topThreeIssues = issues.filter((i) => i.severity !== "win").slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* If you only fix three things */}
      {topThreeIssues.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-[#333] mb-3">If you only fix three things</h3>
          <div className="flex flex-col gap-2">
            {topThreeIssues.map((issue, idx) => {
              const meta = severityMeta(issue.severity);
              const isHovered = hoveredFix === idx;
              return (
                <div
                  key={idx}
                  className="relative border-l-4 bg-white border border-[#e8e8e8] rounded-lg p-4 cursor-pointer transition-all"
                  style={{ borderLeftColor: meta.borderColor }}
                  onMouseEnter={() => setHoveredFix(idx)}
                  onMouseLeave={() => setHoveredFix(null)}
                  onClick={() => handleCardClick(issue.id)}
                >
                  <div className="flex gap-3">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-semibold"
                      style={{ backgroundColor: meta.borderColor }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-[#333] mb-1">{issue.element}</div>
                      <div className="text-[12px] text-[#666] mb-2">{issue.what}</div>
                      {issue.why && (
                        <div className="inline-block text-[10px] font-medium text-[#5a47b0] bg-[#5a47b0]/10 px-2 py-0.5 rounded">
                          {issue.why}
                        </div>
                      )}
                    </div>
                  </div>
                  {isHovered && issue.direction && (
                    <div className="mt-3 pt-3 border-t border-[#e8e8e8]">
                      <div className="text-[11px] text-[#10b981] font-medium">→ how to fix</div>
                      <div className="text-[12px] text-[#666] mt-1">{issue.direction}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[#e8e8e8]" />

      {/* Detailed critique */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#333] mb-3">Detailed critique</h3>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                filter === f.key
                  ? "bg-black text-white"
                  : "bg-white text-[#888] border border-[#e8e8e8] hover:border-[#bbb]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Issue cards */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="rounded-lg bg-[#fafafa] p-6 text-center text-[12px] text-[#bbb]">
              Nothing here.
            </div>
          )}
          {filtered.map((issue: any) => {
            const meta = severityMeta(issue.severity);
            const isWin = issue.severity === "win";
            return (
              <div
                key={`issue-${issue.id}`}
                className="border-l-4 bg-white border border-[#e8e8e8] rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all"
                style={{ borderLeftColor: meta.borderColor }}
                onClick={() => handleCardClick(issue.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#333]">{issue.element}</span>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: meta.borderColor + "22",
                          color: meta.borderColor,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#666]">{issue.what}</div>
                    {issue.why && (
                      <div className="inline-block text-[10px] font-medium text-[#5a47b0] bg-[#5a47b0]/10 px-2 py-0.5 rounded mt-2">
                        {issue.why}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
