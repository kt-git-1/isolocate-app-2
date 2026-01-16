"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AnalysisRunResponse } from "@/features/analysisRuns/dto";

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
            <h2 className="text-base font-semibold">Input</h2>
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
          ) : (
            <pre className="max-h-[520px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
              {data ? prettyJson(data.inputJson) : "—"}
            </pre>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">Result</h2>
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
            <pre className="max-h-[520px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
              {prettyJson(data.resultJson)}
            </pre>
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
