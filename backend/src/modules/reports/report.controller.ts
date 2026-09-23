import type { Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { ApiError } from "../../shared/errors/api-error";
import * as reports from "./report.service";

const builders = {
  registrations: reports.registrationReport,
  attendance: reports.attendanceReport,
  certificates: reports.certificateReport,
  workshops: reports.workshopReport,
  organizers: reports.organizerReport,
  engagement: reports.engagementReport,
};

export const csv = asyncHandler(async (req, res: Response) => {
  const name = String(req.params.name).replace(/\.csv$/, "") as keyof typeof builders;
  const builder = builders[name];
  if (!builder) throw new ApiError(404, "NOT_FOUND", "Unknown report");
  const workshopId = typeof req.query.workshopId === "string" ? req.query.workshopId : undefined;
  const body =
    name === "registrations"
      ? await reports.registrationReport(workshopId)
      : name === "attendance"
        ? await reports.attendanceReport(workshopId)
        : await builder();
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${name}.csv"`);
  res.send(body);
});
