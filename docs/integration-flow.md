# Integration flow

```text
React page
  → frontend/src/services/*.service.ts
  → Axios /api
  → Express router
  → Zod validation
  → auth and RBAC middleware
  → service
  → Prisma
```

External systems sit behind providers:

- `backend/src/integrations/email`
- `backend/src/integrations/payments`
- `backend/src/integrations/storage`
- `backend/src/integrations/meetings`
- `backend/src/integrations/qr`

Replacing a provider should not require changes in page components.
