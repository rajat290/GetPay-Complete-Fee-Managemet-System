const request = require("supertest");
const express = require("express");
const { requestContext } = require("../../middleware/requestContextMiddleware");
const { health, live, ready, buildReadinessPayload } = require("../../controllers/healthController");

const createApp = () => {
  const app = express();
  app.use(requestContext);
  app.get("/api/health", health);
  app.get("/api/health/live", live);
  app.get("/api/health/ready", ready);
  return app;
};

describe("health controller", () => {
  it("returns liveness without requiring database readiness", async () => {
    const res = await request(createApp()).get("/api/health/live");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("alive");
    expect(res.body.requestId).toBeTruthy();
  });

  it("returns readiness details for connected dependencies", async () => {
    const res = await request(createApp()).get("/api/health/ready");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
    expect(res.body.checks.database.ok).toBe(true);
  });

  it("returns not_ready when database is disconnected", async () => {
    const payload = buildReadinessPayload(
      { requestId: "req_test_disconnected" },
      { state: "disconnected", ok: false }
    );

    expect(payload.statusCode).toBe(503);
    expect(payload.body.status).toBe("not_ready");
    expect(payload.body.checks.database.ok).toBe(false);
  });
});
