import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // body例:
  // {
  //   "referenceDatasetId": "...",
  //   "inputJson": { ...UI入力... },
  //   "algorithmVersion": "lda_v1",
  //   "modelVersion": "modern_png_2026-01"
  // }

  const { referenceDatasetId, inputJson, algorithmVersion, modelVersion } = body ?? {};

  if (!referenceDatasetId || !inputJson) {
    return NextResponse.json({ error: "referenceDatasetId と inputJson は必須です" }, { status: 400 });
  }

  const run = await prisma.analysisRun.create({
    data: {
      referenceDatasetId,
      inputJson,
      algorithmVersion: algorithmVersion ?? null,
      modelVersion: modelVersion ?? null,
      status: "queued",
    },
  });

  return NextResponse.json(run, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? "20"), 100);

  const runs = await prisma.analysisRun.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      referenceDataset: true,
    },
  });

  return NextResponse.json(runs);
}