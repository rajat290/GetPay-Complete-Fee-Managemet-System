# Observability and Backups

This document defines the minimum production operations baseline for GetPay Education.

## Health Endpoints

- `/api/health`: general service metadata for humans and support checks.
- `/api/health/live`: process liveness. Use this to confirm the Node process is alive.
- `/api/health/ready`: dependency readiness. Use this for load balancer and deployment checks.

`/api/health/ready` returns HTTP 503 when MongoDB is not connected. Deployment platforms should avoid sending traffic to instances that are not ready.

## Logging

- Use `LOG_FORMAT=json` in production.
- Use `LOG_LEVEL=info` for normal production.
- Use `LOG_LEVEL=debug` only during short investigations.
- Search logs by `requestId` when debugging a user or payment issue.

Sensitive keys such as passwords, tokens, authorization headers, secrets, cookies, and API keys are redacted by the structured logger.

## Backups

Preferred production setup:
- MongoDB Atlas or a managed MongoDB provider with automated backups enabled.
- Daily backups at minimum.
- Manual snapshot before migrations or bulk data changes.
- Restore rehearsal on staging before paid pilots.

Manual backup helper:

```bash
npm --prefix backend run backup:mongo:dry-run
npm --prefix backend run backup:mongo
```

The backup helper requires `MONGODB_URI` and the `mongodump` binary on the host. Set `BACKUP_DIR` to control the local archive directory, then move archives to restricted object storage.
