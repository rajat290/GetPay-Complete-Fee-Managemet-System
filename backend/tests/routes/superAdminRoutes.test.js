const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const superAdminRoutes = require("../../routes/superAdminRoutes");
const authRoutes = require("../../routes/authRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/auth", authRoutes);

describe("super admin platform control", () => {
  let superAdmin;
  let superToken;

  beforeEach(async () => {
    superAdmin = await Student.create({
      name: "Platform Owner",
      email: "owner@getpay.test",
      password: "password",
      role: "super_admin"
    });

    superToken = jwt.sign({ id: superAdmin._id, role: superAdmin.role }, process.env.JWT_SECRET);
  });

  it("allows super admin to create an institution with an organization admin", async () => {
    const res = await request(app)
      .post("/api/super-admin/institutions")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        name: "Platform Demo College",
        code: "PLATFORM",
        type: "college",
        email: "office@platform.edu",
        plan: "growth",
        subscriptionStatus: "active",
        adminName: "College Admin",
        adminEmail: "admin@platform.edu",
        adminPassword: "adminpass"
      });

    expect(res.status).toBe(201);
    expect(res.body.institution).toMatchObject({
      name: "Platform Demo College",
      code: "PLATFORM",
      subscription: {
        plan: "growth",
        status: "active"
      }
    });
    expect(res.body.admin).toMatchObject({
      email: "admin@platform.edu",
      role: "admin"
    });

    const auditLog = await AuditLog.findOne({ action: "platform.institution_created" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.actorRole).toBe("super_admin");
  });

  it("blocks organization admins from platform routes", async () => {
    const institution = await Institution.create({
      name: "Blocked School",
      code: "BLOCKED"
    });

    const admin = await Student.create({
      institutionId: institution._id,
      name: "Org Admin",
      email: "admin@blocked.edu",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    const adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/super-admin/institutions")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
  });

  it("updates institution subscription and access status", async () => {
    const institution = await Institution.create({
      name: "Subscription School",
      code: "SUBSCRIPTION"
    });

    const subscriptionRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/subscription`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        plan: "enterprise",
        status: "active"
      });

    expect(subscriptionRes.status).toBe(200);
    expect(subscriptionRes.body.subscription).toMatchObject({
      plan: "enterprise",
      status: "active"
    });

    const suspendRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ isActive: false });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.isActive).toBe(false);

    const auditLog = await AuditLog.findOne({ action: "platform.subscription_updated" });
    expect(auditLog).toBeTruthy();
  });

  it("prevents organization admin login after institution suspension", async () => {
    const createRes = await request(app)
      .post("/api/super-admin/institutions")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        name: "Suspendable College",
        code: "SUSPEND",
        adminName: "Suspend Admin",
        adminEmail: "admin@suspend.edu",
        adminPassword: "adminpass"
      });

    const institutionId = createRes.body.institution._id;

    await request(app)
      .patch(`/api/super-admin/institutions/${institutionId}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ isActive: false });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: "SUSPEND",
        email: "admin@suspend.edu",
        password: "adminpass"
      });

    expect(loginRes.status).toBe(404);
  });
});
