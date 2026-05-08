const redactKeys = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "razorpaySignature",
  "razorpay_key_secret"
]);

const shouldUseJson = () => process.env.LOG_FORMAT === "json" || process.env.NODE_ENV === "production";

const safeValue = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: process.env.NODE_ENV === "production" ? undefined : value.stack
    };
  }

  if (Array.isArray(value)) {
    return value.map(safeValue);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      const normalizedKey = key.toLowerCase();
      acc[key] = redactKeys.has(normalizedKey) || normalizedKey.includes("password") || normalizedKey.includes("token")
        ? "[REDACTED]"
        : safeValue(nestedValue);
      return acc;
    }, {});
  }

  return value;
};

const write = (level, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "getpay-backend",
    environment: process.env.NODE_ENV || "development",
    message,
    ...safeValue(meta)
  };

  if (shouldUseJson()) {
    const line = JSON.stringify(entry);
    if (level === "error") {
      console.error(line);
    } else {
      console.log(line);
    }
    return entry;
  }

  const line = `[${entry.timestamp}] ${level.toUpperCase()} ${message}`;
  if (level === "error") {
    console.error(line, safeValue(meta));
  } else {
    console.log(line, safeValue(meta));
  }

  return entry;
};

module.exports = {
  debug: (message, meta) => {
    if (process.env.LOG_LEVEL === "debug") {
      return write("debug", message, meta);
    }
    return null;
  },
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta),
  safeValue
};
