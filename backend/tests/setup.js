// Simple test setup without mongodb-memory-server
// This will use the actual database for testing
// In production, you might want to use a separate test database

const mongoose = require('mongoose');

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/getpay_test');
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Clean up between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
