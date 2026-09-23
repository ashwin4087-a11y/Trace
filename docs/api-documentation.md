# API documentation

Base URL: `http://localhost:4000/api`

Success responses use `{ success: true, data, meta? }`.
Failures use `{ success: false, error: { code, message, details? } }`.

Protected routes expect `Authorization: Bearer <accessToken>`. The refresh token is an httpOnly cookie on `/api/auth`.

## Routes

| Area | Method and path |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/forgot-password`, `/reset-password`, `GET /auth/me` |
| Users | `GET /users`, `POST /users/organizers`, `PATCH /users/:id`, `PATCH /users/:id/status` |
| Roles | `GET /roles`, `PUT /roles/:id/permissions` |
| Permissions | `GET /permissions` |
| Organizations | `GET/POST /organizations`, `PATCH/DELETE /organizations/:id` |
| Departments | `GET/POST /departments`, `PATCH/DELETE /departments/:id` |
| Profiles | `GET/PUT /profiles/me` |
| Workshops | `GET /workshops`, `GET /workshops/:id`, `POST /workshops`, `PATCH /workshops/:id`, `POST /workshops/:id/publish` |
| Registrations | `POST /registrations`, `GET /registrations/me`, `GET /registrations?workshopId=` |
| Checkout | `POST /checkout` |
| Payments | `GET /payments/:orderId`, `POST /payments/:orderId/verify` |
| Sessions | `GET /sessions?workshopId=`, `POST /sessions`, `POST /sessions/:id/qr` |
| Learning | `GET/POST /learning`, `POST /learning/upload` |
| Activities | `GET/POST /activities`, `POST /activities/:id/submissions` |
| Assessments | `GET/POST /assessments`, `POST /assessments/:id/submissions` |
| Attendance | `POST /attendance`, `POST /attendance/qr`, `GET /attendance/workshops/:workshopId/summary` |
| Certificates | `POST /certificates/workshops/:workshopId/generate`, `GET /certificates/verify/:certificateId` |
| Announcements | `GET/POST /announcements` |
| Notifications | `GET /notifications`, `POST /notifications/:id/read` |
| Recommendations | `GET /recommendations/me` |
| Communities | `GET /communities`, `POST /communities/posts` |
| Learning paths | `GET /learning-paths`, `POST /learning-paths/:id/enroll` |
| Skills | `GET /skills/me`, `POST /skills/me` |
| Analytics | `GET /analytics/me`, `/analytics/organizer`, `/analytics/platform` |
| Reports | `GET /reports/:name` with `registrations`, `attendance`, `certificates`, `workshops`, `organizers`, `engagement` |
| Audit | `GET /audit` |
| Settings | `GET/PATCH /settings` |

Certificate verification is public. Other business routes require a verified active user and, where noted in the route file, a role and permission.
