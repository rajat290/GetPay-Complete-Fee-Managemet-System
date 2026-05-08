const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const adminRoutes = require("../../routes/adminRoutes");
const feeRoutes = require("../../routes/feeRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/fees", feeRoutes);

describe("student ledger routes", () => {
  let adminToken;
  let studentToken;
  let student;

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

    student = await Student.create({
      institutionId: institution._id,
      name: "Student User",
      email: "student@example.com",
      password: "password",
      registrationNo: "STD001",
      className: "10A",
      role: "student"
    });

    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
    studentToken = jwt.sign({ id: student._id, role: student.role }, process.env.JWT_SECRET);
  });

  it("allows admins to read a student ledger", async () => {
    const response = await request(app)
      .get(`/api/admin/students/${student._id}/ledger`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.student).toHaveProperty("registrationNo", "STD001");
    expect(response.body).toHaveProperty("summary");
  });

  it("allows students to read their own ledger", async () => {
    const response = await request(app)
      .get("/api/fees/my-ledger")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.student).toHaveProperty("registrationNo", "STD001");
    expect(response.body).toHaveProperty("rows");
  });
});
