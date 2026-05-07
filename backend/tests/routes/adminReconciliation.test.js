const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("Admin reconciliation route", () => {
  let token;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

    const institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });

    const admin = await Student.create({
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

  it("returns reconciliation report for admins", async () => {
    const response = await request(app)
      .get("/api/admin/payments/reconciliation")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("summary");
    expect(response.body).toHaveProperty("rows");
  });
});
