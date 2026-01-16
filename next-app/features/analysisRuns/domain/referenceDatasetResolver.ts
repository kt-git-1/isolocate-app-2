import { AnalysisInputs, ReferenceSampleId } from "./types";

const DATASET_LOOKUP: Record<ReferenceSampleId, { name: string; version: string }> = {
  "png-modern-2026-01": {
    name: "png-modern",
    version: "2026-01",
  },
};

export function resolveReferenceDataset(input: AnalysisInputs) {
  return DATASET_LOOKUP[input.comparison.referenceSample];
}