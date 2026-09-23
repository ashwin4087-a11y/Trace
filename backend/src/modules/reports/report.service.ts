import { prisma } from "../../config/database";

function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const text = value === null || value === undefined ? "" : String(value);
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export async function registrationReport(workshopId?: string) {
  const rows = await prisma.registration.findMany({
    where: workshopId ? { workshopId } : undefined,
    include: { user: true, workshop: true },
  });
  return csv(
    rows.map((row) => ({
      workshop: row.workshop.title,
      email: row.user.email,
      name: `${row.user.firstName} ${row.user.lastName}`,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    })),
  );
}

export async function attendanceReport(workshopId?: string) {
  const rows = await prisma.attendance.findMany({
    where: workshopId ? { session: { workshopId } } : undefined,
    include: { user: true, session: { include: { workshop: true } } },
  });
  return csv(
    rows.map((row) => ({
      workshop: row.session.workshop.title,
      session: row.session.title,
      email: row.user.email,
      status: row.status,
      method: row.method,
      recordedAt: row.recordedAt.toISOString(),
    })),
  );
}

export async function certificateReport() {
  const rows = await prisma.certificate.findMany({ include: { user: true, workshop: true } });
  return csv(
    rows.map((row) => ({
      code: row.certificateCode,
      workshop: row.workshop.title,
      email: row.user.email,
      attendance: row.attendancePercentage,
      status: row.status,
      issuedAt: row.issuedAt.toISOString(),
    })),
  );
}

export async function workshopReport() {
  const rows = await prisma.workshop.findMany({ include: { organizer: true, _count: { select: { registrations: true } } } });
  return csv(
    rows.map((row) => ({
      title: row.title,
      status: row.status,
      organizer: row.organizer.email,
      capacity: row.capacity,
      registrations: row._count.registrations,
      domain: row.domain,
      language: row.language,
    })),
  );
}

export async function organizerReport() {
  const rows = await prisma.user.findMany({
    where: { role: "ORGANIZER" },
    include: { _count: { select: { organizedWorkshops: true } } },
  });
  return csv(
    rows.map((row) => ({
      email: row.email,
      name: `${row.firstName} ${row.lastName}`,
      status: row.status,
      workshops: row._count.organizedWorkshops,
    })),
  );
}

export async function engagementReport() {
  const rows = await prisma.analyticsEvent.groupBy({ by: ["type"], _count: { type: true } });
  return csv(rows.map((row) => ({ type: row.type, count: row._count.type })));
}
