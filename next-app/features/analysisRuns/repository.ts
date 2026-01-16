import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

/**
 * AnalysisRun を作成
 */
export async function createAnalysisRun(args: {
  referenceDatasetId: string;
  inputJson: Prisma.InputJsonValue; // ← Prisma JSON型に合わせる
  algorithmVersion?: string | null;
  modelVersion?: string | null;
}) {
  return prisma.analysisRun.create({
    data: {
      referenceDataset: { connect: { id: args.referenceDatasetId } },
      inputJson: args.inputJson,
      algorithmVersion: args.algorithmVersion ?? null,
      modelVersion: args.modelVersion ?? null,
      status: "queued",
    },
    include: { referenceDataset: true },
  });
}

/**
 * AnalysisRun を取得
 */
export async function getAnalysisRunById(id: string) {
  return prisma.analysisRun.findUnique({
    where: { id },
    include: { referenceDataset: true },
  });
}

/**
 * ReferenceDataset を取得
 */
export async function findReferenceDatasetByNameVersion(
  name: string,
  version: string
) {
  return prisma.referenceDataset.findUnique({
    where: { name_version: { name, version } },
  });
}

export async function listAnalysisRuns(take: number) {
  return prisma.analysisRun.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { referenceDataset: true },
  });
}
