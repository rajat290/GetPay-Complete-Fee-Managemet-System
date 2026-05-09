# Operations Runbook

This runbook is the first production operations checklist for GetPay Education.

## Daily Checks

- Open `/api/health` and confirm `status: ok`.
- Check application logs for authentication, payment, webhook, and billing lifecycle errors.
- Review Super Admin dashboard for suspended, past-due, and trial institutions.
- Review Super Admin lead inbox for new trial, demo, contact, and support requests.

## Release Checklist

- Pull latest `master`.
- Run `npm run verify:release`.
- Confirm backend `.env` passes `npm --prefix backend run check:env`.
- Confirm Razorpay test/live keys match the target environment.
- Confirm `CORS_ORIGIN` and `FRONTEND_URL` point to the deployed frontend.
- Seed or verify the Super Admin account.
- Confirm `/api/health` after deployment.

## Incident Response

For payment mismatch, duplicate payment, or webhook issues:
- Freeze the affected institution in Super Admin if money movement must pause.
- Review payment events and reconciliation report.
- Check Razorpay dashboard for gateway state.
- Preserve logs and request IDs before making manual corrections.

For account compromise:
- Disable logins or freeze the institution.
- Force password change for affected admins.
- Review audit logs and impersonation logs.
- Re-enable access only after owner verification.

For expired subscription disputes:
- Set subscription to `past_due` or `paused`.
- Use grace period controls where appropriate.
- Record any manual invoice/payment action in Super Admin.

## Backup Guidance

- Schedule automated MongoDB backups before production launch.
- Keep at least daily backups for operational data.
- Test restore on staging before relying on backups.
- Never test restore directly on production.
