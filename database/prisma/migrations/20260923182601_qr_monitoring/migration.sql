/*
  Warnings:

  - You are about to drop the column `targetId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `certificateDefaults` on the `PlatformSetting` table. All the data in the column will be lost.
  - You are about to drop the column `notificationDefaults` on the `PlatformSetting` table. All the data in the column will be lost.
  - You are about to drop the column `registrationSettings` on the `PlatformSetting` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MonitoringStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'TERMINATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TerminationReason" AS ENUM ('FULLSCREEN_VIOLATION', 'SESSION_ENDED', 'USER_EXITED', 'TIMEOUT', 'ORGANIZER_TERMINATED', 'TECHNICAL');

-- DropIndex
DROP INDEX "AuditLog_status_createdAt_idx";

-- DropIndex
DROP INDEX "AuditLog_targetType_targetId_idx";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ActivitySubmission" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AssessmentQuestion" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LearningMaterial" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PlatformSetting" DROP COLUMN "certificateDefaults",
DROP COLUMN "notificationDefaults",
DROP COLUMN "registrationSettings";

-- CreateTable
CREATE TABLE "PersonalQrToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalQrToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceMonitoringSession" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "status" "MonitoringStatus" NOT NULL DEFAULT 'ACTIVE',
    "terminationReason" "TerminationReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceMonitoringSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalQrToken_tokenHash_key" ON "PersonalQrToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PersonalQrToken_sessionId_userId_idx" ON "PersonalQrToken"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceMonitoringSession_attendanceId_key" ON "AttendanceMonitoringSession"("attendanceId");

-- CreateIndex
CREATE INDEX "AttendanceMonitoringSession_sessionId_idx" ON "AttendanceMonitoringSession"("sessionId");

-- CreateIndex
CREATE INDEX "AttendanceMonitoringSession_userId_idx" ON "AttendanceMonitoringSession"("userId");

-- AddForeignKey
ALTER TABLE "PersonalQrToken" ADD CONSTRAINT "PersonalQrToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalQrToken" ADD CONSTRAINT "PersonalQrToken_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalQrToken" ADD CONSTRAINT "PersonalQrToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceMonitoringSession" ADD CONSTRAINT "AttendanceMonitoringSession_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceMonitoringSession" ADD CONSTRAINT "AttendanceMonitoringSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceMonitoringSession" ADD CONSTRAINT "AttendanceMonitoringSession_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceMonitoringSession" ADD CONSTRAINT "AttendanceMonitoringSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
