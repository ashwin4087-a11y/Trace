import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const [sessions, regs] = await Promise.all([
  p.workshopSession.findMany({
    where: { status: "LIVE" },
    select: { id: true, title: true, status: true, workshopId: true }
  }),
  p.registration.findMany({
    where: { user: { email: "participant@aurex.local" } },
    select: { status: true, workshopId: true }
  })
]);

console.log("=== LIVE sessions ===");
console.log(JSON.stringify(sessions, null, 2));
console.log("\n=== participant@aurex.local registrations ===");
console.log(JSON.stringify(regs, null, 2));

await p.$disconnect();
