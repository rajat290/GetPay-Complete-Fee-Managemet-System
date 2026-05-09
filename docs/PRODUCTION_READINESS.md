# Production Readiness

Phase 8 turns GetPay Education from a feature-complete SaaS into a deployable product.

## Current Release Gates

Run all local gates:

```bash
npm run verify:release
```

This runs:
- backend environment validation
- backend Jest tests
- frontend ESLint
- frontend production build

GitHub Actions also runs backend env validation, backend tests, frontend lint, and frontend build for `master`/`main` pull requests.

## Deployment Baseline

- Backend must expose `/api/health`.
- Backend must expose `/api/health/live` for process liveness.
- Backend must expose `/api/health/ready` for traffic readiness.
- Production env must pass `npm --prefix backend run check:env`.
- `NODE_ENV=production` must be set in production.
- `JWT_SECRET` must be strong and private.
- Razorpay keys must be environment-specific.
- `CORS_ORIGIN` must include only trusted frontend domains.
- `FRONTEND_URL` must match the deployed frontend.

## Before Paid Pilots

- Configure automated database backups.
- Configure log retention and request ID search.
- Configure deployment health checks against `/api/health/ready`.
- Configure Razorpay webhook secret and test webhook delivery.
- Create a staging environment.
- Seed one Super Admin account.
- Run at least one full payment reconciliation rehearsal.
- Review Terms, Privacy, and Refund pages with a legal reviewer.

## Remaining Phase 8 Work

- Add API smoke tests for deployed staging.
- Add frontend route smoke tests.
- Add monitoring/error tracking integration.
- Add incident templates for payment, auth, and tenant-isolation issues.
