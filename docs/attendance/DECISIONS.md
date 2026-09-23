# Attendance Verification Decisions

## Phase 1

- Attendance verification is additive and disabled by default with `ATTENDANCE_ENABLED=false`.
- `Attendance` remains the existing organizer/manual attendance result table. Phase 1 uses separate `AttendanceComputation` rows and later finalization will upsert outcomes into existing `Attendance` rows.
- Existing `PersonalQrToken`, `AttendanceMonitoringSession`, shared session QR, and legacy monitoring routes are intentionally untouched. `PersonalQrToken` currently returns plaintext tokens and should be reviewed separately; the new attendance gateway must never use it or include it in emails.
- The attendance token stores only a SHA-256 hash. Plaintext tokens are returned only to the caller that creates the QR/email payload and must never be logged.
- Attendance live sessions use a partial unique database index so each registration/session pair has at most one active live session. Takeover behavior is implemented in a later gateway phase.
- `attendanceRequired` defaults to `false`; existing certificate behavior remains unchanged when it is false. The existing 90% default remains outside the new attendance-required path; attendance-required workshops use their configured threshold.
- Automatic certificate issuance is separately gated by `ATTENDANCE_AUTO_ISSUE=false` and is not wired in Phase 1.
- Meeting passcodes are nullable and belong to `WorkshopSession`, alongside the existing session meeting URL. Exposure is handled in a later integration phase.

## Known Baseline Issues

- The existing Prisma client/build currently reports missing delegates for the legacy QR monitoring models even after generation because the local migration is not applied.
- The existing test suite has a pre-existing confirmed-participant meeting-link test failure.
- Existing user-service Prisma typing errors remain out of scope.
