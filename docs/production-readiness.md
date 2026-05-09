# GetPay Production Readiness Checks

This document tracks launch checks that should run before a production release.

## Dependency Audit

Run from the repo root:

```bash
npm run audit:prod
```

This runs high-severity production dependency audits for `backend` and `frontend`.

Expected release gate:
- No critical production vulnerabilities.
- High vulnerabilities must have a documented owner, mitigation, or upgrade plan.
- Re-run after every dependency change.

## Browser Smoke Tests

Build the frontend, then run:

```bash
npm --prefix frontend run smoke
```

Coverage:
- Public website routes: `/`, `/pricing`, `/contact`, `/trial`, legal pages, 404.
- Login shell.
- Admin, student, and super-admin protected shells redirect unauthenticated users.

If the app is already running somewhere else:

```bash
SMOKE_BASE_URL=https://your-domain.example SMOKE_SKIP_WEBSERVER=true npm --prefix frontend run smoke
```

## Backup And Restore Verification

Install MongoDB Database Tools, then run:

```bash
BACKUP_SOURCE_URI="mongodb://source/getpay" \
BACKUP_RESTORE_URI="mongodb://restore/getpay_restore_verify" \
npm run verify:backup
```

Rules:
- `BACKUP_RESTORE_URI` must point to a disposable database.
- Never point restore verification at production.
- Run this before launch and after backup infrastructure changes.

## Error Tracking

Current branch adds provider-ready hooks:
- Backend logs unhandled rejection/exception events with release/provider metadata.
- Frontend captures global errors when `VITE_ERROR_TRACKING_ENABLED=true`.
- If a Sentry browser bundle is present on `window.Sentry`, frontend events are forwarded there.

Recommended production configuration:

```bash
APP_VERSION=2026.05.10
ERROR_TRACKING_PROVIDER=sentry
SENTRY_DSN=<backend-dsn>
OTEL_EXPORTER_OTLP_ENDPOINT=<collector-url-if-used>
VITE_APP_VERSION=2026.05.10
VITE_ERROR_TRACKING_ENABLED=true
```

Release gate:
- Trigger one test error in staging.
- Confirm it appears in the configured monitoring/logging system.
- Confirm the event includes release, path/request context, and stack trace.
