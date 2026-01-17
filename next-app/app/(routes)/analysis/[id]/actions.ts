"use server";

import { getAnalysisRunUseCase } from "@/features/analysisRuns/usecases/getAnalysisRunUseCase";

export async function getAnalysisRunAction(id: string) {
  return await getAnalysisRunUseCase(id);
}