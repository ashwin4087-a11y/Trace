# Member 1 Final Testing & Demo

This script verifies that the Member 1 Platform, Identity & Administration workflows are complete end-to-end. 
PostgreSQL is currently unavailable, so these test steps should be executed once the database is provisioned.

## 1. Participant Workflow

1. **Register Participant:** Submit `POST /api/auth/register` with valid registration details.
2. **Validate Registration:** Verify that the backend successfully created an unverified user account.
3. **Verify Email:** Use the verification token and call `GET /api/auth/verify-email?token=...`.
4. **Login:** Submit `POST /api/auth/login` to authenticate and establish a session.
5. **Retrieve Authenticated User:** Call `GET /api/auth/me` and confirm it returns the user's base identity and `PARTICIPANT` role.
6. **Complete Profile:** Navigate to the participant profile page (or call `PATCH /api/profiles/me`) to complete basic info.
7. **Complete Academic Profile:** Include `domain`, `year`, `institution`, and `academicPreferredLanguage`.
8. **Save Skills & Interests:** Provide arrays of interests and skills. Confirm `GET /api/profiles/me` returns this data accurately.
9. **Logout:** Submit `POST /api/auth/logout`.

## 2. Admin Workflow

1. **Login as Admin:** Authenticate using an account with the `ADMIN` role.
2. **Open Admin Dashboard:** Navigate to `/admin/dashboard` in the frontend.
3. **View User Statistics:** Confirm that total users, organizers, organizations, and other telemetry render correctly using data from `/api/analytics/platform`.
4. **Create Organization:** Navigate to `/admin/organizations` and provision a new Organization.
5. **Create Department:** Create a new Department under the newly created Organization.
6. **Create Organizer:** Provision a new Organizer account through the `/admin/organizers` view.
7. **Assign Organization & Department:** Link the new Organizer to the Organization and Department.
8. **Activate Organizer:** Change the Organizer's status to `ACTIVE`.
9. **Verify Organizer Permissions:** Verify that the Organizer role permits them to access organizer-specific APIs (e.g., `/api/analytics/organizer`).
10. **Open Platform Settings:** Navigate to `/admin/settings`.
11. **Modify an Allowed Setting:** Update the Platform Name or toggle Maintenance Mode, then click Save. Refresh to verify persistence.
12. **Open Audit Logs:** Navigate to `/admin/audit-logs`. Verify that the previous actions (e.g., `LOGIN`, `CREATE_ORGANIZER`, `UPDATE_ORGANIZATION`) have been recorded safely with the correct actor.

## 3. Security & Authorization Test

1. Authenticate as a `PARTICIPANT`.
2. Attempt an unauthorized Member 1 operation, such as calling `PATCH /api/settings` or `GET /api/analytics/platform`.
3. Verify that the backend intercepts the request and responds with a `403 Forbidden` error. (Backend authorization must never depend only on frontend visibility.)
