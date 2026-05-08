const express = require("express");
const jwt = require("jsonwebtoken");
const adminRoutes = require("../../routes/adminRoutes");
const feeRoutes = require("../../routes/feeRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const AuditLog = require("../../models/AuditLog");

const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/fees", feeRoutes);

describe("admin audit logs", () => {
  let institution;
  let otherInstitution;
  let admin;
  let token;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Audit Institution",
      code: "AUDIT"
    });

    otherInstitution = await Institution.create({
      name: "Other Institution",
      code: "OTHER"
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

  it("records and returns audit logs for admin student creation", async () => {
    const createRes = await request(app)
      .post("/api/admin/students")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Student",
        email: "new.student@example.com",
        registrationNo: "STU001",
        className: "10A"
      });

    expect(createRes.status).toBe(201);

    const auditRes = await request(app)
      .get("/api/admin/audit-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.total).toBe(1);
    expect(auditRes.body.rows[0]).toMatchObject({
      action: "student.created",
      entityType: "Student",
      summary: "Created student New Student (STU001)"
    });
    expect(auditRes.body.rows[0].actor.email).toBe("admin@example.com");
  });

  it("filters audit logs by action and keeps institutions isolated", async () => {
    await AuditLog.create([
      {
        institutionId: institution._id,
        actorId: admin._id,
        actorRole: "admin",
        action: "fee.created",
        entityType: "Fee",
        summary: "Created fee"
      },
      {
        institutionId: institution._id,
        actorId: admin._id,
        actorRole: "admin",
        action: "fee.assigned",
        entityType: "FeeAssignment",
        summary: "Assigned fee"
      },
      {
        institutionId: otherInstitution._id,
        actorId: admin._id,
        actorRole: "admin",
        action: "fee.created",
        entityType: "Fee",
        summary: "Other institution log"
      }
    ]);

    const res = await request(app)
      .get("/api/admin/audit-logs?action=fee.created")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.rows[0].summary).toBe("Created fee");
  });

  it("records audit logs for bulk fee assignment", async () => {
    const student = await Student.create({
      institutionId: institution._id,
      name: "Student User",
      email: "student@example.com",
      password: "password",
      registrationNo: "STU002",
      className: "10A"
    });

    const fee = await Fee.create({
      institutionId: institution._id,
      title: "Tuition Fee",
      amount: 1000,
      category: "Tuition",
      dueDate: new Date("2026-12-31")
    });

    const res = await request(app)
      .post("/api/fees/assign-bulk")
      .set("Authorization", `Bearer ${token}`)
      .send({
        feeId: fee._id,
        dueDate: "2026-12-31",
        className: "10A"
      });

    expect(res.status).toBe(201);
    expect(res.body.createdCount).toBe(1);

    const log = await AuditLog.findOne({
      institutionId: institution._id,
      action: "fee.bulk_assigned"
    });

    expect(log).toBeTruthy();
    expect(log.metadata.createdCount).toBe(1);
    expect(log.metadata.matchedStudents).toBe(1);
    expect(log.summary).toBe("Bulk assigned Tuition Fee to 1 students");
    expect(log.metadata.createdAssignmentIds).toHaveLength(1);
    expect(log.metadata.createdAssignmentIds[0].toString()).toBe(res.body.createdAssignmentIds[0]);
    expect(student.className).toBe("10A");
  });
});
