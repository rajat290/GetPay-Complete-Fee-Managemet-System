const logger = require("./logger");

const release = process.env.APP_VERSION || "local";
const provider = process.env.ERROR_TRACKING_PROVIDER || "logger";

const captureException = (error, context = {}) => {
  logger.error("error_tracking_event", {
    provider,
    release,
    message: error?.message || String(error),
    stack: error?.stack,
    context
  });
};

const initErrorTracking = () => {
  process.on("unhandledRejection", (reason) => {
    captureException(reason instanceof Error ? reason : new Error(String(reason)), {
      source: "unhandledRejection"
    });
  });

  process.on("uncaughtException", (error) => {
    captureException(error, { source: "uncaughtException" });
    process.exit(1);
  });

  logger.info("error_tracking_initialized", {
    provider,
    release,
    sentryConfigured: Boolean(process.env.SENTRY_DSN),
    otelConfigured: Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
  });
};

module.exports = {
  initErrorTracking,
  captureException
};
