import { MetadataFieldsProps } from "@/features/analysisRuns/domain/types";

export function MetadataFields({
  value,
  onChange,
}: {
  value: MetadataFieldsProps;
  onChange: (next: MetadataFieldsProps) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <label className="space-y-1 text-sm text-slate-700">
        <span className="text-xs text-slate-600">ケース番号</span>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={value.caseNumber}
          onChange={(e) => onChange({ ...value, caseNumber: e.target.value })}
          placeholder="例: ISO-2026-001"
        />
      </label>
      <label className="space-y-1 text-sm text-slate-700">
        <span className="text-xs text-slate-600">分析担当者名</span>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={value.analystName}
          onChange={(e) => onChange({ ...value, analystName: e.target.value })}
          placeholder="担当者名"
        />
      </label>
      <label className="space-y-1 text-sm text-slate-700">
        <span className="text-xs text-slate-600">分析対象元素</span>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={value.elementSampled}
          onChange={(e) => onChange({ ...value, elementSampled: e.target.value })}
          placeholder="例: C, N, O"
        />
      </label>
    </div>
  );
}
