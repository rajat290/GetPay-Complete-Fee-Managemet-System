const crypto = require("crypto");
const logger = require("../utils/logger");

const requestContext = (req, res, next) => {
  const incomingRequestId = req.get("x-request-id");
  req.requestId = incomingRequestId || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level]("http_request", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      actorId: req.user?._id,
      actorRole: req.user?.role,
      institutionId: req.institutionId
    });
  });

  next();
};

module.exports = {
  requestContext,
  requestLogger
};
