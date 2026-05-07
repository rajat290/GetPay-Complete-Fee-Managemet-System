const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const Payment = require("../../models/Payment");
const PaymentEvent = require("../../models/PaymentEvent");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("Admin offline payments", () => {
  let institution;
  let admin;
  let student;
  let fee;
  let assignment;
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

    student = await Student.create({
      institutionId: institution._id,
      name: "Student User",
      email: "student@example.com",
      password: "password",
      registrationNo: "STD001",
      className: "10A",
      role: "student"
    });

    fee = await Fee.create({
      institutionId: institution._id,
      title: "Tuition Fee",
      amount: 1500,
      category: "Tuition",
      dueDate: new Date("2026-12-31")
    });

    assignment = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: student._id,
      feeId: fee._id,
      dueDate: new Date("2026-12-31"),
      status: "pending"
    });

    token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  it("records an offline payment and marks assignment paid", async () => {
    const response = await request(app)
      .post("/api/admin/payments/offline")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId: student._id,
        assignmentId: assignment._id,
        amount: 1500,
        mode: "cash",
        referenceNo: "CASH-001",
        notes: "Collected at office"
      });

    const updatedAssignment = await FeeAssignment.findById(assignment._id);
    const payment = await Payment.findById(response.body._id);
    const event = await PaymentEvent.findOne({ paymentId: payment._id });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("mode", "cash");
    expect(updatedAssignment.status).toBe("paid");
    expect(payment.gateway).toBe("manual");
    expect(payment.collectedBy.toString()).toBe(admin._id.toString());
    expect(event.eventType).toBe("manual.payment.recorded");
  });

  it("rejects amount mismatches", async () => {
    const response = await request(app)
      .post("/api/admin/payments/offline")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId: student._id,
        assignmentId: assignment._id,
        amount: 1200,
        mode: "cash"
      });

    expect(response.status).toBe(400);
  });

  it("prevents recording payment twice for the same assignment", async () => {
    await request(app)
      .post("/api/admin/payments/offline")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId: student._id,
        assignmentId: assignment._id,
        amount: 1500,
        mode: "cash"
      });

    const response = await request(app)
      .post("/api/admin/payments/offline")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId: student._id,
        assignmentId: assignment._id,
        amount: 1500,
        mode: "cash"
      });

    expect(response.status).toBe(409);
    expect(await Payment.countDocuments({ assignmentId: assignment._id })).toBe(1);
  });
});
