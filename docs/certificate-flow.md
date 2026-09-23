# Certificate flow

```text
Workshop is published or completed
  → participant is confirmed
  → attendance summarized from Attendance rows
  → percentage >= PlatformSetting.certificateMinPercent (default 90)
  → unique certificate code
  → PDF in public/certificates
  → QR encodes {FRONTEND_URL}/verify/{certificateCode}
  → public GET /api/certificates/verify/:certificateId
```

The percentage stored on the certificate is the value calculated during generation. A later correction to attendance does not rewrite an issued certificate.

Duplicate generation for the same participant and workshop returns the existing certificate.
