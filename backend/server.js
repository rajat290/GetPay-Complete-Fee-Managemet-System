const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { applySecurityHeaders } = require("./middleware/securityMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { requestContext, requestLogger } = require("./middleware/requestContextMiddleware");
const logger = require("./utils/logger");

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
const packageInfo = require("./package.json");

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

app.get("/api/health", (req, res) => {
  const databaseStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.json({
    service: "getpay-backend",
    version: packageInfo.version,
    environment: process.env.NODE_ENV || "development",
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    requestId: req.requestId,
    database: {
      state: databaseStates[mongoose.connection.readyState] || "unknown"
    }
  });
});

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
app.listen(PORT, () => {
  logger.info("server_started", { port: PORT });
  startOverdueSyncJob();
});
