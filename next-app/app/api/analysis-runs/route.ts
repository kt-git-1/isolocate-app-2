import { createAnalysisRunRequestSchema } from "@/features/analysisRuns/dto";
import { createAnalysisRunFromRequestUseCase } from "@/features/analysisRuns/usecases/createAnalysisRunFromRequestUseCase";
import { listAnalysisRunsUseCase } from "@/features/analysisRuns/usecases/listAnalysisRunsUseCase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createAnalysisRunRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "リクエスト形式が不正です", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { referenceDatasetId, inputJson, algorithmVersion, modelVersion } = parsed.data;

  const run = await createAnalysisRunFromRequestUseCase({
    referenceDatasetId,
    inputJson,
    algorithmVersion,
    modelVersion,
  });

  return NextResponse.json(run, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? "20"), 100);

  const runs = await listAnalysisRunsUseCase(take);

  return NextResponse.json(runs);
}