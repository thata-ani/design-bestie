type BenchmarkOutput = {
  benchmark: string;
  message: string;
};

export function getBenchmark(score: number, issues: any[]): BenchmarkOutput {
  let benchmark: string;
  if (score >= 80) {
    benchmark = "Better than 80% of designs";
  } else if (score >= 60) {
    benchmark = "Better than 40% of designs";
  } else {
    benchmark = "Needs significant work";
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
      ? `Average design — focus on improving ${top} to move up.`
      : `Below average — critical work needed on ${top}.`;
  }

  return { benchmark, message };
}
