import { app } from "./app";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`${signal} received, shutting down`);

  // Stop accepting connections, then drain the DB pool.
  server.close((err) => {
    if (err) logger.error({ err }, "Error closing HTTP server");
  });

  try {
    await prisma.$disconnect();
  } catch (err) {
    logger.error({ err }, "Error disconnecting Prisma");
  }

  process.exit(0);
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => void shutdown(signal));
}

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection");
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  void shutdown("uncaughtException");
});
