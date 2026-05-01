type BenchmarkOutput = {
  benchmark: string;
  message: string;
};

export function getBenchmark(score: number, issues: any[]): BenchmarkOutput {
  let benchmark: string;
  if (score >= 80) {
    benchmark = "You're in the top 20% of designers";
  } else if (score >= 60) {
    benchmark = "You're in the top 40% of designers";
  } else {
    benchmark = "You're in the bottom 30% — keep pushing";
  }

  const types = issues.map((i: any) => i.type || "");
  const problems: string[] = [];

  if (types.includes("missing_cta")) problems.push("CTA clarity");
  if (types.includes("low_contrast")) problems.push("accessibility");
  if (types.includes("cluttered_layout")) problems.push("visual hierarchy");
  if (types.includes("too_many_cta")) problems.push("focus");
  if (types.includes("poor_spacing")) problems.push("consistency");

  let message: string;
  if (problems.length === 0) {
    message = score >= 80
      ? "Strong design — no major UX pattern violations detected."
      : score >= 60
      ? "Meets basic UX standards but has room for improvement."
      : "Several UX issues detected — prioritise fixes before shipping.";
  } else {
    const top = problems.slice(0, 2).join(" and ");
    message = score >= 80
      ? `Solid design — minor improvements needed around ${top}.`
      : score >= 60
      ? `Focus on improving ${top} to move up.`
      : `Critical work needed on ${top} to level up.`;
  }

  return { benchmark, message };
}
