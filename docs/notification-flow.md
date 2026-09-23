# Notification flow

```text
Workshop published
  → enqueueWorkshopPublished
  → Redis queue when REDIS_URL is set
  → otherwise notifyWorkshopPublished runs immediately
  → active participants are scored
  → score >= 15 creates an in-app notification and an email
  → the same match is stored as a recommendation
```

Other notifications:

- Registration confirmed, including after a verified paid order
- Certificate issued
- Announcement to confirmed participants

Preferences on `NotificationPreference` can turn off email, in-app delivery, workshop alerts, session reminders, or certificate alerts.

Without SMTP, email content is printed and saved as JSON under `public/uploads`. That file is a development trace, not proof of delivery.
