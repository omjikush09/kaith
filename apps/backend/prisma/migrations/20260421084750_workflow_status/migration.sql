-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- Backfill from legacy flow.status
UPDATE "workflows"
SET "status" = "flow"->>'status'
WHERE "flow" ? 'status' AND "flow"->>'status' IN ('active', 'draft', 'error');

-- CreateIndex
CREATE INDEX "workflows_userId_status_idx" ON "workflows"("userId", "status");
