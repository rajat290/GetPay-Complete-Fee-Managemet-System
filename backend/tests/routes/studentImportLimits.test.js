const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const adminRoutes = require("../../routes/adminRoutes");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("student CSV import limits", () => {
  it("blocks CSV imports that would exceed the institution plan student limit", async () => {
    const institution = await Institution.create({
      name: "Limit School",
      code: "LIMIT",
      enabledModules: ["student_management", "settings"],
      subscription: {
        plan: "starter",
        status: "active"
      }
    });

    const admin = await Student.create({
      institutionId: institution._id,
      name: "Limit Admin",
      email: "admin@limit.edu",
      password: "password",
      registrationNo: "ADM001",
      className: "Administration",
      role: "admin"
    });

    const students = Array.from({ length: 500 }, (_, index) => ({
      institutionId: institution._id,
      name: `Student ${index}`,
      email: `student${index}@limit.edu`,
      password: "password",
      registrationNo: `REG${index}`,
      className: "10thA",
      role: "student"
    }));
    await Student.insertMany(students);

    const csvPath = path.join(os.tmpdir(), `getpay-import-${Date.now()}.csv`);
    fs.writeFileSync(csvPath, "Name,Email,Registration No,Class\nNew Student,new@student.edu,REG999,10thA\n");

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
    const res = await request(app)
      .post("/api/admin/students/import")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", csvPath);

    fs.unlinkSync(csvPath);

    expect(res.status).toBe(402);
    expect(res.body.error).toContain("Student limit reached");
    expect(await Student.countDocuments({ institutionId: institution._id, role: "student" })).toBe(500);
  });
});
