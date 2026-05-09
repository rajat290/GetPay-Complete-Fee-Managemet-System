const { validateEnvironment } = require("../../config/environment");

const ORIGINAL_ENV = process.env;

describe("environment validation", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("passes in test mode with required baseline variables", () => {
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = "mongodb://localhost:27017/getpay_test";
    process.env.JWT_SECRET = "test-secret";
    process.env.CORS_ORIGIN = "http://localhost:5173";

    const result = validateEnvironment();

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("fails production when secrets are missing or placeholders", () => {
    process.env.NODE_ENV = "production";
    process.env.MONGODB_URI = "mongodb://localhost:27017/getpay";
    process.env.JWT_SECRET = "short";
    process.env.CORS_ORIGIN = "https://app.getpay.example";
    process.env.FRONTEND_URL = "https://app.getpay.example";
    process.env.RAZORPAY_KEY_ID = "rzp_live_replace_me";
    process.env.RAZORPAY_KEY_SECRET = "replace_me";
    process.env.RAZORPAY_WEBHOOK_SECRET = "replace_me";
    process.env.SUPER_ADMIN_EMAIL = "owner@getpay.example";
    process.env.SUPER_ADMIN_PASSWORD = "replace_with_a_strong_password";

    const result = validateEnvironment();

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      "JWT_SECRET must be at least 32 characters in production",
      "RAZORPAY_KEY_SECRET must not use a placeholder value in production",
      "SUPER_ADMIN_PASSWORD must not use a placeholder value in production"
    ]));
  });
});
