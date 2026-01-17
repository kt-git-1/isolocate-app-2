import {
  analysisRunResponseSchema,
  type AnalysisRunResponse,
} from "@/features/analysisRuns/dto";
import { listAnalysisRuns } from "@/features/analysisRuns/repository";

export async function listAnalysisRunsUseCase(
  take: number
): Promise<AnalysisRunResponse[]> {
  const runs = await listAnalysisRuns(take);

  return runs.map((run) =>
    analysisRunResponseSchema.parse({
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
    })
  );
}
