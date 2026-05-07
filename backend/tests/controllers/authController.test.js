const request = require("supertest");
const express = require("express");
const authController = require("../../controllers/authController");
const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

const app = express();
app.use(express.json());
app.post("/api/auth/register", authController.registerStudent);
app.post("/api/auth/login", authController.loginStudent);

describe("Auth Controller", () => {
  let institution;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });
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
});
