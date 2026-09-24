import { prisma } from "../../config/database";
import { calculateAttendancePercentage } from "../../shared/utils/attendance";

export async function participantAnalytics(userId: string) {
  const [registrations, certificates, skills, paths] = await Promise.all([
    prisma.registration.findMany({ where: { userId }, include: { workshop: { include: { sessions: true } } } }),
    prisma.certificate.count({ where: { userId, status: "ISSUED" } }),
    prisma.userSkill.count({ where: { userId } }),
    prisma.learningPathEnrollment.count({ where: { userId } }),
  ]);
  const attendance = await Promise.all(
    registrations.map(async (registration) => {
      const total = registration.workshop.sessions.filter((session) => session.status !== "CANCELLED").length;
      const attended = await prisma.attendance.count({
        where: {
          userId,
          status: "PRESENT",
          session: { workshopId: registration.workshopId, status: { not: "CANCELLED" } },
        },
      });
      return {
        workshopId: registration.workshopId,
        title: registration.workshop.title,
        percentage: calculateAttendancePercentage(attended, total),
      };
    }),
  );
  return {
    workshopsRegistered: registrations.length,
    workshopsCompleted: certificates,
    certificates,
    skills,
    learningPaths: paths,
    attendance,
  };
}

export async function organizerAnalytics(organizerId: string, workshopId?: string) {
  const workshops = await prisma.workshop.findMany({ 
    where: { 
      organizerId,
      ...(workshopId ? { id: workshopId } : {})
    }, 
    select: { id: true } 
  });
  const ids = workshops.map((item) => item.id);
  const [registrations, certificates, submissions] = await Promise.all([
    prisma.registration.count({ where: { workshopId: { in: ids }, status: "CONFIRMED" } }),
    prisma.certificate.count({ where: { workshopId: { in: ids }, status: "ISSUED" } }),
    prisma.assessmentAttempt.findMany({ where: { assessment: { workshopId: { in: ids } }, status: "SUBMITTED" } }),
  ]);
  const attendanceRows = await prisma.attendance.count({
    where: { status: "PRESENT", session: { workshopId: { in: ids } } },
  });
  const averageScore = submissions.length
    ? submissions.reduce((sum: number, item: any) => sum + (item.maxScore ? (item.score / item.maxScore) * 100 : 0), 0) /
      submissions.length
    : 0;
  return {
    workshops: ids.length,
    registrations,
    attendanceMarks: attendanceRows,
    certificatesIssued: certificates,
    averageAssessmentPercent: Math.round(averageScore * 100) / 100,
  };
}

export async function platformAnalytics() {
  const [
    totalUsers,
    activeUsers,
    totalOrganizers,
    totalWorkshops,
    totalSessions,
    totalEnrollments,
    certificatesIssued,
    attendanceCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.workshop.count(),
    prisma.workshopSession.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.certificate.count({ where: { status: "ISSUED" } }),
    prisma.attendance.count({ where: { status: "PRESENT" } }),
  ]);

  // Rough estimation of attendance rate across the platform
  const attendanceRate = totalEnrollments > 0 ? Math.round((attendanceCount / totalEnrollments) * 100) : 0;

  return { 
    totalUsers, 
    activeUsers, 
    totalOrganizers, 
    totalWorkshops, 
    totalSessions, 
    totalEnrollments, 
    certificatesIssued,
    attendanceRate 
  };
}
