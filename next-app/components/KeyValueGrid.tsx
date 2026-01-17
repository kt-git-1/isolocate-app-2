import { formatValue } from "@/features/analysisRuns/analysisRunFormatters";

type KeyValueItem = { label: string; value: unknown };

export function KeyValueGrid({ items }: { items: KeyValueItem[] }) {
  if (!items.length) return <p className="text-sm text-zinc-500">データがありません。</p>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-zinc-200 p-3">
          <div className="text-xs text-zinc-500">{item.label}</div>
          <div className="mt-1 text-sm font-medium">{formatValue(item.value)}</div>
        </div>
      ))}
    </div>
  );
}
