import { NextResponse } from "next/server";
import { getAnalysisRunUseCase } from "@/features/analysisRuns/usecases/getAnalysisRunUseCase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { message: "id is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getAnalysisRunUseCase(id);
    if (!result) {
      return NextResponse.json(
        { message: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
