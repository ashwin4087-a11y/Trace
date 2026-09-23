-- CreateEnum
CREATE TYPE "AttendanceMonitoringMode" AS ENUM ('HEARTBEAT', 'STRICT_FOCUS');

-- CreateEnum
CREATE TYPE "AttendanceLiveSessionStatus" AS ENUM ('ACTIVE', 'ENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AttendanceLiveEventType" AS ENUM ('CHECK_IN', 'HEARTBEAT', 'TAB_HIDDEN', 'TAB_VISIBLE', 'WINDOW_BLUR', 'WINDOW_FOCUS', 'FULLSCREEN_ENTER', 'FULLSCREEN_EXIT', 'IDLE_START', 'IDLE_END', 'TAKEOVER', 'IDENTITY_FLAG', 'CHECK_OUT');

-- CreateEnum
CREATE TYPE "AttendanceComputationStatus" AS ENUM ('PENDING', 'COMPLETED', 'INSUFFICIENT', 'ABSENT');

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "attendanceRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attendanceThresholdPercent" INTEGER NOT NULL DEFAULT 75,
ADD COLUMN     "endGraceMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "heartbeatIntervalSeconds" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "joinWindowMinutesBefore" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "monitoringMode" "AttendanceMonitoringMode" NOT NULL DEFAULT 'HEARTBEAT';

-- AlterTable
ALTER TABLE "WorkshopSession" ADD COLUMN     "meetingPasscode" TEXT;

-- CreateTable
CREATE TABLE "AttendanceAccessToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "workshopSessionId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "redeemedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLiveSession" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "workshopSessionId" TEXT NOT NULL,
    "sessionCookieHash" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "lastHeartbeatAt" TIMESTAMP(3),
    "status" "AttendanceLiveSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "consentAcceptedAt" TIMESTAMP(3),
    "deviceFingerprintHash" TEXT,

    CONSTRAINT "AttendanceLiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLiveEvent" (
    "id" TEXT NOT NULL,
    "attendanceLiveSessionId" TEXT NOT NULL,
    "clientEventId" TEXT NOT NULL,
    "type" "AttendanceLiveEventType" NOT NULL,
    "serverTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientTime" TIMESTAMP(3),
    "meta" JSONB,

    CONSTRAINT "AttendanceLiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceComputation" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "workshopSessionId" TEXT NOT NULL,
    "presentSeconds" INTEGER NOT NULL,
    "awaySeconds" INTEGER NOT NULL,
    "scheduledSeconds" INTEGER NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "status" "AttendanceComputationStatus" NOT NULL,
    "certificateEligible" BOOLEAN NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overriddenBy" TEXT,
    "overrideReason" TEXT,
    "overriddenAt" TIMESTAMP(3),

    CONSTRAINT "AttendanceComputation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttendanceAccessToken_tokenHash_key" ON "AttendanceAccessToken"("tokenHash");
CREATE UNIQUE INDEX "AttendanceLiveSession_active_registration_session_key"
ON "AttendanceLiveSession"("registrationId", "workshopSessionId")
WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "AttendanceAccessToken_registrationId_workshopSessionId_idx" ON "AttendanceAccessToken"("registrationId", "workshopSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceLiveSession_sessionCookieHash_key" ON "AttendanceLiveSession"("sessionCookieHash");

-- CreateIndex
CREATE INDEX "AttendanceLiveSession_registrationId_workshopSessionId_idx" ON "AttendanceLiveSession"("registrationId", "workshopSessionId");

-- CreateIndex
CREATE INDEX "AttendanceLiveEvent_attendanceLiveSessionId_serverTime_idx" ON "AttendanceLiveEvent"("attendanceLiveSessionId", "serverTime");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceLiveEvent_attendanceLiveSessionId_clientEventId_key" ON "AttendanceLiveEvent"("attendanceLiveSessionId", "clientEventId");

-- CreateIndex
CREATE INDEX "AttendanceComputation_registrationId_idx" ON "AttendanceComputation"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceComputation_registrationId_workshopSessionId_key" ON "AttendanceComputation"("registrationId", "workshopSessionId");

-- AddForeignKey
ALTER TABLE "AttendanceAccessToken" ADD CONSTRAINT "AttendanceAccessToken_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAccessToken" ADD CONSTRAINT "AttendanceAccessToken_workshopSessionId_fkey" FOREIGN KEY ("workshopSessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLiveSession" ADD CONSTRAINT "AttendanceLiveSession_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLiveSession" ADD CONSTRAINT "AttendanceLiveSession_workshopSessionId_fkey" FOREIGN KEY ("workshopSessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLiveEvent" ADD CONSTRAINT "AttendanceLiveEvent_attendanceLiveSessionId_fkey" FOREIGN KEY ("attendanceLiveSessionId") REFERENCES "AttendanceLiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceComputation" ADD CONSTRAINT "AttendanceComputation_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceComputation" ADD CONSTRAINT "AttendanceComputation_workshopSessionId_fkey" FOREIGN KEY ("workshopSessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
