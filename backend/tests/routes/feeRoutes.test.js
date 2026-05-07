const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const feeRoutes = require("../../routes/feeRoutes");
const Fee = require("../../models/Fee");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

const app = express();
app.use(express.json());
app.use("/api/fees", feeRoutes);

describe("Fee Routes", () => {
  let institution;
  let admin;
  let token;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });

    admin = await Student.create({
      institutionId: institution._id,
      name: "Admin User",
      email: "admin@example.com",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  describe("GET /api/fees", () => {
    it("returns fees for the authenticated admin institution", async () => {
      await Fee.create({
        institutionId: institution._id,
        title: "Tuition Fee",
        amount: 1000,
        category: "Tuition",
        dueDate: new Date("2026-12-31")
      });

      const response = await request(app)
        .get("/api/fees")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty("title", "Tuition Fee");
    });
  });

  describe("POST /api/fees/create", () => {
    it("creates a new institution-scoped fee", async () => {
      const response = await request(app)
        .post("/api/fees/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Library Fee",
          amount: 200,
          category: "Other",
          dueDate: "2026-12-31"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("title", "Library Fee");
      expect(response.body).toHaveProperty("institutionId", institution._id.toString());
    });

    it("does not create fee without required fields", async () => {
      const response = await request(app)
        .post("/api/fees/create")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
