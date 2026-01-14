export const ANALYSIS_RUN_STATUS = ["queued", "running", "succeeded", "failed", "canceled"] as const;
export type AnalysisRunStatus = (typeof ANALYSIS_RUN_STATUS)[number];

export function isTerminalStatus(s: AnalysisRunStatus): boolean {
  return s === "succeeded" || s === "failed" || s === "canceled";
}