-- Manual rollback for 20260923192905_attendance_verification_foundation.
-- Prisma does not execute down.sql automatically.

DROP INDEX IF EXISTS "AttendanceLiveSession_active_registration_session_key";
DROP INDEX IF EXISTS "AttendanceComputation_registrationId_workshopSessionId_key";
DROP INDEX IF EXISTS "AttendanceComputation_registrationId_idx";
DROP INDEX IF EXISTS "AttendanceLiveEvent_attendanceLiveSessionId_clientEventId_key";
DROP INDEX IF EXISTS "AttendanceLiveEvent_attendanceLiveSessionId_serverTime_idx";
DROP INDEX IF EXISTS "AttendanceLiveSession_registrationId_workshopSessionId_idx";
DROP INDEX IF EXISTS "AttendanceLiveSession_sessionCookieHash_key";
DROP INDEX IF EXISTS "AttendanceAccessToken_registrationId_workshopSessionId_idx";
DROP INDEX IF EXISTS "AttendanceAccessToken_tokenHash_key";

ALTER TABLE IF EXISTS "AttendanceComputation" DROP CONSTRAINT IF EXISTS "AttendanceComputation_registrationId_fkey";
ALTER TABLE IF EXISTS "AttendanceComputation" DROP CONSTRAINT IF EXISTS "AttendanceComputation_workshopSessionId_fkey";
ALTER TABLE IF EXISTS "AttendanceLiveEvent" DROP CONSTRAINT IF EXISTS "AttendanceLiveEvent_attendanceLiveSessionId_fkey";
ALTER TABLE IF EXISTS "AttendanceLiveSession" DROP CONSTRAINT IF EXISTS "AttendanceLiveSession_registrationId_fkey";
ALTER TABLE IF EXISTS "AttendanceLiveSession" DROP CONSTRAINT IF EXISTS "AttendanceLiveSession_workshopSessionId_fkey";
ALTER TABLE IF EXISTS "AttendanceAccessToken" DROP CONSTRAINT IF EXISTS "AttendanceAccessToken_registrationId_fkey";
ALTER TABLE IF EXISTS "AttendanceAccessToken" DROP CONSTRAINT IF EXISTS "AttendanceAccessToken_workshopSessionId_fkey";

DROP TABLE IF EXISTS "AttendanceComputation" CASCADE;
DROP TABLE IF EXISTS "AttendanceLiveEvent" CASCADE;
DROP TABLE IF EXISTS "AttendanceLiveSession" CASCADE;
DROP TABLE IF EXISTS "AttendanceAccessToken" CASCADE;

ALTER TABLE IF EXISTS "WorkshopSession" DROP COLUMN IF EXISTS "meetingPasscode";
ALTER TABLE IF EXISTS "Workshop"
  DROP COLUMN IF EXISTS "attendanceRequired",
  DROP COLUMN IF EXISTS "attendanceThresholdPercent",
  DROP COLUMN IF EXISTS "monitoringMode",
  DROP COLUMN IF EXISTS "heartbeatIntervalSeconds",
  DROP COLUMN IF EXISTS "joinWindowMinutesBefore",
  DROP COLUMN IF EXISTS "endGraceMinutes";

DROP TYPE IF EXISTS "AttendanceComputationStatus";
DROP TYPE IF EXISTS "AttendanceLiveEventType";
DROP TYPE IF EXISTS "AttendanceLiveSessionStatus";
DROP TYPE IF EXISTS "AttendanceMonitoringMode";
