import { AnalysisRunResponse } from "@/features/analysisRuns/dto";

import { formatDate } from "./analysisRunFormatters";
import { StatusBadge } from "./StatusBadge";

type Props = {
  data: AnalysisRunResponse | null;
  polling: boolean;
};

export function AnalysisRunSummaryCard({ data, polling }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {data?.status ? (
            <StatusBadge status={data.status} />
          ) : (
            <span className="text-sm text-zinc-500">status: —</span>
          )}
          {polling && data && (data.status === "queued" || data.status === "running") && (
            <span className="text-xs text-zinc-500">自動更新中（2秒間隔）</span>
          )}
        </div>

        <div className="text-sm text-zinc-600">
          Reference:{" "}
          <span className="font-medium text-zinc-900">
            {data?.referenceDataset?.name ?? "—"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4">
          <div className="text-xs text-zinc-500">Created</div>
          <div className="mt-1 text-sm font-medium">{formatDate(data?.createdAt)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4">
          <div className="text-xs text-zinc-500">Started</div>
          <div className="mt-1 text-sm font-medium">{formatDate(data?.startedAt ?? null)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4">
          <div className="text-xs text-zinc-500">Finished</div>
          <div className="mt-1 text-sm font-medium">{formatDate(data?.finishedAt ?? null)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4">
          <div className="text-xs text-zinc-500">Versions</div>
          <div className="mt-1 text-sm font-medium">
            algo: {data?.algorithmVersion ?? "—"} / model: {data?.modelVersion ?? "—"}
          </div>
        </div>
      </div>
    </section>
  );
}
