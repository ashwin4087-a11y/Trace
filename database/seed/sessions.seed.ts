import { prisma } from "./client";

export async function seedSessions(workshopId: string) {
  const count = await prisma.workshopSession.count({ where: { workshopId } });
  if (count > 0) return;
  const day = new Date();
  day.setDate(day.getDate() + 7);
  day.setHours(10, 0, 0, 0);
  const titles = ["Shell and filesystem", "Users, permissions, and processes"];
  for (let index = 0; index < titles.length; index += 1) {
    const start = new Date(day);
    start.setDate(day.getDate() + index);
    const end = new Date(start);
    end.setHours(start.getHours() + 3);
    await prisma.workshopSession.create({
      data: {
        workshopId,
        title: titles[index],
        sessionDate: start,
        startTime: start,
        endTime: end,
        trainerName: "Meena Organizer",
        meetingUrl: "https://meet.google.com/aurex-linux-demo",
        status: "SCHEDULED",
      },
    });
  }
}
