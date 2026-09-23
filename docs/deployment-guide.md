# Deployment guide

This repository does not include Docker, Kubernetes, or container configuration.

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set long random `JWT_SECRET` and `JWT_REFRESH_SECRET`.
3. Set `NODE_ENV=production`, `FRONTEND_URL`, and `BACKEND_URL`.
4. Configure SMTP. Production must not rely on the log-only email path.
5. Leave `REDIS_URL` empty until a Redis instance is available.
6. Configure a real payment provider before enabling paid workshops. The dev provider is disabled when `NODE_ENV=production`.
7. Put `public/uploads` and `public/certificates` on durable disk, or replace `storage.provider.ts` with object storage.
8. Serve the Vite build and the API on one host, or set the refresh cookie for a shared parent domain. The development proxy is not used in production.
9. Run `npm run db:deploy --prefix backend`, then `npm run build` and `npm start --prefix backend`.

The API listens on `PORT` (default 4000).
