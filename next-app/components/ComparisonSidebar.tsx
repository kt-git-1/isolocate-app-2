"use client";

import {
  Classifier,
  ComparisonParameters,
  GroupCount,
  PopGroup,
  Stepwise,
} from "@/features/analysisRuns/domain/types";
import { POP_LABELS, CLASSIFIER_LABELS, STEPWISE_LABELS, GROUP_COUNT_LABELS } from "@/features/analysisRuns/domain/labels";

const POPS: PopGroup[] = ["Asian", "Japan", "NEA", "SEA", "UBC", "US"];

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-600 mb-1">{children}</div>;
}

export function ComparisonSidebar({
  value,
  onChange,
  onEvaluate,
  loading,
}: {
  value: ComparisonParameters;
  onChange: (next: ComparisonParameters) => void;
  onEvaluate: () => void;
  loading: boolean;
}) {
  const togglePop = (p: PopGroup) => {
    const set = new Set(value.populations);
    set.has(p) ? set.delete(p) : set.add(p);
    onChange({ ...value, populations: Array.from(set) as PopGroup[] });
  };

  return (
    <aside className="rounded-md border bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">比較パラメータ</h2>

      <div className="space-y-4">
        <div>
          <Label>参照サンプルを選択</Label>
          <button
            type="button"
            className="w-full rounded border px-3 py-2 text-left text-sm bg-slate-50 hover:bg-slate-100"
            onClick={() => onChange({ ...value, referenceSample: "png-modern-2026-01" })}
          >
            現代同位体データセット
          </button>
        </div>

        <div>
          <Label>比較するグループ数を選択</Label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={value.numberOfGroups}
            onChange={(e) =>
              onChange({
                ...value,
                numberOfGroups: e.target.value as GroupCount,
              })
            }
          >
            {(Object.keys(GROUP_COUNT_LABELS) as GroupCount[]).map((groupCount) => (
              <option key={groupCount} value={groupCount}>
                {GROUP_COUNT_LABELS[groupCount]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>分類手法を選択</Label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={value.classifier}
            onChange={(e) =>
              onChange({
                ...value,
                classifier: e.target.value as Classifier,
              })
            }
          >
            {(Object.keys(CLASSIFIER_LABELS) as Classifier[]).map((classifier) => (
              <option key={classifier} value={classifier}>
                {CLASSIFIER_LABELS[classifier]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>ステップワイズの方法を選択</Label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={value.stepwise}
            onChange={(e) =>
              onChange({
                ...value,
                stepwise: e.target.value as Stepwise,
              })
            }
          >
            {(Object.keys(STEPWISE_LABELS) as Stepwise[]).map((stepwise) => (
              <option key={stepwise} value={stepwise}>
                {STEPWISE_LABELS[stepwise]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>比較する集団を選択</Label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {POPS.map((p) => (
              <label key={p} className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={value.populations.includes(p)}
                  onChange={() => togglePop(p)}
                />
                <span>{POP_LABELS[p]}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onEvaluate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "評価中..." : "評価する"}
        </button>
      </div>
    </aside>
  );
}