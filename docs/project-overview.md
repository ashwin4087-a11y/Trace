# Project overview

AUREX LMS is a workshop portal for lifelong learning.

- An administrator manages platform settings, organizations, departments, users, and organizer accounts.
- An organizer creates workshops, sessions, materials, assessments, attendance, announcements, and certificates for workshops they own.
- A participant discovers workshops, registers, attends sessions, and keeps a skill passport.

A certificate is issued only after the API recalculates session attendance and finds it is at least 90 percent. The public verification page reads `/api/certificates/verify/:certificateId`.

Languages supported in profiles, workshops, and the interface are English, Tamil, and Tamil + English.
