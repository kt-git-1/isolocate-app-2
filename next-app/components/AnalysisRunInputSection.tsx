import { AnalysisRunResponse } from "@/features/analysisRuns/dto";

import {
  prettyJson,
  toClassifierLabel,
  toGroupCountLabel,
  toPopLabel,
  toStepwiseLabel,
} from "@/features/analysisRuns/analysisRunFormatters";
import { KeyValueGrid } from "@/components/KeyValueGrid";
import { SectionTitle } from "@/components/SectionTitle";

type Props = {
  data: AnalysisRunResponse | null;
  loading: boolean;
};

export function AnalysisRunInputSection({ data, loading }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold">入力データ</h2>
        <button
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs hover:bg-zinc-50"
          onClick={async () => {
            if (!data) return;
            await navigator.clipboard.writeText(prettyJson(data.inputJson));
          }}
          disabled={!data}
        >
          コピー
        </button>
      </div>

      {loading && !data ? (
        <p className="text-sm text-zinc-500">読み込み中…</p>
      ) : data ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <SectionTitle>メタ情報</SectionTitle>
            <KeyValueGrid
              items={[
                { label: "ケース番号", value: data.inputJson?.metadata?.caseNumber },
                { label: "解析者名", value: data.inputJson?.metadata?.analystName },
                { label: "分析対象元素", value: data.inputJson?.metadata?.elementSampled },
              ]}
            />
          </div>
          <div className="space-y-2">
            <SectionTitle>比較パラメータ</SectionTitle>
            <KeyValueGrid
              items={[
                { label: "参照サンプル", value: data.inputJson?.comparison?.referenceSample },
                {
                  label: "グループ数",
                  value: toGroupCountLabel(data.inputJson?.comparison?.numberOfGroups),
                },
                {
                  label: "分類器",
                  value: toClassifierLabel(data.inputJson?.comparison?.classifier),
                },
                {
                  label: "ステップワイズ",
                  value: toStepwiseLabel(data.inputJson?.comparison?.stepwise),
                },
                {
                  label: "集団",
                  value: (data.inputJson?.comparison?.populations ?? [])
                    .map((pop) => toPopLabel(pop))
                    .join(", "),
                },
              ]}
            />
          </div>
          <div className="space-y-2">
            <SectionTitle>同位体入力</SectionTitle>
            <KeyValueGrid
              items={[
                { label: "コラーゲン δ13C", value: data.inputJson?.isotopeInputs?.collagen?.col13c },
                { label: "コラーゲン δ15N", value: data.inputJson?.isotopeInputs?.collagen?.col15n },
                { label: "コラーゲン δ34S", value: data.inputJson?.isotopeInputs?.collagen?.col34s },
                { label: "アパタイト δ13C", value: data.inputJson?.isotopeInputs?.apatite?.a13c },
                { label: "アパタイト δ18O", value: data.inputJson?.isotopeInputs?.apatite?.a18o },
                { label: "エナメル δ13C", value: data.inputJson?.isotopeInputs?.enamel?.e13c },
                { label: "エナメル δ18O", value: data.inputJson?.isotopeInputs?.enamel?.e18o },
              ]}
            />
          </div>
          <details className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <summary className="cursor-pointer text-xs font-medium text-zinc-600">Raw JSON</summary>
            <pre className="mt-2 max-h-[360px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
              {prettyJson(data.inputJson)}
            </pre>
          </details>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">データがありません。</p>
      )}
    </section>
  );
}
