"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listAnalysisRunsAction } from "./actions";

type AnalysisRunListItem = {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "canceled";
  referenceDataset?: {
    name?: string | null;
    version?: string | null;
  } | null;
  inputJson?: {
    metadata?: {
      caseNumber?: string | null;
      analystName?: string | null;
      elementSampled?: string | null;
    } | null;
  } | null;
  algorithmVersion?: string | null;
  modelVersion?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP");
}

export default function AnalysisListPage() {
  const take = 50;
  const [runs, setRuns] = useState<AnalysisRunListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRuns() {
    setError(null);
    setLoading(true);
    try {
      const result = await listAnalysisRunsAction(take);
      setRuns(Array.isArray(result) ? result : []);
    } catch (e: any) {
      setError(e?.message ?? "不明なエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">解析一覧</h1>
          <p className="mt-1 text-sm text-zinc-600">
            最新{take}件の解析ステータスを表示します。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/analysis/new"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
          >
            新規解析
          </Link>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
            onClick={fetchRuns}
          >
            更新
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        {loading && runs.length === 0 ? (
          <p className="text-sm text-zinc-500">読み込み中…</p>
        ) : runs.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-600">解析履歴がありません。</p>
            <Link
              href="/analysis/new"
              className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
            >
              解析を開始
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">ステータス</th>
                  <th className="px-3 py-2 text-left">ケース</th>
                  <th className="px-3 py-2 text-left">参照</th>
                  <th className="px-3 py-2 text-left">作成</th>
                  <th className="px-3 py-2 text-left">完了</th>
                  <th className="px-3 py-2 text-right">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {runs.map((run) => {
                  const refName = run.referenceDataset?.name ?? "—";
                  const refVersion = run.referenceDataset?.version ?? "—";
                  const caseNumber = run.inputJson?.metadata?.caseNumber ?? "—";
                  const analystName = run.inputJson?.metadata?.analystName ?? "—";
                  const elementSampled = run.inputJson?.metadata?.elementSampled ?? "—";

                  return (
                    <tr key={run.id} className="text-zinc-800">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={run.status} />
                          {run.status === "failed" && run.errorMessage ? (
                            <span className="text-xs text-red-600">error</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{caseNumber}</div>
                        <div className="text-xs text-zinc-500">
                          {analystName} / {elementSampled}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{refName}</div>
                        <div className="text-xs text-zinc-500">ver: {refVersion}</div>
                      </td>
                      <td className="px-3 py-3">{formatDate(run.createdAt)}</td>
                      <td className="px-3 py-3">{formatDate(run.finishedAt)}</td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/analysis/${run.id}`}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs hover:bg-zinc-50"
                        >
                          開く
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}