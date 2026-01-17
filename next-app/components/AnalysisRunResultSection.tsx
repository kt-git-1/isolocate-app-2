import { AnalysisRunResponse } from "@/features/analysisRuns/dto";

import { formatValue, prettyJson, toPopLabel } from "@/features/analysisRuns/analysisRunFormatters";
import { KeyValueGrid } from "@/components/KeyValueGrid";
import { SectionTitle } from "@/components/SectionTitle";

type Props = {
  data: AnalysisRunResponse | null;
};

export function AnalysisRunResultSection({ data }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold">解析結果</h2>
        <button
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs hover:bg-zinc-50"
          onClick={async () => {
            if (!data) return;
            await navigator.clipboard.writeText(prettyJson(data.resultJson));
          }}
          disabled={!data?.resultJson}
        >
          コピー
        </button>
      </div>

      {data?.status === "failed" && data?.errorMessage ? (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">Error</div>
          <div className="mt-1 whitespace-pre-wrap">{data.errorMessage}</div>
        </div>
      ) : null}

      {data?.resultJson ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <SectionTitle>概要</SectionTitle>
            <KeyValueGrid
              items={[
                {
                  label: "予測グループ",
                  value: toPopLabel(data.resultJson?.summary?.predictedGroup),
                },
                { label: "予測ラベル", value: data.resultJson?.summary?.predictedLabel },
                { label: "確率", value: data.resultJson?.summary?.probability },
                { label: "決定", value: data.resultJson?.summary?.decision },
              ]}
            />
          </div>

          {Array.isArray(data.resultJson?.scores) && data.resultJson.scores.length > 0 ? (
            <div className="space-y-2">
              <SectionTitle>スコア</SectionTitle>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-xs text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 text-left">グループ</th>
                      <th className="px-3 py-2 text-left">ラベル</th>
                      <th className="px-3 py-2 text-right">スコア</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {data.resultJson.scores.map((score, index) => (
                      <tr key={`${score.group}-${index}`} className="text-zinc-800">
                        <td className="px-3 py-2">{toPopLabel(score.group)}</td>
                        <td className="px-3 py-2">{formatValue(score.label)}</td>
                        <td className="px-3 py-2 text-right">
                          {typeof score.score === "number"
                            ? score.score.toFixed(3)
                            : formatValue(score.score)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <SectionTitle>モデル</SectionTitle>
            <KeyValueGrid
              items={[
                { label: "分類方法", value: data.resultJson?.model?.classificationMethod },
                { label: "ステップワイズ", value: data.resultJson?.model?.stepwise },
                { label: "グループ数", value: data.resultJson?.model?.compareGroupCount },
                { label: "アルゴリズム", value: data.resultJson?.model?.algorithmVersion },
                { label: "モデル", value: data.resultJson?.model?.modelVersion },
              ]}
            />
          </div>

          {Array.isArray(data.resultJson?.featuresUsed) && data.resultJson.featuresUsed.length > 0 ? (
            <div className="space-y-2">
              <SectionTitle>使用された特徴量</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {data.resultJson.featuresUsed.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {data.resultJson?.qc ? (
            <div className="space-y-2">
              <SectionTitle>QC</SectionTitle>
              <KeyValueGrid
                items={[
                  { label: "有効", value: data.resultJson.qc.isValidForRun },
                  {
                    label: "欠損フィールド",
                    value: (data.resultJson.qc.missingFields ?? []).join(", "),
                  },
                  {
                    label: "警告",
                    value: (data.resultJson.qc.warnings ?? []).join(", "),
                  },
                ]}
              />
            </div>
          ) : null}

          {data.resultJson?.artifacts ? (
            <div className="space-y-2">
              <SectionTitle>Artifacts</SectionTitle>
              <KeyValueGrid
                items={[
                  {
                    label: "Plot Paths",
                    value: (data.resultJson.artifacts.plotPaths ?? []).join(", "),
                  },
                  { label: "Raw Output Path", value: data.resultJson.artifacts.rawOutputPath },
                ]}
              />
            </div>
          ) : null}

          <details className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <summary className="cursor-pointer text-xs font-medium text-zinc-600">Raw JSON</summary>
            <pre className="mt-2 max-h-[360px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
              {prettyJson(data.resultJson)}
            </pre>
          </details>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {data?.status === "queued" || data?.status === "running"
            ? "解析中です。完了するとここに結果が表示されます。"
            : "結果がありません。"}
        </p>
      )}
    </section>
  );
}
