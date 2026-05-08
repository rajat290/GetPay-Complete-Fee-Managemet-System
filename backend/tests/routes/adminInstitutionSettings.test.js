const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const AuditLog = require("../../models/AuditLog");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("admin institution settings", () => {
  let institution;
  let admin;
  let token;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Original College",
      code: "ORIGINAL",
      type: "college",
      email: "office@original.edu",
      branding: {
        primaryColor: "#2563eb"
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

  it("returns the current institution settings for the admin tenant", async () => {
    const res = await request(app)
      .get("/api/admin/institution")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: "Original College",
      code: "ORIGINAL",
      type: "college",
      email: "office@original.edu"
    });
    expect(res.body.branding.primaryColor).toBe("#2563eb");
  });

  it("updates editable profile, branding, and billing contact fields", async () => {
    const res = await request(app)
      .patch("/api/admin/institution")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "GetPay Demo College",
        type: "college",
        email: "accounts@getpaydemo.edu",
        phone: "+91 9876543210",
        address: "Sector 12, Jaipur",
        branding: {
          logoUrl: "https://example.com/logo.png",
          primaryColor: "#0f766e",
          receiptFooter: "Fees once paid are subject to institutional policy."
        },
        billingContact: {
          name: "Finance Desk",
          email: "finance@getpaydemo.edu",
          phone: "+91 9000000000"
        },
        code: "SHOULDNOTCHANGE",
        isActive: false
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: "GetPay Demo College",
      code: "ORIGINAL",
      isActive: true,
      branding: {
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#0f766e",
        receiptFooter: "Fees once paid are subject to institutional policy."
      },
      billingContact: {
        name: "Finance Desk",
        email: "finance@getpaydemo.edu",
        phone: "+91 9000000000"
      }
    });

    const saved = await Institution.findById(institution._id);
    expect(saved.code).toBe("ORIGINAL");
    expect(saved.isActive).toBe(true);
    expect(saved.branding.primaryColor).toBe("#0f766e");

    const auditLog = await AuditLog.findOne({ action: "institution.settings_updated" });
    expect(auditLog).toBeTruthy();
    expect(auditLog.entityType).toBe("Institution");
    expect(auditLog.metadata.updatedFields).toEqual(
      expect.arrayContaining(["name", "branding", "billingContact"])
    );
  });

  it("keeps tenant settings isolated", async () => {
    const otherInstitution = await Institution.create({
      name: "Other School",
      code: "OTHER"
    });

    const res = await request(app)
      .patch("/api/admin/institution")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Renamed College",
        branding: {
          primaryColor: "#7c3aed"
        }
      });

    expect(res.status).toBe(200);

    const untouched = await Institution.findById(otherInstitution._id);
    expect(untouched.name).toBe("Other School");
    expect(untouched.branding.primaryColor).toBe("#2563eb");
  });
});
