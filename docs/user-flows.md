# User flows

## Participant certificate

1. Register and verify email.
2. Save an academic profile so recommendations can match domain, department, interests, and language.
3. Register for a published workshop before the deadline and while capacity remains.
4. Open session meeting links and check in with the organizer's QR code, or be marked manually.
5. Request a certificate. The API counts present marks against non-cancelled sessions.
6. Below 90%, the API returns `ATTENDANCE_BELOW_THRESHOLD` and writes nothing.
7. At or above 90%, it stores a unique certificate code, writes a PDF, and opens `/verify/{certificateId}`.

## Organizer workshop

1. An administrator creates the organizer account.
2. The organizer saves a draft, adds sessions, and publishes.
3. Publishing creates the workshop community and notifies participants whose profile score is at least 15.
4. The organizer marks attendance and can generate a certificate for a confirmed participant only after the same 90% check.

## Administrator

1. Sign in.
2. Create organizations, departments, and organizers.
3. Review audit logs and platform analytics.
4. Adjust the certificate threshold or turn on maintenance mode.
