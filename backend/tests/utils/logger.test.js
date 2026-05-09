const logger = require("../../utils/logger");

describe("structured logger", () => {
  it("redacts sensitive fields from nested metadata", () => {
    const safe = logger.safeValue({
      email: "admin@example.com",
      password: "secret",
      nested: {
        resetToken: "token-value",
        amount: 500
      },
      authorization: "Bearer token"
    });

    expect(safe.email).toBe("admin@example.com");
    expect(safe.password).toBe("[REDACTED]");
    expect(safe.authorization).toBe("[REDACTED]");
    expect(safe.nested.resetToken).toBe("[REDACTED]");
    expect(safe.nested.amount).toBe(500);
  });

  it("normalizes errors without throwing", () => {
    const safe = logger.safeValue({
      error: new Error("Database failed")
    });

    expect(safe.error.name).toBe("Error");
    expect(safe.error.message).toBe("Database failed");
  });

  it("filters messages below the configured log level", () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = "warn";

    expect(logger.info("hidden_info_log")).toBeNull();
    expect(logger.warn("visible_warning_log")).toMatchObject({
      level: "warn",
      message: "visible_warning_log"
    });

    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });
});
