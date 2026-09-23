# Member 1 Integration Contract

## Ownership Boundaries

**Member 1 owns:**
- Identity & Authentication
- Authorization (RBAC, Permissions)
- Users & Roles
- Organizations & Departments
- Organizer identity & Participant identity/profile
- Platform settings
- Audit logs

**Member 2 & 3 consumption:**
- Member 2 (Backend LMS) consumes Member 1 identity/context.
- Member 3 (Frontend LMS) consumes Member 1 identity/profile/context.
- **Strict Rule:** Downstream modules must NOT create a separate authentication system or directly mutate Member 1 identity tables. Use the provided API service contracts instead.

---

## Authentication APIs

The following APIs are available for authentication:

- `POST /api/auth/register` - Register a new participant.
- `POST /api/auth/login` - Authenticate and establish a session.
- `POST /api/auth/logout` - Terminate the session.
- `POST /api/auth/refresh` - Refresh access tokens.
- `GET  /api/auth/verify-email` - Verify email address.
- `POST /api/auth/forgot-password` - Request password reset.
- `POST /api/auth/reset-password` - Reset password.
- `GET  /api/auth/me` - Retrieve the authenticated user's identity/context.

### The `/api/auth/me` Contract

Downstream modules should rely on `GET /api/auth/me` as the definitive source of truth for the authenticated user's context.

**Provided Context (`PublicUser`):**
- `id`: string
- `email`: string
- `firstName`: string
- `lastName`: string
- `role`: string (e.g., ADMIN, ORGANIZER, PARTICIPANT)
- `status`: string (e.g., ACTIVE, SUSPENDED)
- `roles`: array of strings
- `permissions`: array of strings
- `organizationId`: string | null
- `departmentId`: string | null
- `preferredLanguage`: EN | TA | EN_TA

*Note: Member 2 and 3 must rely on this context to determine resource ownership and permissions. A manipulated frontend request must still be validated on the backend.*

---

## Participant Profile Contract

For personalization, Member 3 should fetch the full academic and participant profile from `GET /api/profiles/me`.

**Available Profile Information:**
- `user`: Base identity info, including `preferredLanguage`, `organization`, and `department`.
- `academicProfile`: Details including `domain` (e.g., ENGINEERING, ARTS_SCIENCE), `year` (e.g., FIRST, SECOND), and `preferredLanguage`.
- `skills`: Array of verified skills with `level` (e.g., BEGINNER, INTERMEDIATE) and `verified` status.
- `interests`: Array of string labels.

*Note: Do not duplicate these schemas in Member 2/3 modules. If a feature requires profile data, consume the `/api/profiles/me` endpoint.*
