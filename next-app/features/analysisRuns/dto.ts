import { z } from "zod";
import { inputJsonSchema, resultJsonSchema } from "./schemas";

/**
 * POST /api/analysis-runs のRequest DTO
 */
export const createAnalysisRunRequestSchema = z.object({
  referenceDatasetId: z.string().cuid(),
  inputJson: inputJsonSchema,
  algorithmVersion: z.string().min(1).optional(),
  modelVersion: z.string().min(1).optional(),
});

export type CreateAnalysisRunRequest = z.infer<
  typeof createAnalysisRunRequestSchema
>;

/**
 * APIで返すResponse DTO（DBの生の型をそのまま返さない方針）
 */
export const analysisRunResponseSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["queued", "running", "succeeded", "failed", "canceled"]),
  referenceDataset: z.object({
    id: z.string().cuid(),
    name: z.string(),
    version: z.string(),
    description: z.string().nullable().optional(),
    storageUri: z.string(),
    isActive: z.boolean(),
  }),
  inputJson: inputJsonSchema,
  resultJson: resultJsonSchema.nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  algorithmVersion: z.string().nullable().optional(),
  modelVersion: z.string().nullable().optional(),
  startedAt: z.string().datetime().nullable().optional(),
  finishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AnalysisRunResponse = z.infer<typeof analysisRunResponseSchema>;
