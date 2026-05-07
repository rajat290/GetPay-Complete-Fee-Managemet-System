const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500;
  const safeStatusCode = statusCode < 400 ? 500 : statusCode;

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(safeStatusCode).json({
    error: safeStatusCode === 500 ? "Server error" : err.message,
  });
};

module.exports = { notFound, errorHandler };
