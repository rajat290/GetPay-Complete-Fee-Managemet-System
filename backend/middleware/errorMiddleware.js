const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500;
  const safeStatusCode = statusCode < 400 ? 500 : statusCode;

  logger.error("request_error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: safeStatusCode,
    actorId: req.user?._id,
    actorRole: req.user?.role,
    institutionId: req.institutionId,
    error: err
  });

  res.status(safeStatusCode).json({
    error: safeStatusCode === 500 ? "Server error" : err.message,
    requestId: req.requestId,
  });
};

module.exports = { notFound, errorHandler };
