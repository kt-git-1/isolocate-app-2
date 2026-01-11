import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const job = await prisma.analysisRun.create({
    data: {
      status: "queued",
      inputJson: body, // 例: 同位体入力など
      referenceDatasetId: body.referenceDatasetId,
    },
    select: { id: true, status: true, createdAt: true },
  });

  return NextResponse.json(job, { status: 201 });
}