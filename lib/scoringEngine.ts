type Issue = {
  type: string;
  severity: "low" | "medium" | "high";
};

type ScoreOutput = {
  score: number;
  confidence: "low" | "medium" | "high";
  breakdown: {
    clarity: number;
    hierarchy: number;
    accessibility: number;
    cognitive_load: number;
    consistency: number;
  };
};

const DEDUCTIONS: Record<string, { points: number; category: keyof ScoreOutput["breakdown"] }> = {
  missing_cta:      { points: 15, category: "clarity" },
  low_contrast:     { points: 10, category: "accessibility" },
  too_many_cta:     { points: 8,  category: "hierarchy" },
  cluttered_layout: { points: 10, category: "cognitive_load" },
  poor_spacing:     { points: 5,  category: "consistency" },
};

const CATEGORY_MAX: Record<keyof ScoreOutput["breakdown"], number> = {
  clarity:       25,
  hierarchy:     20,
  accessibility: 15,
  cognitive_load: 20,
  consistency:   20,
};

export function calculateUXScore(issues: Issue[]): ScoreOutput {
  let score = 100;

  const deducted: Record<keyof ScoreOutput["breakdown"], number> = {
    clarity: 0,
    hierarchy: 0,
    accessibility: 0,
    cognitive_load: 0,
    consistency: 0,
  };

  for (const issue of issues) {
    const rule = DEDUCTIONS[issue.type];
    if (rule) {
      score -= rule.points;
      deducted[rule.category] += rule.points;
    }
  }

  // Clamp score between 0–100
  score = Math.max(0, Math.min(100, score));

  // Calculate per-category score (max - deducted, clamped to 0)
  const breakdown: ScoreOutput["breakdown"] = {
    clarity:        Math.max(0, CATEGORY_MAX.clarity - deducted.clarity),
    hierarchy:      Math.max(0, CATEGORY_MAX.hierarchy - deducted.hierarchy),
    accessibility:  Math.max(0, CATEGORY_MAX.accessibility - deducted.accessibility),
    cognitive_load: Math.max(0, CATEGORY_MAX.cognitive_load - deducted.cognitive_load),
    consistency:    Math.max(0, CATEGORY_MAX.consistency - deducted.consistency),
  };

  // Confidence based on issue count
  const count = issues.length;
  const confidence: ScoreOutput["confidence"] =
    count <= 2 ? "high" : count <= 5 ? "medium" : "low";

  return { score, confidence, breakdown };
}
