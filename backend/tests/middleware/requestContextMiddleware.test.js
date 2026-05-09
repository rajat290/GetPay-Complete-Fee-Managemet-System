const express = require("express");
const request = require("supertest");
const { requestContext } = require("../../middleware/requestContextMiddleware");

describe("request context middleware", () => {
  it("uses incoming request id and returns it in the response header", async () => {
    const app = express();
    app.use(requestContext);
    app.get("/ping", (req, res) => {
      res.json({ requestId: req.requestId });
    });

    const res = await request(app)
      .get("/ping")
      .set("x-request-id", "req_test_123");

    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBe("req_test_123");
    expect(res.body.requestId).toBe("req_test_123");
  });

  it("generates a request id when one is not provided", async () => {
    const app = express();
    app.use(requestContext);
    app.get("/ping", (req, res) => {
      res.json({ requestId: req.requestId });
    });

    const res = await request(app).get("/ping");

    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBeTruthy();
    expect(res.body.requestId).toBe(res.headers["x-request-id"]);
  });
});
