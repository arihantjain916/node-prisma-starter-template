import pino from "pino";
import { env, isProduction } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  // Structured JSON in production; human-readable locally.
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss" },
      },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
    ],
    censor: "[redacted]",
  },
});
