-- Module 2: Database and identity foundation

ALTER TYPE "UserRole" RENAME TO "RoleName";
ALTER TYPE "AccountStatus" ADD VALUE 'DEACTIVATED';
ALTER TYPE "AcademicDomain" ADD VALUE 'INTERDISCIPLINARY';

CREATE TYPE "AcademicPreferredLanguage" AS ENUM ('ENGLISH', 'TAMIL', 'TAMIL_ENGLISH');
CREATE TYPE "AcademicYear" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH', 'POSTGRADUATE', 'WORKING_PROFESSIONAL', 'OTHER');
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

ALTER TABLE "User"
  ADD COLUMN "name" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "UserRole" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Organization"
  ADD COLUMN "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE "Department"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "status" "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE "OrganizationMember" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "departmentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AcademicProfile"
  ADD COLUMN "preferredLanguage" "AcademicPreferredLanguage" NOT NULL DEFAULT 'ENGLISH',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "AcademicProfile"
  ALTER COLUMN "year" TYPE "AcademicYear"
  USING CASE "year"
    WHEN 1 THEN 'FIRST'::"AcademicYear"
    WHEN 2 THEN 'SECOND'::"AcademicYear"
    WHEN 3 THEN 'THIRD'::"AcademicYear"
    WHEN 4 THEN 'FOURTH'::"AcademicYear"
    WHEN 5 THEN 'POSTGRADUATE'::"AcademicYear"
    WHEN 6 THEN 'WORKING_PROFESSIONAL'::"AcademicYear"
    ELSE NULL
  END;

ALTER TABLE "AuditLog"
  ADD COLUMN "targetType" TEXT,
  ADD COLUMN "targetId" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SUCCESS';

ALTER TABLE "PlatformSetting"
  ADD COLUMN "registrationSettings" JSONB,
  ADD COLUMN "certificateDefaults" JSONB,
  ADD COLUMN "notificationDefaults" JSONB;

CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userId_expiresAt_idx" ON "UserSession"("userId", "expiresAt");
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");
CREATE UNIQUE INDEX "Department_organizationId_name_key" ON "Department"("organizationId", "name");
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");
CREATE INDEX "OrganizationMember_departmentId_idx" ON "OrganizationMember"("departmentId");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX "AuditLog_status_createdAt_idx" ON "AuditLog"("status", "createdAt");

ALTER TABLE "UserRole"
  ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSession"
  ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMember"
  ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "OrganizationMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
