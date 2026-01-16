import { AnalysisRun, ReferenceDataset } from "@/lib/generated/prisma";
import { AnalysisRunResponse } from "./dto";
import { inputJsonSchema, resultJsonSchema } from "./schemas";

/**
 * Prismaのinclude結果型
 */
export type AnalysisRunWithRef = AnalysisRun & {
  referenceDataset: ReferenceDataset;
};

/**
 * Entity → Response DTO
 */
export function mapAnalysisRunToResponse(
  run: AnalysisRunWithRef
): AnalysisRunResponse {
  return {
    id: run.id,
    status: run.status,

    referenceDataset: {
      id: run.referenceDataset.id,
      name: run.referenceDataset.name,
      version: run.referenceDataset.version,
      description: run.referenceDataset.description ?? null,
      storageUri: run.referenceDataset.storageUri,
      isActive: run.referenceDataset.isActive,
    },

    inputJson: inputJsonSchema.parse(run.inputJson),
    resultJson: resultJsonSchema.nullable().parse(run.resultJson),
    errorMessage: run.errorMessage ?? null,

    algorithmVersion: run.algorithmVersion ?? null,
    modelVersion: run.modelVersion ?? null,

    startedAt: run.startedAt?.toISOString() ?? null,
    finishedAt: run.finishedAt?.toISOString() ?? null,

    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
  };
}
