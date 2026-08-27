-- CreateTable
CREATE TABLE "ExportEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cvId" TEXT,
    "template" TEXT NOT NULL DEFAULT 'classic',
    "type" TEXT NOT NULL DEFAULT 'PDF_DOWNLOAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportEvent_userId_idx" ON "ExportEvent"("userId");

-- CreateIndex
CREATE INDEX "ExportEvent_cvId_idx" ON "ExportEvent"("cvId");

-- AddForeignKey
ALTER TABLE "ExportEvent" ADD CONSTRAINT "ExportEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportEvent" ADD CONSTRAINT "ExportEvent_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE SET NULL ON UPDATE CASCADE;
