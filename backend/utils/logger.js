const redactKeys = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "apikey",
  "api_key",
  "razorpaySignature",
  "razorpay_key_secret",
  "razorpayKeySecret"
]);

const levelWeights = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50
};

const shouldUseJson = () => process.env.LOG_FORMAT === "json" || process.env.NODE_ENV === "production";

const getConfiguredLevel = () => {
  const configured = (process.env.LOG_LEVEL || "info").toLowerCase();
  return levelWeights[configured] ? configured : "info";
};

const shouldLog = (level) => levelWeights[level] >= levelWeights[getConfiguredLevel()];

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
  if (!shouldLog(level)) {
    return null;
  }

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
    if (level === "error" || level === "fatal") {
      console.error(line);
    } else {
      console.log(line);
    }
    return entry;
  }

  const line = `[${entry.timestamp}] ${level.toUpperCase()} ${message}`;
  if (level === "error" || level === "fatal") {
    console.error(line, safeValue(meta));
  } else {
    console.log(line, safeValue(meta));
  }

  return entry;
};

module.exports = {
  debug: (message, meta) => write("debug", message, meta),
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta),
  fatal: (message, meta) => write("fatal", message, meta),
  safeValue
};
