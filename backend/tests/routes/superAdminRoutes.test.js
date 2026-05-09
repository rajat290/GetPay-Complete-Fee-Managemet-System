const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const superAdminRoutes = require("../../routes/superAdminRoutes");
const authRoutes = require("../../routes/authRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const AuditLog = require("../../models/AuditLog");
const AdminRecoveryLog = require("../../models/AdminRecoveryLog");
const PlatformAnnouncement = require("../../models/PlatformAnnouncement");
const ImpersonationLog = require("../../models/ImpersonationLog");

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

  it("allows super admin to archive, restore, and apply risk controls", async () => {
    const institution = await Institution.create({
      name: "Risk School",
      code: "RISK"
    });

    const archiveRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/archive`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ reason: "Closed pilot" });

    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.isActive).toBe(false);
    expect(archiveRes.body.lifecycle.archiveReason).toBe("Closed pilot");

    const restoreRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/restore`)
      .set("Authorization", `Bearer ${superToken}`)
      .send();

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.isActive).toBe(true);

    const riskRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/risk-controls`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        freezeInstitution: true,
        blockPayments: true,
        restrictExports: true,
        reason: "Payment dispute"
      });

    expect(riskRes.status).toBe(200);
    expect(riskRes.body.riskControls.freezeInstitution).toBe(true);
    expect(riskRes.body.riskControls.reason).toBe("Payment dispute");

    const auditLog = await AuditLog.findOne({ action: "platform.risk_controls_updated" });
    expect(auditLog).toBeTruthy();
  });

  it("supports trial conversion, limit overrides, and admin recovery", async () => {
    const institution = await Institution.create({
      name: "Trial College",
      code: "TRIALCTRL",
      subscription: {
        plan: "starter",
        status: "trialing",
        trialEndsAt: new Date()
      }
    });

    const admin = await Student.create({
      institutionId: institution._id,
      name: "Trial Admin",
      email: "admin@trialctrl.edu",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    const overrideRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/subscription`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        limitOverrides: {
          students: 750,
          admins: 4,
          reminderCampaigns: 8
        }
      });

    expect(overrideRes.status).toBe(200);
    expect(overrideRes.body.subscriptionSummary.limits.students).toBe(750);
    expect(overrideRes.body.subscriptionSummary.planLimits.students).toBe(500);

    const extendRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/trial/extend`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ days: 7 });

    expect(extendRes.status).toBe(200);
    expect(extendRes.body.subscription.status).toBe("trialing");
    expect(extendRes.body.subscription.trialEndsAt).toBeTruthy();

    const convertRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/trial/convert`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ plan: "growth" });

    expect(convertRes.status).toBe(200);
    expect(convertRes.body.subscription.status).toBe("active");
    expect(convertRes.body.subscription.plan).toBe("growth");

    const recoveryRes = await request(app)
      .post(`/api/super-admin/institutions/${institution._id}/admins/${admin._id}/recovery`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        action: "temporary_password_reset",
        reason: "Principal lost access"
      });

    expect(recoveryRes.status).toBe(200);
    expect(recoveryRes.body.temporaryPassword).toMatch(/^GetPay@/);
    expect(recoveryRes.body.admin.mustChangePassword).toBe(true);

    const recoveryLog = await AdminRecoveryLog.findOne({ adminId: admin._id });
    expect(recoveryLog.reason).toBe("Principal lost access");
  });

  it("creates and lists platform announcements", async () => {
    const createRes = await request(app)
      .post("/api/super-admin/announcements")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        title: "Maintenance notice",
        message: "Collections dashboard maintenance tonight.",
        audience: "all",
        channel: "in_app",
        status: "sent"
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.sentAt).toBeTruthy();

    const announcement = await PlatformAnnouncement.findOne({ title: "Maintenance notice" });
    expect(announcement).toBeTruthy();

    const listRes = await request(app)
      .get("/api/super-admin/announcements")
      .set("Authorization", `Bearer ${superToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const auditLog = await AuditLog.findOne({ action: "platform.announcement_created" });
    expect(auditLog).toBeTruthy();
  });

  it("starts audited support impersonation for an organization admin", async () => {
    const institution = await Institution.create({
      name: "Support Mode School",
      code: "SUPPORTMODE"
    });

    const admin = await Student.create({
      institutionId: institution._id,
      name: "Support Target",
      email: "admin@supportmode.edu",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    const res = await request(app)
      .post(`/api/super-admin/institutions/${institution._id}/admins/${admin._id}/impersonate`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ reason: "Debugging billing setup with principal approval" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("admin");
    expect(res.body.user.impersonated).toBe(true);

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.impersonation.reason).toBe("Debugging billing setup with principal approval");
    expect(decoded.impersonation.by).toBe(String(superAdmin._id));

    const impersonationLog = await ImpersonationLog.findOne({ targetUserId: admin._id });
    expect(impersonationLog.reason).toBe("Debugging billing setup with principal approval");

    const auditLog = await AuditLog.findOne({ action: "platform.impersonation_started" });
    expect(auditLog).toBeTruthy();
  });
});
