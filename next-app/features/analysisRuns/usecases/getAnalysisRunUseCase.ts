import { getAnalysisRunById } from "@/features/analysisRuns/repository";
import {
  analysisRunResponseSchema,
  type AnalysisRunResponse,
} from "@/features/analysisRuns/dto";

export async function getAnalysisRunUseCase(
  id: string
): Promise<AnalysisRunResponse | null> {
  const run = await getAnalysisRunById(id);
  if (!run) {
    return null;
  }

  return analysisRunResponseSchema.parse({
    id: run.id,
    status: run.status,
    referenceDataset: run.referenceDataset,
    inputJson: run.inputJson,
    resultJson: run.resultJson,
    errorMessage: run.errorMessage,
    algorithmVersion: run.algorithmVersion,
    modelVersion: run.modelVersion,
    startedAt: run.startedAt?.toISOString() ?? null,
    finishedAt: run.finishedAt?.toISOString() ?? null,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
  });
}
