import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { env, repoRoot } from "./config/environment";
import { apiRateLimit } from "./middleware/rate-limit.middleware";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { activityRouter } from "./modules/activities/activity.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";
import { announcementRouter } from "./modules/announcements/announcement.routes";
import { assessmentRouter } from "./modules/assessments/assessment.routes";
import { attendanceRouter } from "./modules/attendance/attendance.routes";
import { auditRouter } from "./modules/audit/audit.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { certificateRouter } from "./modules/certificates/certificate.routes";
import { checkoutRouter } from "./modules/checkout/checkout.routes";
import { communityRouter } from "./modules/communities/community.routes";
import { departmentRouter } from "./modules/departments/department.routes";
import { learningRouter } from "./modules/learning/learning.routes";
import { learningPathRouter } from "./modules/learning-paths/learning-path.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";
import { organizationRouter } from "./modules/organizations/organization.routes";
import { organizerRouter } from "./modules/organizers/organizer.routes";
import { paymentRouter } from "./modules/payments/payment.routes";
import { permissionRouter } from "./modules/permissions/permission.routes";
import { profileRouter } from "./modules/profiles/profile.routes";
import { recommendationRouter } from "./modules/recommendations/recommendation.routes";
import { registrationRouter } from "./modules/registrations/registration.routes";
import { reportRouter } from "./modules/reports/report.routes";
import { roleRouter } from "./modules/roles/role.routes";
import { sessionRouter } from "./modules/sessions/session.routes";
import { settingsRouter } from "./modules/settings/settings.routes";
import { skillRouter } from "./modules/skills/skill.routes";
import { userRouter } from "./modules/users/user.routes";
import { workshopRouter } from "./modules/workshops/workshop.routes";
import { checkDatabase } from "./config/database";
import { checkRedis } from "./config/redis";
import { isMaintenanceMode } from "./modules/settings/settings.service";
import { ApiError } from "./shared/errors/api-error";

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(repoRoot, "public", "uploads")));
  app.use("/certificates", express.static(path.join(repoRoot, "public", "certificates")));

  app.get("/api/health", async (_req, res) => {
    const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
    res.status(database ? 200 : 503).json({
      success: database,
      data: { service: "aurex-lms-api", database, redis },
    });
  });

  app.use(apiRateLimit);
  app.use(async (req, _res, next) => {
    if (
      req.path.startsWith("/api/health") ||
      req.path.startsWith("/api/auth") ||
      req.path.startsWith("/api/settings") ||
      req.path.startsWith("/api/certificates/verify")
    ) {
      next();
      return;
    }
    const maintenance = await isMaintenanceMode();
    if (!maintenance) {
      next();
      return;
    }
    const roleHeader = req.headers.authorization;
    if (roleHeader && req.path.startsWith("/api/admin")) {
      next();
      return;
    }
    next(new ApiError(503, "MAINTENANCE", "The platform is temporarily unavailable"));
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/roles", roleRouter);
  app.use("/api/permissions", permissionRouter);
  app.use("/api/organizations", organizationRouter);
  app.use("/api/organizers", organizerRouter);
  app.use("/api/departments", departmentRouter);
  app.use("/api/profiles", profileRouter);
  app.use("/api/workshops", workshopRouter);
  app.use("/api/registrations", registrationRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/sessions", sessionRouter);
  app.use("/api/learning", learningRouter);
  app.use("/api/activities", activityRouter);
  app.use("/api/assessments", assessmentRouter);
  app.use("/api/attendance", attendanceRouter);
  app.use("/api/certificates", certificateRouter);
  app.use("/api/announcements", announcementRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/recommendations", recommendationRouter);
  app.use("/api/communities", communityRouter);
  app.use("/api/learning-paths", learningPathRouter);
  app.use("/api/skills", skillRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/audit", auditRouter);
  app.use("/api/settings", settingsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
