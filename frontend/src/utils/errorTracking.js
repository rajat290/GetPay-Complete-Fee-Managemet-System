const enabled = import.meta.env.VITE_ERROR_TRACKING_ENABLED === "true";
const release = import.meta.env.VITE_APP_VERSION || "local";

export function initErrorTracking() {
  if (!enabled || typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureFrontendError(event.error || event.message, {
      source: "window.error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureFrontendError(event.reason, { source: "unhandledrejection" });
  });
}

export function captureFrontendError(error, context = {}) {
  if (!enabled) return;

  const payload = {
    release,
    message: error?.message || String(error),
    stack: error?.stack,
    context,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    timestamp: new Date().toISOString()
  };

  if (window.Sentry?.captureException && error instanceof Error) {
    window.Sentry.captureException(error, { extra: payload });
    return;
  }

  if (window.Sentry?.captureMessage) {
    window.Sentry.captureMessage(payload.message, { extra: payload });
    return;
  }

  // Last-resort visibility until a hosted Sentry/OpenTelemetry provider is configured.
  console.warn("frontend_error_captured", payload);
}
