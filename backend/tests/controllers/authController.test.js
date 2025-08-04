const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authController = require('../../controllers/authController');
const Student = require('../../models/Student');

// Create test app
const app = express();
app.use(express.json());
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

describe('Auth Controller', () => {
  beforeEach(async () => {
    await Student.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student', async () => {
      const studentData = {
        name: 'Test Student',
        email: 'test@example.com',
        password: 'password123',
        rollNumber: 'TEST001',
        class: '10',
        section: 'A'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.student).toHaveProperty('email', 'test@example.com');
    });

    it('should not register duplicate email', async () => {
      const studentData = {
        name: 'Test Student',
        email: 'test@example.com',
        password: 'password123',
        rollNumber: 'TEST001',
        class: '10',
        section: 'A'
      };

      await request(app).post('/api/auth/register').send(studentData);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(studentData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const student = new Student({
        name: 'Test Student',
        email: 'test@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hashed 'password'
        rollNumber: 'TEST001',
        class: '10',
        section: 'A'
      });
      await student.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
