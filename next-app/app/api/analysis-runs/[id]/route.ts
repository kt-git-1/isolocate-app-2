import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = await prisma.analysisRun.findUnique({
    where: { id: params.id },
  });

  if (!job) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}