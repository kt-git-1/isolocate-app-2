import { AnalysisInputs } from "@/features/analysisRuns/domain/types";
import { resolveReferenceDataset } from "@/features/analysisRuns/domain/referenceDatasetResolver";
import {
  createAnalysisRun,
  findReferenceDatasetByNameVersion,
} from "@/features/analysisRuns/repository";

export async function createAnalysisRunUseCase(input: AnalysisInputs) {
    const datasetInfo = resolveReferenceDataset(input);
  
    const referenceDataset =
      await findReferenceDatasetByNameVersion(
        datasetInfo.name,
        datasetInfo.version
      );
  
    if (!referenceDataset) {
      throw new Error("ReferenceDatasetNotFound");
    }
  
    return createAnalysisRun({
      referenceDatasetId: referenceDataset.id,
      inputJson: input,
    });
  }
  