import { AnalysisRunResponse } from "@/features/analysisRuns/dto";

const statusStyles: Record<AnalysisRunResponse["status"] | "default", string> = {
  queued: "bg-zinc-100 text-zinc-800 border-zinc-200",
  running: "bg-blue-50 text-blue-800 border-blue-200",
  succeeded: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-red-50 text-red-800 border-red-200",
  canceled: "bg-gray-50 text-gray-800 border-gray-200",
  default: "bg-zinc-100 text-zinc-800 border-zinc-200",
};

export function StatusBadge({ status }: { status: AnalysisRunResponse["status"] }) {
  const cls = statusStyles[status] ?? statusStyles.default;
  const label = status ?? "";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
