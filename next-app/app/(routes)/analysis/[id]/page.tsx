"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AnalysisRunResponse } from "@/features/analysisRuns/dto";
import {
  CLASSIFIER_LABELS,
  GROUP_COUNT_LABELS,
  POP_LABELS,
  STEPWISE_LABELS,
} from "@/features/analysisRuns/domain/labels";

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP");
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function toPopLabel(value: string | undefined) {
  if (!value) return "—";
  return POP_LABELS[value as keyof typeof POP_LABELS] ?? value;
}

function toClassifierLabel(value: string | undefined) {
  if (!value) return "—";
  return CLASSIFIER_LABELS[value as keyof typeof CLASSIFIER_LABELS] ?? value;
}

function toStepwiseLabel(value: string | undefined) {
  if (!value) return "—";
  return STEPWISE_LABELS[value as keyof typeof STEPWISE_LABELS] ?? value;
}

function toGroupCountLabel(value: string | undefined) {
  if (!value) return "—";
  return GROUP_COUNT_LABELS[value as keyof typeof GROUP_COUNT_LABELS] ?? value;
}

function KeyValueGrid({ items }: { items: { label: string; value: unknown }[] }) {
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

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-sm font-semibold text-zinc-700">{children}</h3>;
}

function StatusBadge({ status }: { status: AnalysisRunResponse["status"] }) {
  const cls = useMemo(() => {
    switch (status) {
      case "queued":
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
      case "running":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "succeeded":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "failed":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  }, [status]);

  const label = useMemo(() => {
    switch (status) {
      case "queued":
        return "queued";
      case "running":
        return "running";
      case "succeeded":
        return "succeeded";
      case "failed":
        return "failed";
      default:
        return String(status);
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function AnalysisRunPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id;

  const [data, setData] = useState<AnalysisRunResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [polling, setPolling] = useState<boolean>(true);

  async function fetchRun(signal?: AbortSignal) {
    if (!id) return;
    setErr(null);

    try {
      const res = await fetch(`/api/analysis-runs/${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
        signal,
      });

      if (res.status === 404) {
        setErr("指定された解析IDが見つかりませんでした。");
        setData(null);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error: ${res.status} ${res.statusText} ${text}`.trim());
      }

      const json = (await res.json()) as AnalysisRunResponse;
      setData(json);

      // 終了したらポーリング停止
      if (json.status === "succeeded" || json.status === "failed") {
        setPolling(false);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message ?? "不明なエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  // 初回ロード
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetchRun(ac.signal);
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ポーリング（queued/running の間）
  useEffect(() => {
    if (!id) return;
    if (!polling) return;

    const ac = new AbortController();
    const timer = setInterval(() => {
      fetchRun(ac.signal);
    }, 2000);

    return () => {
      ac.abort();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, polling]);

  const title = `解析ID: ${id ?? ""}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            解析結果・入力データ・エラー情報を確認できます。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
            onClick={() => router.push("/analysis")}
          >
            一覧へ
          </button>
          <button
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
            onClick={() => {
              setPolling(true);
              setLoading(true);
              fetchRun();
            }}
          >
            更新
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {err}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {data?.status ? <StatusBadge status={data.status} /> : <span className="text-sm text-zinc-500">status: —</span>}
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

      <div className="mt-6 grid grid-cols-1 gap-6">
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
                <summary className="cursor-pointer text-xs font-medium text-zinc-600">
                  Raw JSON
                </summary>
                <pre className="mt-2 max-h-[360px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
                  {prettyJson(data.inputJson)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">データがありません。</p>
          )}
        </section>

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
                <summary className="cursor-pointer text-xs font-medium text-zinc-600">
                  Raw JSON
                </summary>
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
      </div>

      <div className="mt-8 text-xs text-zinc-500">
        表示が更新されない場合は「更新」ボタンを押してください。
      </div>
    </main>
  );
}
