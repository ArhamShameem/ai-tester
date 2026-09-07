-- CreateTable
CREATE TABLE "ApplicationAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationAnalysis_projectId_idx" ON "ApplicationAnalysis"("projectId");

-- AddForeignKey
ALTER TABLE "ApplicationAnalysis" ADD CONSTRAINT "ApplicationAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
