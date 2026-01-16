"use server";

import { createAnalysisRunUseCase } from "@/features/analysisRuns/usecases/createAnalysisRunUseCase";
import { inputJsonSchema } from "@/features/analysisRuns/schemas";
import { AnalysisInputs } from "@/features/analysisRuns/domain/types";

export async function createAnalysisRunAction(input: AnalysisInputs) {
  const parsed = inputJsonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "...", issues: parsed.error.issues };
  }

  const run = await createAnalysisRunUseCase(parsed.data);
  return { id: run.id };
}