-- Align PostgreSQL with the existing Prisma schema (modules M01–M10).
-- Additive follow-up to 20260923120000_init. Does not replace that migration.

-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('TEXT', 'FILE', 'URL', 'TEXT_AND_FILE', 'TEXT_AND_URL', 'NONE');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('QUIZ', 'MCQ', 'OBJECTIVE');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED');

-- ActivityStatus: DRAFT/OPEN/CLOSED -> DRAFT/PUBLISHED/CLOSED/ARCHIVED
CREATE TYPE "ActivityStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
ALTER TABLE "Activity" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Activity" ALTER COLUMN "status" TYPE "ActivityStatus_new" USING (
  CASE "status"::text
    WHEN 'OPEN' THEN 'PUBLISHED'
    ELSE "status"::text
  END::"ActivityStatus_new"
);
ALTER TYPE "ActivityStatus" RENAME TO "ActivityStatus_old";
ALTER TYPE "ActivityStatus_new" RENAME TO "ActivityStatus";
DROP TYPE "ActivityStatus_old";
ALTER TABLE "Activity" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- ActivityType: PRACTICAL/TASK mapped to PRACTICAL_TASK/EXERCISE
CREATE TYPE "ActivityType_new" AS ENUM ('ASSIGNMENT', 'PRACTICAL_TASK', 'PROJECT', 'SURVEY', 'EXERCISE', 'RESOURCE_BASED');
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING (
  CASE "type"::text
    WHEN 'PRACTICAL' THEN 'PRACTICAL_TASK'
    WHEN 'TASK' THEN 'EXERCISE'
    ELSE "type"::text
  END::"ActivityType_new"
);
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "ActivityType_old";

ALTER TYPE "MaterialType" ADD VALUE 'IMAGE';
ALTER TYPE "MaterialType" ADD VALUE 'OTHER';

CREATE TYPE "QuestionType_new" AS ENUM ('MCQ_SINGLE');
ALTER TABLE "AssessmentQuestion" ALTER COLUMN "type" TYPE "QuestionType_new" USING ('MCQ_SINGLE'::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";

ALTER TYPE "WorkshopStatus" ADD VALUE 'REGISTRATION_OPEN';
ALTER TYPE "WorkshopStatus" ADD VALUE 'REGISTRATION_CLOSED';
ALTER TYPE "WorkshopStatus" ADD VALUE 'ONGOING';

ALTER TABLE "AssessmentSubmission" DROP CONSTRAINT "AssessmentSubmission_assessmentId_fkey";
ALTER TABLE "AssessmentSubmission" DROP CONSTRAINT "AssessmentSubmission_userId_fkey";
DROP TABLE "AssessmentSubmission";

CREATE TYPE "SubmissionStatus_new" AS ENUM ('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'RETURNED', 'LATE');
DROP TYPE "SubmissionStatus";
ALTER TYPE "SubmissionStatus_new" RENAME TO "SubmissionStatus";

DROP INDEX "Attendance_sessionId_userId_key";

ALTER TABLE "Activity" ADD COLUMN "instructions" TEXT,
ADD COLUMN "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "maxScore" INTEGER,
ADD COLUMN "resourceUrl" TEXT,
ADD COLUMN "sessionId" TEXT,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "submissionType" "SubmissionType" NOT NULL DEFAULT 'NONE',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "ActivitySubmission" DROP COLUMN "content",
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "feedback" TEXT,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "fileUrl" TEXT,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedBy" TEXT,
ADD COLUMN "score" INTEGER,
ADD COLUMN "status" "SubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "submissionUrl" TEXT,
ADD COLUMN "textContent" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "submittedAt" DROP NOT NULL,
ALTER COLUMN "submittedAt" DROP DEFAULT;

ALTER TABLE "Assessment" ADD COLUMN "dueAt" TIMESTAMP(3),
ADD COLUMN "durationMinutes" INTEGER,
ADD COLUMN "instructions" TEXT,
ADD COLUMN "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "sessionId" TEXT,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "type" "AssessmentType" NOT NULL DEFAULT 'QUIZ',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "AssessmentQuestion" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "explanation" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Attendance" ADD COLUMN "registrationId" TEXT NOT NULL;

ALTER TABLE "LearningMaterial" ADD COLUMN "description" TEXT,
ADD COLUMN "durationSeconds" INTEGER,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "status" "MaterialStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Registration" ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Workshop" ADD COLUMN "bannerImage" TEXT,
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "certificateEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "location" TEXT,
ADD COLUMN "organizationId" TEXT,
ADD COLUMN "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "slug" TEXT NOT NULL,
ADD COLUMN "trainerProfile" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "domain" DROP NOT NULL,
ALTER COLUMN "level" DROP NOT NULL,
ALTER COLUMN "trainerName" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "durationHours" DROP NOT NULL,
ALTER COLUMN "mode" DROP NOT NULL,
ALTER COLUMN "capacity" DROP NOT NULL,
ALTER COLUMN "registrationDeadline" DROP NOT NULL,
ALTER COLUMN "language" DROP NOT NULL;

ALTER TABLE "WorkshopSession" ADD COLUMN "meetingProvider" TEXT,
ADD COLUMN "mode" "DeliveryMode",
ADD COLUMN "sessionNumber" INTEGER;

CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER,
    "maxScore" INTEGER,
    "percentage" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionIndex" INTEGER,
    "isCorrect" BOOLEAN,
    "marksAwarded" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAnswer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AssessmentAttempt_assessmentId_idx" ON "AssessmentAttempt"("assessmentId");
CREATE INDEX "AssessmentAttempt_userId_idx" ON "AssessmentAttempt"("userId");
CREATE UNIQUE INDEX "AssessmentAttempt_assessmentId_userId_attemptNumber_key" ON "AssessmentAttempt"("assessmentId", "userId", "attemptNumber");
CREATE INDEX "AssessmentAnswer_attemptId_idx" ON "AssessmentAnswer"("attemptId");
CREATE INDEX "AssessmentAnswer_questionId_idx" ON "AssessmentAnswer"("questionId");
CREATE UNIQUE INDEX "AssessmentAnswer_attemptId_questionId_key" ON "AssessmentAnswer"("attemptId", "questionId");
CREATE INDEX "Activity_sessionId_idx" ON "Activity"("sessionId");
CREATE INDEX "ActivitySubmission_userId_idx" ON "ActivitySubmission"("userId");
CREATE UNIQUE INDEX "Attendance_sessionId_registrationId_key" ON "Attendance"("sessionId", "registrationId");
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");
CREATE UNIQUE INDEX "Workshop_slug_key" ON "Workshop"("slug");
CREATE INDEX "Workshop_slug_idx" ON "Workshop"("slug");
CREATE INDEX "Workshop_organizationId_idx" ON "Workshop"("organizationId");

ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AssessmentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
