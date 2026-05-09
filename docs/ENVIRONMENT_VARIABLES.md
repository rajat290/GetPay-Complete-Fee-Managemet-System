# Environment Variables

Use `backend/.env.example` and `frontend/.env.example` as the starting point for local setup. Production must not use placeholder values.

## Backend Required

- `NODE_ENV`: `development`, `test`, or `production`.
- `PORT`: API port, usually `5000` locally.
- `MONGODB_URI`: MongoDB connection string. `MONGO_URI` still works as a legacy alias.
- `JWT_SECRET`: JWT signing secret. Use at least 32 characters in production.
- `CORS_ORIGIN`: comma-separated frontend origins allowed to call the API.
- `FRONTEND_URL`: public frontend URL used in reset/invite links.

## Production Required

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## Recommended

- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `LOG_LEVEL`
- `LOG_FORMAT`

## Validation

Run this before deployment:

```bash
npm --prefix backend run check:env
```

The app also validates the backend environment at startup and exits early if production-critical variables are missing.
