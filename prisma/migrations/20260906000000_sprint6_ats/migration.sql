-- AlterTable
ALTER TABLE "Usage" ADD COLUMN     "atsAnalysisCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AtsAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cvId" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'CV',
    "title" TEXT NOT NULL DEFAULT 'CV Check',
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "jobDescription" TEXT NOT NULL DEFAULT '',
    "score" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtsAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AtsAnalysis_userId_idx" ON "AtsAnalysis"("userId");

-- CreateIndex
CREATE INDEX "AtsAnalysis_cvId_idx" ON "AtsAnalysis"("cvId");

-- CreateIndex
CREATE INDEX "AtsAnalysis_createdAt_idx" ON "AtsAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "AtsAnalysis" ADD CONSTRAINT "AtsAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtsAnalysis" ADD CONSTRAINT "AtsAnalysis_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE SET NULL ON UPDATE CASCADE;
