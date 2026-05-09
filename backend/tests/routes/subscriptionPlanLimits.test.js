const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const authRoutes = require("../../routes/authRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const ReminderCampaign = require("../../models/ReminderCampaign");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

describe("subscription plan limits", () => {
  let institution;
  let admin;
  let token;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Plan Limited College",
      code: "PLANLIMIT",
      subscription: {
        plan: "starter",
        status: "trialing"
      }
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

  it("returns subscription usage and limits in institution settings", async () => {
    await Student.create({
      institutionId: institution._id,
      name: "Student User",
      email: "student@example.com",
      password: "password",
      registrationNo: "STU001",
      className: "10A",
      role: "student"
    });

    const res = await request(app)
      .get("/api/admin/institution")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.subscriptionSummary).toMatchObject({
      subscription: {
        plan: "starter",
        planName: "Starter",
        status: "trialing"
      },
      limits: {
        students: 500,
        admins: 2,
        reminderCampaigns: 3
      },
      usage: {
        students: 1,
        admins: 1,
        reminderCampaigns: 0
      }
    });
  });

  it("blocks student registration when the plan student limit is reached", async () => {
    const students = Array.from({ length: 500 }, (_, index) => ({
      institutionId: institution._id,
      name: `Student ${index + 1}`,
      email: `student${index + 1}@example.com`,
      password: "password",
      registrationNo: `STU${String(index + 1).padStart(3, "0")}`,
      className: "10A",
      role: "student"
    }));

    await Student.insertMany(students);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        institutionCode: "PLANLIMIT",
        name: "Blocked Student",
        email: "blocked@example.com",
        password: "password",
        registrationNo: "BLOCKED001",
        className: "10A"
      });

    expect(res.status).toBe(402);
    expect(res.body.error).toBe("Student limit reached for Starter plan");
    expect(res.body.details).toMatchObject({
      plan: "starter",
      limit: 500,
      used: 500
    });
  });

  it("blocks saved reminder campaigns when the plan campaign limit is reached", async () => {
    await ReminderCampaign.create([
      { institutionId: institution._id, name: "Campaign 1", createdBy: admin._id },
      { institutionId: institution._id, name: "Campaign 2", createdBy: admin._id },
      { institutionId: institution._id, name: "Campaign 3", createdBy: admin._id }
    ]);

    const res = await request(app)
      .post("/api/admin/reminder-campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Campaign 4",
        channel: "notification",
        status: "overdue"
      });

    expect(res.status).toBe(402);
    expect(res.body.error).toBe("Reminder campaign limit reached for Starter plan");
    expect(res.body.details).toMatchObject({
      plan: "starter",
      limit: 3,
      used: 3
    });
  });
});
