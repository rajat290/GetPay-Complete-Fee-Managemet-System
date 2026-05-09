const mongoose = require("mongoose");
const packageInfo = require("../package.json");

const databaseStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting"
};

const getBasePayload = (req) => ({
  service: "getpay-backend",
  version: packageInfo.version,
  environment: process.env.NODE_ENV || "development",
  timestamp: new Date().toISOString(),
  uptimeSeconds: Math.round(process.uptime()),
  requestId: req.requestId
});

const getDatabaseHealth = () => {
  const stateCode = mongoose.connection.readyState;

  return {
    state: databaseStates[stateCode] || "unknown",
    ok: stateCode === 1
  };
};

const health = (req, res) => {
  res.json({
    ...getBasePayload(req),
    status: "ok",
    database: {
      state: getDatabaseHealth().state
    }
  });
};

const live = (req, res) => {
  res.json({
    ...getBasePayload(req),
    status: "alive"
  });
};

const buildReadinessPayload = (req, database = getDatabaseHealth()) => {
  const checks = {
    database,
    environment: {
      ok: true
    }
  };
  const isReady = Object.values(checks).every((check) => check.ok);

  return {
    statusCode: isReady ? 200 : 503,
    body: {
      ...getBasePayload(req),
      status: isReady ? "ready" : "not_ready",
      checks
    }
  };
};

const ready = (req, res) => {
  const payload = buildReadinessPayload(req);
  res.status(payload.statusCode).json(payload.body);
};

module.exports = {
  health,
  live,
  ready,
  getDatabaseHealth,
  buildReadinessPayload
};
