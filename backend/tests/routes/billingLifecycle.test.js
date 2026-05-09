const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const superAdminRoutes = require("../../routes/superAdminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Invoice = require("../../models/Invoice");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/super-admin", superAdminRoutes);

describe("billing lifecycle", () => {
  let superAdmin;
  let superToken;
  let institution;

  beforeEach(async () => {
    superAdmin = await Student.create({
      name: "Platform Owner",
      email: "owner@getpay.test",
      password: "password",
      role: "super_admin"
    });

    superToken = jwt.sign({ id: superAdmin._id, role: superAdmin.role }, process.env.JWT_SECRET);

    institution = await Institution.create({
      name: "Billing College",
      code: "BILLING",
      subscription: {
        plan: "growth",
        status: "active"
      }
    });
  });

  it("lets super admin create and list manual invoices", async () => {
    const res = await request(app)
      .post(`/api/super-admin/institutions/${institution._id}/invoices`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        amountInr: 4999,
        billingPeriodStart: "2026-05-01",
        billingPeriodEnd: "2026-05-31",
        dueDate: "2026-05-10",
        notes: "May subscription"
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      amountInr: 4999,
      status: "issued",
      notes: "May subscription"
    });
    expect(res.body.invoiceNumber).toContain("INV-BILLING");

    const listRes = await request(app)
      .get(`/api/super-admin/institutions/${institution._id}/invoices`)
      .set("Authorization", `Bearer ${superToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const auditLog = await AuditLog.findOne({ action: "platform.invoice_created" });
    expect(auditLog).toBeTruthy();
  });

  it("marks invoice paid and reactivates subscription", async () => {
    const invoice = await Invoice.create({
      institutionId: institution._id,
      invoiceNumber: "INV-BILLING-PAID",
      amountInr: 4999,
      status: "past_due",
      billingPeriodStart: new Date("2026-05-01"),
      billingPeriodEnd: new Date("2026-05-31"),
      dueDate: new Date("2026-05-10")
    });

    institution.subscription.status = "past_due";
    institution.isActive = false;
    await institution.save();

    const res = await request(app)
      .patch(`/api/super-admin/institutions/${institution._id}/invoices/${invoice._id}/paid`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("paid");

    const savedInstitution = await Institution.findById(institution._id);
    expect(savedInstitution.subscription.status).toBe("active");
    expect(savedInstitution.isActive).toBe(true);
  });

  it("moves expired subscriptions to past due and suspends after grace period", async () => {
    const oldPeriodEnd = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    institution.subscription.currentPeriodEndsAt = oldPeriodEnd;
    await institution.save();

    const firstRefresh = await request(app)
      .post("/api/super-admin/billing/refresh")
      .set("Authorization", `Bearer ${superToken}`);

    expect(firstRefresh.status).toBe(200);

    let savedInstitution = await Institution.findById(institution._id);
    expect(savedInstitution.subscription.status).toBe("paused");
    expect(savedInstitution.isActive).toBe(false);

    const auditLog = await AuditLog.findOne({ action: "platform.billing_lifecycle_refreshed" });
    expect(auditLog).toBeTruthy();
  });
});
