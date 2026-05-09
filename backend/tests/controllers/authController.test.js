const request = require("supertest");
const express = require("express");
const authController = require("../../controllers/authController");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

const app = express();
app.use(express.json());
app.post("/api/auth/register", authController.registerStudent);
app.post("/api/auth/login", authController.loginStudent);
app.post("/api/auth/forgot-password", authController.requestPasswordReset);
app.post("/api/auth/reset-password", authController.resetPassword);

describe("Auth Controller", () => {
  let institution;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    process.env.PUBLIC_STUDENT_REGISTRATION_ENABLED = "true";

    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });
  });

  afterEach(() => {
    delete process.env.PUBLIC_STUDENT_REGISTRATION_ENABLED;
  });

  it("blocks public student registration unless explicitly enabled", async () => {
    delete process.env.PUBLIC_STUDENT_REGISTRATION_ENABLED;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        institutionCode: institution.code,
        name: "Blocked Student",
        email: "blocked@example.com",
        password: "password123",
        registrationNo: "BLOCK001",
        className: "10A"
      });

    expect(response.status).toBe(403);
  });

  it("registers a student inside an institution", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        institutionCode: institution.code,
        name: "Test Student",
        email: "test@example.com",
        password: "password123",
        registrationNo: "TEST001",
        className: "10A"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).toHaveProperty("role", "student");
    expect(response.body.institution).toHaveProperty("code", institution.code);
  });

  it("rejects duplicate students inside the same institution", async () => {
    const studentData = {
      institutionCode: institution.code,
      name: "Test Student",
      email: "test@example.com",
      password: "password123",
      registrationNo: "TEST001",
      className: "10A"
    };

    await request(app).post("/api/auth/register").send(studentData);
    const response = await request(app).post("/api/auth/register").send(studentData);

    expect(response.status).toBe(400);
  });

  it("logs in with valid institution-scoped credentials", async () => {
    await Student.create({
      institutionId: institution._id,
      name: "Test Student",
      email: "test@example.com",
      password: "password",
      registrationNo: "TEST001",
      className: "10A"
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: institution.code,
        email: "test@example.com",
        password: "password"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.institution).toHaveProperty("code", institution.code);
  });

  it("does not login with invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: institution.code,
        email: "test@example.com",
        password: "wrongpassword"
      });

    expect(response.status).toBe(401);
  });

  it("requests and completes a password reset", async () => {
    await Student.create({
      institutionId: institution._id,
      name: "Reset Student",
      email: "reset@example.com",
      password: "oldpassword",
      registrationNo: "RESET001",
      className: "10A"
    });

    const requestResponse = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        institutionCode: institution.code,
        email: "reset@example.com"
      });

    expect(requestResponse.status).toBe(200);
    expect(requestResponse.body).toHaveProperty("resetToken");

    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        institutionCode: institution.code,
        token: requestResponse.body.resetToken,
        password: "newpassword"
      });

    expect(resetResponse.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: institution.code,
        email: "reset@example.com",
        password: "oldpassword"
      });

    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/auth/login")
      .send({
        institutionCode: institution.code,
        email: "reset@example.com",
        password: "newpassword"
      });

    expect(newLogin.status).toBe(200);
  });

  it("rejects expired reset tokens", async () => {
    const student = await Student.create({
      institutionId: institution._id,
      name: "Expired Student",
      email: "expired@example.com",
      password: "password",
      registrationNo: "EXP001",
      className: "10A"
    });

    student.passwordResetToken = "expired-token";
    student.passwordResetExpires = new Date(Date.now() - 60 * 1000);
    await student.save();

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        institutionCode: institution.code,
        token: "expired-token",
        password: "newpassword"
      });

    expect(response.status).toBe(400);
  });
});
