import { createApp } from "./app";
import { env } from "./config/environment";
import { prisma } from "./config/database";
import { startNotificationWorker } from "./jobs/notification.job";
import { registerWorkshopEngagement } from "./modules/notifications/workshop-engagement.subscriber";

registerWorkshopEngagement();

const app = createApp();

const server = app.listen(env.port, () => {
  console.info(`AUREX LMS API listening on ${env.backendUrl}`);
  void startNotificationWorker();
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
