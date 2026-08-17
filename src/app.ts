import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { HttpError, NotFoundError } from "./lib/errors";
// import authRoutes from "./routes/auth.router";

export const app = express();

app.disable("x-powered-by");

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
  }),
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Welcome" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Unmatched routes: hand a 404 to the error handler below.
app.use((_req, _res, next: NextFunction) => {
  next(new NotFoundError());
});

app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const status = err instanceof HttpError ? err.status : 500;
    const message =
      err instanceof HttpError
        ? err.message
        : env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err instanceof Error
            ? err.message
            : "Internal Server Error";

    // Client errors are noise at error level; server errors are not.
    if (status >= 500) {
      req.log.error({ err }, "Unhandled request error");
    }

    res.status(status).json({ message, status: false });
  },
);
