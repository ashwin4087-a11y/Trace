# Problem statement

Workshop attendance and certificates are often tracked in spreadsheets. Participants cannot see a single record of sessions, materials, and verified skills, and organizers cannot prove that a certificate was earned.

AUREX LMS keeps registration, session attendance, and certificate eligibility in one system. The attendance percentage is calculated on the server from session records:

```text
(attended sessions / total non-cancelled sessions) × 100
```

A value sent by the browser is never accepted as proof of eligibility.
