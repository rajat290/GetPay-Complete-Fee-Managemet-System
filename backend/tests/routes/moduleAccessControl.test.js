const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const superAdminRoutes = require("../../routes/superAdminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);

describe("module access control", () => {
  let superAdmin;
  let superToken;
  let institution;
  let admin;
  let adminToken;

  beforeEach(async () => {
    superAdmin = await Student.create({
      name: "Platform Owner",
      email: "owner@getpay.test",
      password: "password",
      role: "super_admin"
    });

    institution = await Institution.create({
      name: "Module School",
      code: "MODULE",
      enabledModules: ["fee_management", "settings"]
    });

    admin = await Student.create({
      institutionId: institution._id,
      name: "Org Admin",
      email: "admin@module.edu",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    superToken = jwt.sign({ id: superAdmin._id, role: superAdmin.role }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  it("returns the module catalog to super admins", async () => {
    const res = await request(app)
      .get("/api/super-admin/modules")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.modules.map((module) => module.key)).toEqual(
      expect.arrayContaining(["student_management", "fee_management", "finance_operations", "analytics"])
    );
  });

  it("blocks disabled modules for organization admins", async () => {
    const res = await request(app)
      .get("/api/admin/students")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      error: "Module access disabled for this institution",
      module: "student_management"
    });
  });

  it("allows access after super admin enables the module", async () => {
    const updateRes = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/modules`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        enabledModules: ["student_management", "fee_management", "settings"]
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.enabledModules).toEqual(
      expect.arrayContaining(["student_management", "fee_management", "settings"])
    );

    const studentsRes = await request(app)
      .get("/api/admin/students")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(studentsRes.status).toBe(200);

    const auditLog = await AuditLog.findOne({ action: "platform.modules_updated" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.metadata.enabledModules).toEqual(
      expect.arrayContaining(["student_management", "fee_management", "settings"])
    );
  });
});
