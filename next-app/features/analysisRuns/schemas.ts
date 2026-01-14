import { z } from "zod";

/**
 * UIの入力JSON（inputJson）をバリデーションするZod Schema
 * - 未入力を許す数値は nullable
 */
export const inputJsonSchema = z.object({
  meta: z.object({
    caseNumber: z.string().min(1).optional(),     // ひとまずJSON内で保持
    analystName: z.string().min(1).optional(),
    targetElementsLabel: z.string().min(1).optional(),
  }),
  parameters: z.object({
    compareGroupCount: z.enum(["2", "3plus"]).optional(), // UIに合わせて拡張OK
    classificationMethod: z.enum(["lda", "logistic", "svm"]).optional(),
    stepwise: z.enum(["none", "forward", "backward", "both"]).optional(),
    populations: z
      .array(
        z.enum([
          "asia",
          "japan",
          "northeast_asia",
          "southeast_asia",
          "ubc_vancouver",
          "america",
        ])
      )
      .default([]),
  }),
  measurements: z.object({
    collagen: z
      .object({
        d13C: z.number().nullable().optional(),
        d15N: z.number().nullable().optional(),
        d34S: z.number().nullable().optional(),
      })
      .optional(),
    apatite: z
      .object({
        d13C: z.number().nullable().optional(),
        d18O: z.number().nullable().optional(),
      })
      .optional(),
    enamel: z
      .object({
        d13C: z.number().nullable().optional(),
        d18O: z.number().nullable().optional(),
      })
      .optional(),
  }),
});

export type InputJson = z.infer<typeof inputJsonSchema>;

/**
 * resultJson のZod Schema（MVP版）
 */
export const resultJsonSchema = z.object({
  summary: z.object({
    predictedGroup: z.string(),
    predictedLabel: z.string().optional(),
    probability: z.number().min(0).max(1).optional(),
    decision: z.enum(["likely", "uncertain", "unlikely"]).optional(),
  }),
  scores: z
    .array(
      z.object({
        group: z.string(),
        label: z.string().optional(),
        score: z.number(),
      })
    )
    .optional(),
  model: z
    .object({
      classificationMethod: z.string().optional(),
      stepwise: z.string().optional(),
      compareGroupCount: z.string().optional(),
      algorithmVersion: z.string().optional(),
      modelVersion: z.string().optional(),
    })
    .optional(),
  featuresUsed: z.array(z.string()).optional(),
  qc: z
    .object({
      missingFields: z.array(z.string()).optional(),
      warnings: z.array(z.string()).optional(),
      isValidForRun: z.boolean().optional(),
    })
    .optional(),
  artifacts: z
    .object({
      plotPaths: z.array(z.string()).optional(),
      rawOutputPath: z.string().optional(),
    })
    .optional(),
});

export type ResultJson = z.infer<typeof resultJsonSchema>;
