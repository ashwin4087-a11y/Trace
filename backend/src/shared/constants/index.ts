export const DEFAULT_CERTIFICATE_MIN_PERCENT = 90;

export const SUPPORTED_LANGUAGES = ["EN", "TA", "EN_TA"] as const;

export const ACADEMIC_DOMAINS = [
  "ENGINEERING",
  "ARTS_SCIENCE",
  "TAMIL_LANGUAGE",
  "OTHER",
] as const;

export const USER_ROLES = ["ADMIN", "ORGANIZER", "PARTICIPANT"] as const;

export const WORKSHOP_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
  "ARCHIVED",
] as const;

export const PERMISSIONS = [
  { key: "user.read", description: "List and view users" },
  { key: "user.write", description: "Create and update users" },
  { key: "user.suspend", description: "Suspend user accounts" },
  { key: "organizer.create", description: "Create organizer accounts" },
  { key: "organization.write", description: "Manage organizations and departments" },
  { key: "role.write", description: "Change roles and permissions" },
  { key: "workshop.create", description: "Create and edit own workshops" },
  { key: "workshop.publish", description: "Publish workshops" },
  { key: "workshop.read.all", description: "Read every workshop regardless of owner" },
  { key: "registration.manage", description: "Manage workshop registrations" },
  { key: "attendance.write", description: "Record and correct attendance" },
  { key: "certificate.generate", description: "Generate certificates after eligibility checks" },
  { key: "announcement.write", description: "Publish announcements" },
  { key: "settings.write", description: "Update platform settings" },
  { key: "audit.read", description: "Read audit logs" },
  { key: "analytics.read", description: "Read analytics" },
  { key: "report.export", description: "Export reports" },
  { key: "community.moderate", description: "Moderate community posts" },
] as const;

export const ROLE_PERMISSIONS: Record<(typeof USER_ROLES)[number], string[]> = {
  ADMIN: PERMISSIONS.map((item) => item.key),
  ORGANIZER: [
    "workshop.create",
    "workshop.publish",
    "registration.manage",
    "attendance.write",
    "certificate.generate",
    "announcement.write",
    "analytics.read",
    "report.export",
    "community.moderate",
  ],
  PARTICIPANT: [],
};
