const request = require("supertest");
const express = require("express");
const validateRequest = require("../../middleware/validateRequest");

const app = express();
app.use(express.json());
app.post(
  "/test",
  validateRequest({
    body: {
      email: { required: true, type: "email" },
      amount: { required: true, type: "number" }
    }
  }),
  (req, res) => res.status(200).json({ ok: true })
);

describe("validateRequest middleware", () => {
  it("returns validation details for invalid input", async () => {
    const response = await request(app)
      .post("/test")
      .send({ email: "not-an-email", amount: "abc" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Validation failed");
    expect(response.body.details).toHaveLength(2);
  });

  it("allows valid input", async () => {
    const response = await request(app)
      .post("/test")
      .send({ email: "test@example.com", amount: "100" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
