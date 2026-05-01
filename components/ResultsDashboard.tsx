"use client";

type Breakdown = {
  clarity: number;
  hierarchy: number;
  accessibility: number;
  cognitive_load: number;
  consistency: number;
};

type ScoreOutput = {
  score: number;
  confidence: "low" | "medium" | "high";
  breakdown: Breakdown;
};

type Issue = {
  id: number;
  element: string;
  severity: string;
  type: string;
  rule_violated: string;
  problem: string;
  learn_why: string;
  fix: string;
  zone: string;
};

type Props = {
  score: ScoreOutput;
  issues: Issue[];
  wins: Issue[];
  summary: string;
  priority_fixes: string[];
};

const confidenceColor = {
  high: "text-green-500",
  medium: "text-yellow-500",
  low: "text-red-500",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
};

const categoryLabel: Record<keyof Breakdown, string> = {
  clarity: "Clarity",
  hierarchy: "Hierarchy",
  accessibility: "Accessibility",
  cognitive_load: "Cognitive Load",
  consistency: "Consistency",
};

const categoryMax: Record<keyof Breakdown, number> = {
  clarity: 25,
  hierarchy: 20,
  accessibility: 15,
  cognitive_load: 20,
  consistency: 20,
};

export default function ResultsDashboard({ score, issues, wins, summary, priority_fixes }: Props) {
  const affectedCategories = Object.entries(score.breakdown)
    .filter(([key, val]) => val < categoryMax[key as keyof Breakdown])
    .map(([key]) => categoryLabel[key as keyof Breakdown]);

  const issueSummary =
    issues.length > 0
      ? `${issues.length} issue${issues.length > 1 ? "s" : ""} detected${
          affectedCategories.length > 0
            ? ` affecting ${affectedCategories.slice(0, 2).join(" and ").toLowerCase()}`
            : ""
        }`
      : "No major issues detected";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">

      {/* Score Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center gap-2">
        <p className="text-sm text-neutral-500 uppercase tracking-widest">UX Score</p>
        <p className={`text-7xl font-bold ${scoreColor(score.score)}`}>{score.score}</p>
        <p className={`text-sm font-medium ${confidenceColor[score.confidence]}`}>
          {score.confidence.charAt(0).toUpperCase() + score.confidence.slice(1)} confidence
        </p>
        <p className="text-sm text-neutral-500 mt-1">{issueSummary}</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm text-neutral-400 mb-1">Summary</p>
          <p className="text-base font-medium">{summary}</p>
        </div>
      )}

      {/* Breakdown */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <p className="text-sm text-neutral-400 mb-2">Score Breakdown</p>
        {(Object.keys(score.breakdown) as (keyof Breakdown)[]).map((key) => {
          const val = score.breakdown[key];
          const max = categoryMax[key];
          const pct = Math.round((val / max) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span>{categoryLabel[key]}</span>
                <span className="text-neutral-400">{val}/{max}</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Fixes */}
      {priority_fixes?.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
          <p className="text-sm text-neutral-400 mb-2">Priority Fixes</p>
          {priority_fixes.map((fix, i) => (
            <p key={i} className="text-sm text-neutral-700 dark:text-neutral-300">
              {i + 1}. {fix}
            </p>
          ))}
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">Issues</p>
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{issue.element}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  issue.severity === "critical" ? "bg-red-100 text-red-600" :
                  issue.severity === "high" ? "bg-orange-100 text-orange-600" :
                  "bg-yellow-100 text-yellow-600"
                }`}>{issue.severity}</span>
              </div>
              <p className="text-xs text-neutral-500">{issue.rule_violated}</p>
              <p className="text-sm">{issue.problem}</p>
              <p className="text-xs text-blue-500">{issue.fix}</p>
            </div>
          ))}
        </div>
      )}

      {/* Wins */}
      {wins.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">Wins</p>
          {wins.map((win) => (
            <div key={win.id} className="rounded-2xl border border-green-200 dark:border-green-900 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{win.element}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">win</span>
              </div>
              <p className="text-xs text-neutral-500">{win.rule_violated}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
