const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const authRoutes = require("../../routes/authRoutes");
const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Role = require("../../models/Role");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

describe("password lifecycle", () => {
  let institution;
  let staff;
  let staffToken;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Lifecycle College",
      code: "LIFE",
      enabledModules: ["settings", "finance_operations"]
    });

    const role = await Role.create({
      institutionId: institution._id,
      name: "Accountant",
      permissions: ["fee.collect"]
    });

    staff = await Student.create({
      institutionId: institution._id,
      name: "Staff User",
      email: "staff@life.edu",
      password: "tempPassword123",
      registrationNo: "EMP001",
      className: "Staff",
      role: "staff",
      roleIds: [role._id],
      mustChangePassword: true
    });

    staffToken = jwt.sign({ id: staff._id, role: staff.role }, process.env.JWT_SECRET);
  });

  it("flags staff login when a temporary password must be changed", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: "LIFE",
        email: "staff@life.edu",
        password: "tempPassword123"
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      role: "staff",
      mustChangePassword: true
    });
  });

  it("blocks protected app access until staff changes the temporary password", async () => {
    const blocked = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe("PASSWORD_CHANGE_REQUIRED");

    const changed = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        currentPassword: "tempPassword123",
        newPassword: "strongPassword123"
      });

    expect(changed.status).toBe(200);
    expect(changed.body.user.mustChangePassword).toBe(false);

    const allowed = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(allowed.status).toBe(200);
  });

  it("clears mustChangePassword after reset password", async () => {
    const token = "reset-token";
    staff.passwordResetToken = require("crypto").createHash("sha256").update(token).digest("hex");
    staff.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await staff.save();

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        institutionCode: "LIFE",
        token,
        password: "resetPassword123"
      });

    expect(res.status).toBe(200);

    const saved = await Student.findById(staff._id);
    expect(saved.mustChangePassword).toBe(false);
  });
});
