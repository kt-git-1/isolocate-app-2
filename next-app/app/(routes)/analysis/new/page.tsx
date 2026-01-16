"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  AnalysisInputs,
  AnalysisInputsForm,
} from "@/features/analysisRuns/domain/types";

import { createAnalysisRunAction } from "@/app/(routes)/analysis/new/actions";

import { ComparisonSidebar } from "@/components/ComparisonSidebar";
import { MetadataFields } from "@/components/MetadataFields";
import { IsotopeInputsCard } from "@/components/IsotopeInputsCard";
import { ErrorBanner } from "@/components/ErrorBanner";

const initialInputs: AnalysisInputsForm = {
  metadata: {
    caseNumber: "",
    analystName: "",
    elementSampled: "",
  },
  comparison: {
    referenceSample: "png-modern-2026-01",
    numberOfGroups: "two",
    classifier: "lda",
    stepwise: "none",
    populations: [],
  },
  isotopeInputs: {
    collagen: { col13c: "", col15n: "", col34s: "" },
    apatite: { a13c: "", a18o: "" },
    enamel: { e13c: "", e18o: "" },
  },
};

const toNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function InputPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AnalysisInputsForm>(initialInputs);

  const updateForm = (patch: Partial<AnalysisInputsForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const buildInputs = (): AnalysisInputs => ({
    metadata: form.metadata,
    comparison: form.comparison,
    isotopeInputs: {
      collagen: {
        col13c: toNumber(form.isotopeInputs.collagen.col13c),
        col15n: toNumber(form.isotopeInputs.collagen.col15n),
        col34s: toNumber(form.isotopeInputs.collagen.col34s),
      },
      apatite: {
        a13c: toNumber(form.isotopeInputs.apatite.a13c),
        a18o: toNumber(form.isotopeInputs.apatite.a18o),
      },
      enamel: {
        e13c: toNumber(form.isotopeInputs.enamel.e13c),
        e18o: toNumber(form.isotopeInputs.enamel.e18o),
      },
    },
  });

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createAnalysisRunAction(buildInputs());
      if (!result || "error" in result) {
        setError(result?.error ?? "保存に失敗しました。");
        return;
      }
      router.push(`/analysis/${result.id}`);
    });
  };

  return (
    <div className="mx-auto w-full max-w-8xl px-6 py-8">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ComparisonSidebar
            value={form.comparison}
            onChange={(next) => updateForm({ comparison: next })}
            onEvaluate={handleSubmit}
            loading={isPending}
        />

        <section className="space-y-8">
          <MetadataFields
            value={form.metadata}
            onChange={(next) => updateForm({ metadata: next })}
          />

          <IsotopeInputsCard
            value={form.isotopeInputs}
            onChange={(next) => updateForm({ isotopeInputs: next })}
          />

          <ErrorBanner message={error} />
        </section>
      </div>
    </div>
  );
}
