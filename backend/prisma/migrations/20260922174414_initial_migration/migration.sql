/*
  Warnings:

  - A unique constraint covering the columns `[testRunId,testCaseId]` on the table `TestResult` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TestResult" ADD COLUMN     "failureAnalysis" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_testRunId_testCaseId_key" ON "TestResult"("testRunId", "testCaseId");
