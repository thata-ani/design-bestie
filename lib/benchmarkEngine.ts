type BenchmarkOutput = {
  benchmark: "below_average" | "average" | "above_average";
  message: string;
};

export function calculateBenchmark(score: number): BenchmarkOutput {
  if (score >= 75) {
    return {
      benchmark: "above_average",
      message: "Better than most designs — strong foundation with minor refinements needed.",
    };
  } else if (score >= 50) {
    return {
      benchmark: "average",
      message: "Meets basic UX standards but has clear areas for improvement.",
    };
  } else {
    return {
      benchmark: "below_average",
      message: "Significant UX issues detected — prioritise fixes before shipping.",
    };
  }
}
