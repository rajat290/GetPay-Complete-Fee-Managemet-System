const PLACEHOLDER_PATTERNS = [
  /^replace/i,
  /replace_me/i,
  /replace_with/i,
  /example/i,
  /changeme/i,
  /secret$/i
];

const REQUIRED_ALWAYS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CORS_ORIGIN"
];

const REQUIRED_PRODUCTION = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "FRONTEND_URL",
  "SUPER_ADMIN_EMAIL",
  "SUPER_ADMIN_PASSWORD"
];

const OPTIONAL_RECOMMENDED_PRODUCTION = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "LOG_LEVEL"
];

const getEnv = (key) => process.env[key] || (key === "MONGODB_URI" ? process.env.MONGO_URI : undefined);

const hasPlaceholderValue = (value = "") => PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(String(value)));

const validateEnvironment = ({ exitOnError = false } = {}) => {
  const environment = process.env.NODE_ENV || "development";
  const isProduction = environment === "production";
  const errors = [];
  const warnings = [];
  const required = isProduction ? [...REQUIRED_ALWAYS, ...REQUIRED_PRODUCTION] : REQUIRED_ALWAYS;

  required.forEach((key) => {
    const value = getEnv(key);
    if (!value) {
      errors.push(`${key} is required`);
      return;
    }

    if (isProduction && hasPlaceholderValue(value)) {
      errors.push(`${key} must not use a placeholder value in production`);
    }
  });

  if (isProduction) {
    if ((getEnv("JWT_SECRET") || "").length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters in production");
    }

    OPTIONAL_RECOMMENDED_PRODUCTION.forEach((key) => {
      if (!getEnv(key)) {
        warnings.push(`${key} is recommended for production operations`);
      }
    });
  }

  const result = {
    ok: errors.length === 0,
    environment,
    errors,
    warnings
  };

  if (!result.ok && exitOnError) {
    console.error("Environment validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  if (warnings.length > 0 && exitOnError) {
    console.warn("Environment validation warnings:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  return result;
};

module.exports = {
  REQUIRED_ALWAYS,
  REQUIRED_PRODUCTION,
  OPTIONAL_RECOMMENDED_PRODUCTION,
  validateEnvironment
};
