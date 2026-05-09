const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { validateEnvironment } = require("./config/environment");
const { applySecurityHeaders } = require("./middleware/securityMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { requestContext, requestLogger } = require("./middleware/requestContextMiddleware");
const { health, live, ready } = require("./controllers/healthController");
const logger = require("./utils/logger");

validateEnvironment({ exitOnError: true });

const authRoutes = require("./routes/authRoutes");
const feeRoutes = require("./routes/feeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { handleRazorpayWebhook } = require("./controllers/paymentController");
const analyticsRoutes = require("./routes/analyticsRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const adminRoutes = require("./routes/adminRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const publicRoutes = require("./routes/publicRoutes");
const { startOverdueSyncJob } = require("./services/overdueSyncService");

connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(applySecurityHeaders);
app.use(requestContext);
app.use(requestLogger);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleRazorpayWebhook);
app.use(express.json());

app.get("/api/health", health);
app.get("/api/health/live", live);
app.get("/api/health/ready", ready);

app.use("/api/auth", authRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "GetPay Education API",
    status: "running",
    health: "/api/health",
    apiBasePath: "/api"
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info("server_started", { port: PORT });
  startOverdueSyncJob();
});

const shutdown = async (signal) => {
  logger.warn("server_shutdown_started", { signal });

  server.close(async (error) => {
    if (error) {
      logger.fatal("server_shutdown_failed", { signal, error });
      process.exit(1);
    }

    try {
      await mongoose.connection.close(false);
      logger.info("server_shutdown_completed", { signal });
      process.exit(0);
    } catch (closeError) {
      logger.fatal("database_shutdown_failed", { signal, error: closeError });
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.fatal("unhandled_rejection", { error: reason });
});
process.on("uncaughtException", (error) => {
  logger.fatal("uncaught_exception", { error });
  process.exit(1);
});

module.exports = app;
