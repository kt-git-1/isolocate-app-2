"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AnalysisRunResponse } from "@/features/analysisRuns/dto";
import { AnalysisRunInputSection } from "@/components/AnalysisRunInputSection";
import { AnalysisRunResultSection } from "@/components/AnalysisRunResultSection";
import { AnalysisRunSummaryCard } from "@/components/AnalysisRunSummaryCard";
import { getAnalysisRunAction } from "./actions";

export default function AnalysisRunPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id;

  const [data, setData] = useState<AnalysisRunResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [polling, setPolling] = useState<boolean>(true);

  async function fetchRun() {
    if (!id) return;
    setErr(null);

    try {
      const result = await getAnalysisRunAction(id);
      if (!result) {
        setErr("指定された解析IDが見つかりませんでした。");
        setData(null);
        return;
      }
      setData(result);

      // 終了したらポーリング停止
      if (result.status === "succeeded" || result.status === "failed") {
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
    setLoading(true);
    fetchRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ポーリング（queued/running の間）
  useEffect(() => {
    if (!id) return;
    if (!polling) return;

    const timer = setInterval(() => {
      fetchRun();
    }, 2000);

    return () => {
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

      <AnalysisRunSummaryCard data={data} polling={polling} />

      <div className="mt-6 grid grid-cols-1 gap-6">
        <AnalysisRunInputSection data={data} loading={loading} />
        <AnalysisRunResultSection data={data} />
      </div>

      <div className="mt-8 text-xs text-zinc-500">
        表示が更新されない場合は「更新」ボタンを押してください。
      </div>
    </main>
  );
}
