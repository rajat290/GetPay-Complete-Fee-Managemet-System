const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Role = require("../../models/Role");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("staff RBAC", () => {
  let institution;
  let admin;
  let adminToken;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "RBAC College",
      code: "RBAC",
      enabledModules: ["settings", "student_management", "finance_operations", "audit_trail"]
    });

    admin = await Student.create({
      institutionId: institution._id,
      name: "Org Admin",
      email: "admin@rbac.edu",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  it("lets an organization admin create roles and staff inside their institution", async () => {
    const roleRes = await request(app)
      .post("/api/admin/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Accountant",
        permissions: ["fee.collect", "payment.record_offline", "not.real"]
      });

    expect(roleRes.status).toBe(201);
    expect(roleRes.body.permissions).toEqual(["fee.collect", "payment.record_offline"]);

    const staffRes = await request(app)
      .post("/api/admin/staff")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Fee Desk",
        email: "fees@rbac.edu",
        employeeCode: "EMP001",
        roleIds: [roleRes.body._id]
      });

    expect(staffRes.status).toBe(201);
    expect(staffRes.body.staff).toMatchObject({
      name: "Fee Desk",
      email: "fees@rbac.edu",
      role: "staff",
      mustChangePassword: true
    });
    expect(staffRes.body.temporaryPassword).toBeTruthy();

    const auditLog = await AuditLog.findOne({ action: "staff.created" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.institutionId.toString()).toBe(institution._id.toString());
  });

  it("allows staff with a permission and denies missing permissions", async () => {
    const role = await Role.create({
      institutionId: institution._id,
      name: "Accountant",
      permissions: ["fee.collect"]
    });

    const staff = await Student.create({
      institutionId: institution._id,
      name: "Accountant User",
      email: "accountant@rbac.edu",
      password: "password",
      registrationNo: "EMP002",
      className: "Staff",
      role: "staff",
      roleIds: [role._id]
    });

    const staffToken = jwt.sign({ id: staff._id, role: staff.role }, process.env.JWT_SECRET);

    const allowed = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(allowed.status).toBe(200);

    const denied = await request(app)
      .get("/api/admin/payments/stats")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(denied.status).toBe(403);
    expect(denied.body.permission).toBe("analytics.view");
  });

  it("does not allow staff to manage roles", async () => {
    const role = await Role.create({
      institutionId: institution._id,
      name: "Staff Manager",
      permissions: ["staff.manage"]
    });

    const staff = await Student.create({
      institutionId: institution._id,
      name: "Staff Manager User",
      email: "staff-manager@rbac.edu",
      password: "password",
      registrationNo: "EMP003",
      className: "Staff",
      role: "staff",
      roleIds: [role._id]
    });

    const staffToken = jwt.sign({ id: staff._id, role: staff.role }, process.env.JWT_SECRET);

    const res = await request(app)
      .post("/api/admin/roles")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ name: "Should Not Work", permissions: ["analytics.view"] });

    expect(res.status).toBe(403);
  });
});
