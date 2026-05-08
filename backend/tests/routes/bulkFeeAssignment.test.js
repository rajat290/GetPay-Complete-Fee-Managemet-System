const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const feeRoutes = require("../../routes/feeRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");

const app = express();
app.use(express.json());
app.use("/api/fees", feeRoutes);

describe("Bulk fee assignment", () => {
  let institution;
  let adminToken;
  let fee;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

    institution = await Institution.create({
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

    await Student.create([
      {
        institutionId: institution._id,
        name: "Student One",
        email: "one@example.com",
        password: "password",
        registrationNo: "STD001",
        className: "10A",
        role: "student"
      },
      {
        institutionId: institution._id,
        name: "Student Two",
        email: "two@example.com",
        password: "password",
        registrationNo: "STD002",
        className: "10A",
        role: "student"
      },
      {
        institutionId: institution._id,
        name: "Student Three",
        email: "three@example.com",
        password: "password",
        registrationNo: "STD003",
        className: "11A",
        role: "student"
      }
    ]);

    fee = await Fee.create({
      institutionId: institution._id,
      title: "Tuition Fee",
      amount: 1000,
      category: "Tuition",
      dueDate: new Date("2026-12-31")
    });

    await FeeAssignment.init();
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  it("assigns a fee to every student in a class", async () => {
    const response = await request(app)
      .post("/api/fees/assign-bulk")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        feeId: fee._id,
        dueDate: "2026-12-31",
        className: "10A"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("matchedStudents", 2);
    expect(response.body).toHaveProperty("createdCount", 2);
    expect(response.body).toHaveProperty("skippedCount", 0);
    expect(await FeeAssignment.countDocuments({ institutionId: institution._id, feeId: fee._id })).toBe(2);
  });

  it("skips assignments that already exist", async () => {
    await request(app)
      .post("/api/fees/assign-bulk")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        feeId: fee._id,
        dueDate: "2026-12-31",
        className: "10A"
      });

    const response = await request(app)
      .post("/api/fees/assign-bulk")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        feeId: fee._id,
        dueDate: "2026-12-31",
        className: "10A"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("matchedStudents", 2);
    expect(response.body).toHaveProperty("createdCount", 0);
    expect(response.body).toHaveProperty("skippedCount", 2);
    expect(await FeeAssignment.countDocuments({ institutionId: institution._id, feeId: fee._id })).toBe(2);
  });

  it("requires either className or studentIds", async () => {
    const response = await request(app)
      .post("/api/fees/assign-bulk")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        feeId: fee._id,
        dueDate: "2026-12-31"
      });

    expect(response.status).toBe(400);
  });
});
