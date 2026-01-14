-- CreateEnum
CREATE TYPE "AnalysisRunStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'canceled');

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "status" "AnalysisRunStatus" NOT NULL DEFAULT 'queued',
    "referenceDatasetId" TEXT NOT NULL,
    "inputJson" JSONB NOT NULL,
    "resultJson" JSONB,
    "errorMessage" TEXT,
    "algorithmVersion" TEXT,
    "modelVersion" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "lockToken" TEXT,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceDataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "storageUri" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceDataset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceDataset_name_version_key" ON "ReferenceDataset"("name", "version");

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_referenceDatasetId_fkey" FOREIGN KEY ("referenceDatasetId") REFERENCES "ReferenceDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
