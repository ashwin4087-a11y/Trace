# TRACE

> **Every learning experience leaves a trace.**

TRACE is a multilingual, multi-domain Workshop and Lifelong Learning Management Platform designed to connect learners with workshops, training programmes, academic and professional learning opportunities, and communities.

The platform manages the complete lifecycle of a learning opportunity:

**Discover → Register → Learn → Participate → Complete → Certify → Connect → Grow**

TRACE is designed to support **English and Tamil** experiences across **Engineering, Arts & Science, Tamil and language learning, interdisciplinary workshops, technical training, professional development, and other lifelong-learning activities**.

## Product Vision

TRACE brings workshop discovery, registration, live or hybrid session participation, learning resources, attendance, assessment, certification, notifications, communities, learning paths, and lifelong skill development into one unified ecosystem.

## Core Roles

### Admin
Controls the overall platform.

- Manage users, organizations, departments, organizers, settings, permissions, security, and audit records
- Create and manage organizer accounts
- Monitor platform-level activity

### Organizer
Creates and conducts learning programmes.

- Create, configure, preview, publish, manage, cancel, and archive workshops
- Add sessions, learning materials, activities, and assessments
- Manage meeting links and session information
- Publish announcements
- Record and correct attendance with authorization
- Monitor registrations, completion, assessments, certificate eligibility, and workshop analytics

### Participant
Consumes and participates in learning.

- Discover workshops through search, filters, and personalized recommendations
- Register or check out for workshops
- Access session schedules and meeting links
- Access learning materials, activities, and assessments
- Track attendance and progress
- Receive certificates when eligible
- Join communities and learning paths
- Build a persistent Skill Passport

## End-to-End Flow

```text
ADMINISTRATION
     ↓
Organizations + Departments + Organizers
     ↓
WORKSHOP CREATION
     ↓
Sessions + Materials + Activities + Assessment
     ↓
PUBLISH WORKSHOP
     ↓
DISCOVERY + PERSONALIZED RECOMMENDATION
     ↓
PARTICIPANT REGISTRATION / CHECKOUT
     ↓
REGISTRATION CONFIRMATION
     ↓
SESSION ACCESS + MEETING LINK
     ↓
LEARNING MATERIALS + ACTIVITIES + ASSESSMENT
     ↓
SESSION ATTENDANCE
     ↓
ATTENDANCE PERCENTAGE
     ↓
90% ATTENDANCE VERIFICATION
     ├── YES → CERTIFICATE → QR VERIFICATION
     └── NO  → COMPLETION RECORDED / CERTIFICATE NOT ELIGIBLE
     ↓
NOTIFICATION + SKILL PASSPORT + LEARNING PATH
     ↓
COMMUNITY ENGAGEMENT + NEXT LEARNING RECOMMENDATION
```

## Core Features

### Workshop Discovery
- Search by workshop title or topic
- Search by skill, academic domain, and department
- Filter by language, date, mode, price, certificate availability, and difficulty
- Tamil and English discovery
- Personalized recommendations

### Registration & Checkout
- Eligibility validation
- Capacity validation
- Registration deadline validation
- Duplicate-registration prevention
- Waitlist support
- Free workshop registration
- Paid workshop checkout
- Backend payment verification
- Order, payment, and transaction records

### Sessions & Meetings
- Multiple sessions per workshop
- Session title, date, start/end time, trainer, venue, materials, and status
- Google Meet, Zoom, or Microsoft Teams session URLs
- Optional recording URLs

### Learning
- PDF, PowerPoint, documents, videos, recordings, and external resources
- MCQ quizzes
- Assignments
- Practical activities
- Surveys
- Final assessments
- Question-and-answer activities
- Submission, score, and result tracking
- Progress tracking

### Attendance & Certification
Attendance is calculated at the session level.

```text
Attendance Percentage =
(Attended Sessions / Total Sessions) × 100
```

TRACE must enforce the **90% attendance requirement on the backend**.

- **≥ 90%** → Certificate Eligible
- **< 90%** → Certificate Not Eligible
- Eligibility is recalculated whenever authorized attendance changes
- Certificates include a unique certificate ID and QR verification
- Public certificate verification exposes participant, workshop, organizer/organization, completion information, certificate ID, issue date, and verification code

### Notifications
Event-based and personalized notifications can cover:

- New relevant workshop published
- Registration successful
- Payment successful
- Session reminders
- Workshop announcements
- Assessment availability
- Certificate generation
- Community activity
- Recommended learning opportunities

Notifications support **English, Tamil, or Tamil + English** according to user preference.

### Communities
Each workshop can have an associated community with:

- Posts
- Comments
- Questions
- Polls
- Resource sharing
- Organizer announcements
- Basic moderation
- Community membership

### Learning Paths
Learning Paths connect multiple workshops into a structured journey and track:

**Workshop A → Workshop B → Workshop C → Advanced Workshop → Skill / Certificate Progress**

### Skill Passport
A persistent record of learner development containing:

- Skill name
- Skill level
- Verified / unverified status
- Related workshops
- Certificates
- Evidence
- Skill history
- Learning progress

### Analytics & Reports
Participant, organizer, and platform analytics cover areas such as registrations, attendance, completion, assessments, certificates, skills, and engagement.

Reports can include:

- Registration reports
- Attendance reports
- Certificate reports
- Workshop reports
- Organizer reports
- User engagement reports
- CSV / Excel / PDF export

## Multilingual Experience

Tamil is treated as a first-class language throughout the experience.

TRACE supports:

- English UI
- Tamil UI
- Tamil + English bilingual UI
- Tamil workshop discovery
- Bilingual notifications
- Tamil-compatible search
- Tamil-compatible certificates and learning content where applicable

## Technology Architecture

### Frontend
- React
- TypeScript

### API / Backend
- Node.js
- Express
- TypeScript

### Data
- Prisma ORM
- PostgreSQL

### Supporting Services
- Email
- Object/file storage
- Payments
- Optional Redis for background jobs

### Authentication & Security
- Password hashing using bcrypt or Argon2
- JWT authentication
- Secure session / refresh handling
- Backend role-based access control
- Resource-level authorization
- Input validation
- Rate limiting
- Secure HTTP headers
- CORS configuration
- Protected administrative endpoints
- Audit logging
- No secrets committed to source code

> **Docker is not required for the current implementation.**

## Repository Structure

The source code follows a shared domain-based structure:

```text
trace/
├── docs/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── store/
│       ├── routes/
│       ├── types/
│       └── utils/
├── backend/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── shared/
│       ├── modules/
│       ├── integrations/
│       ├── jobs/
│       └── routes/
├── database/
│   ├── prisma/
│   ├── seed/
│   └── scripts/
├── tests/
├── public/
└── scripts/
```

## Core API Surface

```text
/api/auth/*
/api/users/*
/api/roles/*
/api/permissions/*
/api/organizations/*
/api/departments/*
/api/profiles/*
/api/workshops/*
/api/registrations/*
/api/checkout/*
/api/payments/*
/api/sessions/*
/api/learning/*
/api/activities/*
/api/assessments/*
/api/attendance/*
/api/certificates/*
/api/announcements/*
/api/notifications/*
/api/recommendations/*
/api/communities/*
/api/learning-paths/*
/api/skills/*
/api/analytics/*
/api/reports/*
/api/audit/*
/api/settings/*
```

## Design System

TRACE uses one shared visual language across participant, organizer, and admin experiences.

### Typography

| Use | Typeface | Weight |
|---|---|---:|
| Hero headlines | Cormorant Garamond | 500–600 |
| Workshop titles | Cormorant Garamond | 600 |
| Section headings | Manrope | 600–700 |
| Body text | Manrope | 400–500 |
| Buttons / navigation | Manrope | 600 |
| Metadata / labels | Manrope | 600 |
| Tamil literary headings | Noto Serif Tamil | 500–600 |
| Tamil UI / body | Noto Sans Tamil | 400–500 |

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#F7F9FC` | Application/page background |
| Surface | `#FFFFFF` | Cards, panels, forms, elevated content |
| Primary Text | `#172033` | Headings and main readable content |
| Primary Action | `#2563EB` | Buttons, links, active actions |
| Secondary Text | `#64748B` | Metadata and supporting text |
| Border | `#E2E8F0` | Cards, dividers, tables, inputs |
| Success | `#16A34A` | Success, eligible, completion |
| Warning | `#D97706` | Warnings and pending states |
| Error | `#DC2626` | Errors and critical validation |

### UI Principles

- Light `#F7F9FC` application background
- White content surfaces
- `#172033` primary text
- `#2563EB` primary actions
- Subtle borders and shadows
- Approximately 8px standard component radius
- Generous, consistent spacing
- Cormorant Garamond for high-impact editorial moments
- Manrope for operational UI
- Noto Serif Tamil for Tamil literary/editorial headings
- Noto Sans Tamil for Tamil interface/body
- One consistent visual system across all three roles

## MVP Priority

### Must Work

- Authentication
- RBAC
- Admin and organizer management
- Workshop creation
- Workshop discovery
- Registration
- Sessions
- Meeting links
- Learning materials
- Attendance
- 90% certificate eligibility
- Certificate generation
- Certificate verification
- Basic notifications

### Expand After Core Flow

- Personalized recommendations
- Communities
- Learning Paths
- Skill Passport
- Advanced analytics
- Advanced reports

## Product Differentiators

- Multilingual learning experience with Tamil and English support
- Multi-domain learning across Engineering, Arts & Science, Tamil/language, and interdisciplinary programmes
- Personalized workshop discovery and notifications
- Rule-based relevant-workshop recommendations
- Backend-enforced 90% attendance certification
- QR-enabled certificate verification
- Persistent workshop communities
- Lifelong Learning Paths
- Skill Passport with verified learning evidence
- Unified Admin, Organizer, and Participant experience

## Development Principle

TRACE is intended to be a **fully functional Workshop and Lifelong Learning Management Portal**, not a static website. The core product experience is:

**Discover → Register → Learn → Participate → Complete → Certify → Connect → Grow**
