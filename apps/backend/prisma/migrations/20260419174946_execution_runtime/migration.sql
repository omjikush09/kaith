/*
  Warnings:

  - Added the required column `nodeId` to the `steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "executions" ADD COLUMN     "error" TEXT,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "steps" ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "nodeId" TEXT NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "executions_workflowId_status_idx" ON "executions"("workflowId", "status");

-- CreateIndex
CREATE INDEX "steps_executionId_index_idx" ON "steps"("executionId", "index");
