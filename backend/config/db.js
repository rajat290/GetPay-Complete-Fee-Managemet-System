const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("database_connected", {
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (error) {
    logger.error("database_connection_failed", { error });
    process.exit(1);
  }
};

module.exports = connectDB;
