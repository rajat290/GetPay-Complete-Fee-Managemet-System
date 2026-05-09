const express = require("express");
const request = require("supertest");

const publicRoutes = require("../../routes/publicRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Lead = require("../../models/Lead");

const app = express();
app.use(express.json());
app.use("/api/public", publicRoutes);

describe("public trial registration", () => {
  it("creates a trial institution and organization admin with normalized code", async () => {
    const res = await request(app)
      .post("/api/public/register-trial")
      .send({
        name: "Future Valley School",
        type: "school",
        email: "office@futurevalley.edu",
        phone: "+91 9000000000",
        adminName: "Principal Admin",
        adminEmail: "principal@futurevalley.edu",
        adminPassword: "strongpass123"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.institutionCode).toMatch(/^FUTUREVA\d{4}$/);

    const institution = await Institution.findById(res.body.institutionId);
    expect(institution.subscription.status).toBe("trialing");
    expect(institution.enabledModules).toContain("student_management");

    const admin = await Student.findById(res.body.adminId);
    expect(admin.role).toBe("admin");
    expect(admin.email).toBe("principal@futurevalley.edu");

    const lead = await Lead.findOne({ source: "trial_signup", institutionId: institution._id });
    expect(lead).toBeTruthy();
    expect(lead.status).toBe("trial_active");
    expect(lead.contactEmail).toBe("principal@futurevalley.edu");
  });

  it("rejects weak passwords and duplicate admin emails", async () => {
    await Student.create({
      institutionId: (await Institution.create({ name: "Existing", code: "EXISTING" }))._id,
      name: "Existing Admin",
      email: "admin@example.com",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    const weakPassword = await request(app)
      .post("/api/public/register-trial")
      .send({
        name: "Weak Password School",
        email: "office@weak.edu",
        adminName: "Weak Admin",
        adminEmail: "weak@example.com",
        adminPassword: "short"
      });

    expect(weakPassword.status).toBe(400);

    const duplicateEmail = await request(app)
      .post("/api/public/register-trial")
      .send({
        name: "Duplicate School",
        email: "office@duplicate.edu",
        adminName: "Duplicate Admin",
        adminEmail: "admin@example.com",
        adminPassword: "strongpass123"
      });

    expect(duplicateEmail.status).toBe(400);
  });
});
