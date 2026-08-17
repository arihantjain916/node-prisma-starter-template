import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Dummy values so the Zod env schema validates without a real .env or DB.
    env: {
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: "mysql://test:test@localhost:3306/test",
      DATABASE_HOST: "localhost",
      DATABASE_PORT: "3306",
      DATABASE_USER: "test",
      DATABASE_PASSWORD: "test",
      DATABASE_NAME: "test",
    },
  },
});
