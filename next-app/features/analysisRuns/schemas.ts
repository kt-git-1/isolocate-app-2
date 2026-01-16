import { z } from "zod";
import { REFERENCE_SAMPLES } from "./domain/types";

const popGroupSchema = z.enum(["Asian", "Japan", "NEA", "SEA", "UBC", "US"]);
const classifierSchema = z.enum(["lda", "logit", "rf"]);
const groupCountSchema = z.enum(["two", "more2"]);
const stepwiseSchema = z.enum(["none", "forward", "backward"]);

const metadataSchema = z.object({
  caseNumber: z.string().min(1),
  analystName: z.string().min(1),
  elementSampled: z.string().min(1),
});

const comparisonParametersSchema = z.object({
  referenceSample: z.enum(REFERENCE_SAMPLES),
  numberOfGroups: groupCountSchema,
  classifier: classifierSchema,
  stepwise: stepwiseSchema,
  populations: z.array(popGroupSchema),
});

const isotopeInputsSchema = z.object({
  collagen: z.object({
    col13c: z.number(),
    col15n: z.number(),
    col34s: z.number(),
  }),
  apatite: z.object({
    a13c: z.number(),
    a18o: z.number(),
  }),
  enamel: z.object({
    e13c: z.number(),
    e18o: z.number(),
  }),
});

/**
 * UIの入力JSON（inputJson）をバリデーションするZod Schema
 */
export const inputJsonSchema = z.object({
  metadata: metadataSchema,
  comparison: comparisonParametersSchema,
  isotopeInputs: isotopeInputsSchema,
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
