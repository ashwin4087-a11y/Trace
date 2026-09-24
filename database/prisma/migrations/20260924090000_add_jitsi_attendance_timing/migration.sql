ALTER TABLE "WorkshopSession" ADD COLUMN "jitsiRoomName" TEXT;

CREATE UNIQUE INDEX "WorkshopSession_jitsiRoomName_key" ON "WorkshopSession"("jitsiRoomName");

ALTER TABLE "Attendance" ADD COLUMN "joinedAt" TIMESTAMP(3);
ALTER TABLE "Attendance" ADD COLUMN "finalizedAt" TIMESTAMP(3);
ALTER TABLE "Attendance" ADD COLUMN "durationSeconds" INTEGER;
