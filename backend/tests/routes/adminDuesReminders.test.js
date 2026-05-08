const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const Notification = require("../../models/Notification");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("admin dues reminders", () => {
  let institution;
  let admin;
  let token;
  let student;
  let fee;
  let assignment;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Reminder Institution",
      code: "REMIND"
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
      registrationNo: "STU001",
      className: "10A"
    });

    fee = await Fee.create({
      institutionId: institution._id,
      title: "Tuition Fee",
      amount: 1000,
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

  it("previews reminder recipients without creating notifications", async () => {
    const res = await request(app)
      .post("/api/admin/dues/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        className: "10A",
        status: "pending",
        channel: "notification",
        dryRun: true
      });

    expect(res.status).toBe(200);
    expect(res.body.summary).toMatchObject({
      matchedCount: 1,
      notificationCount: 0,
      dryRun: true
    });
    expect(res.body.recipients[0]).toMatchObject({
      studentName: "Student User",
      feeTitle: "Tuition Fee",
      dueAmount: 1000
    });
    expect(await Notification.countDocuments()).toBe(0);
    expect(await AuditLog.countDocuments({ action: "dues.reminders_previewed" })).toBe(1);
  });

  it("creates student notifications for due reminders", async () => {
    const res = await request(app)
      .post("/api/admin/dues/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        className: "10A",
        status: "pending",
        channel: "notification"
      });

    expect(res.status).toBe(201);
    expect(res.body.summary.notificationCount).toBe(1);

    const notification = await Notification.findOne({
      institutionId: institution._id,
      studentId: student._id,
      relatedFee: assignment._id
    });

    expect(notification).toBeTruthy();
    expect(notification.title).toBe("Fee payment reminder");
    expect(notification.message).toContain("Tuition Fee");

    const auditLog = await AuditLog.findOne({ action: "dues.reminders_sent" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.metadata.notificationCount).toBe(1);
  });

  it("honors class filters when sending reminders", async () => {
    await Student.create({
      institutionId: institution._id,
      name: "Other Student",
      email: "other@example.com",
      password: "password",
      registrationNo: "STU002",
      className: "11A"
    });

    const res = await request(app)
      .post("/api/admin/dues/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        className: "11A",
        status: "pending",
        channel: "notification"
      });

    expect(res.status).toBe(201);
    expect(res.body.summary.matchedCount).toBe(0);
    expect(await Notification.countDocuments()).toBe(0);
  });
});
