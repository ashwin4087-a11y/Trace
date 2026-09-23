# System architecture

```text
Browser (React, Vite, TanStack Query)
        │  /api  via Vite proxy in development
        ▼
Express API (TypeScript)
        │
        ├── Prisma → PostgreSQL
        ├── Local disk → public/uploads, public/certificates
        ├── SMTP when EMAIL_HOST is set, otherwise a log file
        └── BullMQ when REDIS_URL is set, otherwise inline jobs
```

Controllers validate input and call services. Services own transactions and business rules. React pages do not query the database.

Authorization is enforced again on every protected route. Route guards in the browser only choose which screens to show.

Module folders under `backend/src/modules` match business domains: auth, users, workshops, registrations, attendance, certificates, notifications, communities, and analytics.
