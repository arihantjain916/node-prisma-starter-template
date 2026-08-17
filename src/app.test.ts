import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./app";

describe("app", () => {
  it("returns a welcome payload at the root", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Welcome" });
  });

  it("reports health", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found.", status: false });
  });

  it("sets security headers from helmet", async () => {
    const res = await request(app).get("/");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
