const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const feeRoutes = require('../../routes/feeRoutes');
const Fee = require('../../models/Fee');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/fees', feeRoutes);

describe('Fee Routes', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/getpay_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Fee.deleteMany({});
  });

  describe('GET /api/fees', () => {
    it('should return all fees', async () => {
      const fee1 = new Fee({
        name: 'Tuition Fee',
        amount: 1000,
        type: 'monthly',
        description: 'Monthly tuition fee'
      });
      const fee2 = new Fee({
        name: 'Exam Fee',
        amount: 500,
        type: 'annual',
        description: 'Annual exam fee'
      });
      
      await fee1.save();
      await fee2.save();

      const response = await request(app).get('/api/fees');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Tuition Fee');
    });
  });

  describe('POST /api/fees', () => {
    it('should create a new fee', async () => {
      const feeData = {
        name: 'Library Fee',
        amount: 200,
        type: 'annual',
        description: 'Annual library fee'
      };

      const response = await request(app)
        .post('/api/fees')
        .send(feeData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'Library Fee');
      expect(response.body).toHaveProperty('_id');
    });

    it('should not create fee without required fields', async () => {
      const response = await request(app)
        .post('/api/fees')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
