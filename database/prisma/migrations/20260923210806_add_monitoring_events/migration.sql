-- CreateTable
CREATE TABLE "MonitoringEvent" (
    "id" TEXT NOT NULL,
    "monitoringSessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "clientTime" TIMESTAMP(3),
    "serverTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringEvent_monitoringSessionId_serverTime_idx" ON "MonitoringEvent"("monitoringSessionId", "serverTime");

-- AddForeignKey
ALTER TABLE "MonitoringEvent" ADD CONSTRAINT "MonitoringEvent_monitoringSessionId_fkey" FOREIGN KEY ("monitoringSessionId") REFERENCES "AttendanceMonitoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
