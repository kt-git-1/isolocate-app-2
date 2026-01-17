"use server";

import { listAnalysisRunsUseCase } from "@/features/analysisRuns/usecases/listAnalysisRunsUseCase";

export async function listAnalysisRunsAction(take: number) {
  return await listAnalysisRunsUseCase(take);
}