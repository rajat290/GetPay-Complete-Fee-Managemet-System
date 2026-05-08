const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const ReminderCampaign = require("../../models/ReminderCampaign");
const Notification = require("../../models/Notification");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("reminder campaigns", () => {
  let institution;
  let admin;
  let student;
  let fee;
  let assignment;
  let token;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Campaign Institution",
      code: "CAMPAIGN"
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
      className: "10A",
      role: "student"
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
      dueDate: new Date("2026-01-31"),
      status: "overdue"
    });

    token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  it("creates, lists, previews, and runs a saved reminder campaign", async () => {
    const createRes = await request(app)
      .post("/api/admin/reminder-campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Weekly overdue reminders",
        channel: "notification",
        className: "10A",
        status: "overdue",
        dueBeforeDays: 30
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe("Weekly overdue reminders");

    const listRes = await request(app)
      .get("/api/admin/reminder-campaigns")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const previewRes = await request(app)
      .post(`/api/admin/reminder-campaigns/${createRes.body._id}/run`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dryRun: true });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.summary.matchedCount).toBe(1);
    expect(await Notification.countDocuments()).toBe(0);

    const runRes = await request(app)
      .post(`/api/admin/reminder-campaigns/${createRes.body._id}/run`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dryRun: false });

    expect(runRes.status).toBe(201);
    expect(runRes.body.summary.notificationCount).toBe(1);

    const campaign = await ReminderCampaign.findById(createRes.body._id);
    expect(campaign.runCount).toBe(1);
    expect(campaign.lastRunAt).toBeTruthy();

    const notification = await Notification.findOne({ studentId: student._id });
    expect(notification.message).toContain("Tuition Fee");

    const auditLog = await AuditLog.findOne({ action: "reminder_campaign.ran" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.metadata.notificationCount).toBe(1);
    expect(assignment.status).toBe("overdue");
  });

  it("blocks inactive campaigns from running but allows preview", async () => {
    const campaign = await ReminderCampaign.create({
      institutionId: institution._id,
      name: "Paused campaign",
      channel: "notification",
      filters: {
        status: "overdue",
        className: "10A",
        dueBeforeDays: 30
      },
      isActive: false,
      createdBy: admin._id
    });

    const previewRes = await request(app)
      .post(`/api/admin/reminder-campaigns/${campaign._id}/run`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dryRun: true });

    expect(previewRes.status).toBe(200);

    const runRes = await request(app)
      .post(`/api/admin/reminder-campaigns/${campaign._id}/run`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dryRun: false });

    expect(runRes.status).toBe(409);
  });
});
