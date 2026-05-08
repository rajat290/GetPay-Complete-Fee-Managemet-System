const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const authRoutes = require("../../routes/authRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

describe("student invite onboarding", () => {
  let institution;
  let admin;
  let token;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Invite Institution",
      code: "INVITE"
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

  it("invites a student and returns a development invite URL when email is skipped", async () => {
    const res = await request(app)
      .post("/api/admin/students/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Invited Student",
        email: "invited@example.com",
        registrationNo: "INV001",
        className: "10A"
      });

    expect(res.status).toBe(201);
    expect(res.body.student.status).toBe("inactive");
    expect(res.body).toHaveProperty("inviteToken");
    expect(res.body).toHaveProperty("inviteUrl");

    const auditLog = await AuditLog.findOne({ action: "student.invited" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.summary).toBe("Invited student Invited Student (INV001)");
  });

  it("activates an invited student and allows login", async () => {
    const inviteRes = await request(app)
      .post("/api/admin/students/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Invited Student",
        email: "invited@example.com",
        registrationNo: "INV001",
        className: "10A"
      });

    const activateRes = await request(app)
      .post("/api/auth/activate-account")
      .send({
        institutionCode: institution.code,
        token: inviteRes.body.inviteToken,
        password: "studentpass"
      });

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.user).toHaveProperty("token");

    const student = await Student.findOne({ email: "invited@example.com" });
    expect(student.status).toBe("active");

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: institution.code,
        email: "invited@example.com",
        password: "studentpass"
      });

    expect(loginRes.status).toBe(200);
  });

  it("blocks invited students from logging in before activation", async () => {
    await request(app)
      .post("/api/admin/students/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Invited Student",
        email: "invited@example.com",
        registrationNo: "INV001",
        className: "10A"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: institution.code,
        email: "invited@example.com",
        password: "anything"
      });

    expect(loginRes.status).toBe(401);
  });

  it("rejects invalid invite tokens", async () => {
    const res = await request(app)
      .post("/api/auth/activate-account")
      .send({
        institutionCode: institution.code,
        token: "invalid-token",
        password: "studentpass"
      });

    expect(res.status).toBe(400);
  });
});
