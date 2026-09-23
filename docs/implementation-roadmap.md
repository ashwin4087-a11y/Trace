# Implementation roadmap

## Done in this repository

1. Project layout, environment example, and local Node.js scripts.
2. Prisma schema for the core entities.
3. Authentication, RBAC, organizations, departments, and profiles.
4. Workshop management, registration, sessions, and learning materials.
5. Attendance calculation, 90% certificate gate, PDF generation, and public verification.
6. Notifications, rule-based recommendations, communities, learning paths, skills, analytics, and CSV reports.
7. React screens for the public site, participant, organizer, and administrator.

## Next

1. Apply the first Prisma migration against a real PostgreSQL database and seed it.
2. Connect SMTP and confirm verification and reset mail.
3. Replace the dev payment provider before any paid workshop goes live.
4. Add Playwright coverage for the admin → organizer → participant → certificate flow.
5. Move private uploads and certificate PDFs to object storage.
6. Start the BullMQ worker in production only after Redis is available.

Do not add a machine-learning recommender until the rule-based scores have been used with real workshop data.
