# Team ownership

Three developers share this repository. Folders are named by business domain. Do not add personal or team-number directories.

## Developer A — identity and administration

- `backend/src/modules/auth`
- `backend/src/modules/users`
- `backend/src/modules/roles`
- `backend/src/modules/permissions`
- `backend/src/modules/organizations`
- `backend/src/modules/departments`
- `backend/src/modules/profiles`
- `backend/src/modules/settings`
- `backend/src/modules/audit`
- Frontend pages under `frontend/src/pages/auth` and `frontend/src/pages/admin`
- Shared auth middleware and the auth context

## Developer B — workshop delivery

- Workshops, registrations, checkout, payments, sessions
- Learning materials, activities, assessments
- Attendance and certificates
- Frontend pages under `frontend/src/pages/public` and `frontend/src/pages/organizer`
- Participant learning, session, attendance, assessment, and certificate pages

## Developer C — engagement and insight

- Notifications, recommendations, communities
- Learning paths, skill passport, analytics, reports
- Email, payment, storage, meeting, and QR providers
- Background jobs
- Participant notification, recommendation, community, learning-path, and skill pages

## Shared contracts

Changes to `database/prisma/schema.prisma`, `backend/src/app.ts`, `frontend/src/routes/AppRoutes.tsx`, and `frontend/src/services/api.ts` should be reviewed by the other developers before merge. Business rules for attendance and certificates stay in the backend services, not in page components.
