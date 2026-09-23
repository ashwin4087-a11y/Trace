# RBAC matrix

Roles are `ADMIN`, `ORGANIZER`, and `PARTICIPANT`. Permissions are stored in `Role` and `Permission` and checked by `requirePermission`.

| Permission | Admin | Organizer | Participant |
| --- | --- | --- | --- |
| user.read / user.write / user.suspend | yes | no | no |
| organizer.create | yes | no | no |
| organization.write | yes | no | no |
| role.write | yes | no | no |
| workshop.create / workshop.publish | yes | yes | no |
| workshop.read.all | yes | no | no |
| registration.manage | yes | yes | no |
| attendance.write | yes | yes | no |
| certificate.generate | yes | yes | own certificate only, still checked server-side |
| announcement.write | yes | yes | no |
| settings.write / audit.read | yes | no | no |
| analytics.read / report.export | yes | yes | own analytics only |
| community.moderate | yes | yes | no |

An organizer who calls a workshop, session, attendance, or certificate route for a workshop they do not own receives `403 FORBIDDEN`.
