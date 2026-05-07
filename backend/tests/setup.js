const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      if (process.env.USE_MEMORY_MONGO !== "true") {
        throw new Error("Memory Mongo disabled");
      }

      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    } catch (error) {
      const fallbackUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/getpay_test';
      await mongoose.connect(fallbackUri);
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clean up between tests, including stale indexes from older schemas.
beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
  }
});
