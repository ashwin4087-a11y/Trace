# Database schema

PostgreSQL is accessed only through Prisma. The schema file is `database/prisma/schema.prisma`.

Core relationships:

```text
Organization → Department → User
User → AcademicProfile, UserInterest, UserSkill
User (organizer) → Workshop → WorkshopSession
Workshop → Registration → Order → Payment
WorkshopSession → Attendance
User + Workshop → Certificate → CertificateVerification
Workshop → Community → Post → Comment
LearningPath → LearningPathWorkshop → Workshop
```

Indexes cover email, role and status, workshop status and domain, registration uniqueness per user and workshop, attendance uniqueness per session and user, and certificate codes.

`Payment` stores provider, provider reference, amount, and status. It has no card number, CVV, or expiry fields.

Apply the schema with:

```powershell
npm run db:migrate --prefix backend
```
