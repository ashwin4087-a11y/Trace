import dotenv from "dotenv";
import path from "node:path";
import { prisma } from "./client";
import { seedAccessControl, seedLearningPath } from "./demo.seed";
import { seedOrganizations } from "./organizations.seed";
import { seedSessions } from "./sessions.seed";
import { seedProfile, seedUsers } from "./users.seed";
import { seedWorkshop } from "./workshops.seed";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  const passwords = {
    admin: process.env.SEED_ADMIN_PASSWORD || "",
    organizer: process.env.SEED_ORGANIZER_PASSWORD || "",
    participant: process.env.SEED_PARTICIPANT_PASSWORD || "",
  };
  if (!passwords.admin || !passwords.organizer || !passwords.participant) {
    throw new Error("Set SEED_ADMIN_PASSWORD, SEED_ORGANIZER_PASSWORD, and SEED_PARTICIPANT_PASSWORD before seeding.");
  }

  await seedAccessControl();
  const users = await seedUsers(passwords);
  await seedProfile(users.participant.id, "ENGINEERING", "TA");
  const org = await seedOrganizations(users.organizer.id, users.participant.id);
  const workshop = await seedWorkshop(users.organizer.id, org.department.id);
  await seedSessions(workshop.id);
  await seedLearningPath(workshop.id);
  console.info("Seed completed.");
  console.info(`Admin: ${process.env.SEED_ADMIN_EMAIL || "admin@aurex.local"}`);
  console.info(`Organizer: ${process.env.SEED_ORGANIZER_EMAIL || "organizer@aurex.local"}`);
  console.info(`Participant: ${process.env.SEED_PARTICIPANT_EMAIL || "participant@aurex.local"}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
