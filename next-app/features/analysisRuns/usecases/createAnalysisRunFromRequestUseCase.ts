import {
  analysisRunResponseSchema,
  type AnalysisRunResponse,
  type CreateAnalysisRunRequest,
} from "@/features/analysisRuns/dto";
import { createAnalysisRun } from "@/features/analysisRuns/repository";

export async function createAnalysisRunFromRequestUseCase(
  request: CreateAnalysisRunRequest
): Promise<AnalysisRunResponse> {
  const run = await createAnalysisRun({
    referenceDatasetId: request.referenceDatasetId,
    inputJson: request.inputJson,
    algorithmVersion: request.algorithmVersion ?? null,
    modelVersion: request.modelVersion ?? null,
  });

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
