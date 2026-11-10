# PostgreSQL Backend Handoff

The frontend currently uses local browser persistence for demonstration. `database/schema.sql` provides a normalized PostgreSQL starting point for the VS Code backend.

## Recommended server boundary

Use a server framework such as Express, NestJS or Next.js API routes. The React client must never connect directly to PostgreSQL.

Core endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/me
GET    /api/farms
POST   /api/farms
GET    /api/farms/:farmId/fields
POST   /api/livestock
POST   /api/soil-tests
POST   /api/inventory
POST   /api/harvests
GET    /api/market/listings
POST   /api/orders
GET    /api/admin/users
GET    /api/admin/audit-logs
```

## Security requirements

- Hash passwords with Argon2id or bcrypt; never store plain passwords.
- Use short-lived access tokens plus rotated, httpOnly secure refresh cookies.
- Authorize every resource server-side by role and ownership.
- Validate requests with a schema validator and use parameterized queries/ORM.
- Rate-limit authentication and upload endpoints.
- Restrict uploads by MIME type, size and malware scanning.
- Encrypt connections with TLS and use an encrypted managed disk.
- Write append-only audit events for authentication and sensitive changes.
- Keep `DATABASE_URL` and provider credentials in environment variables.
- Back up daily, retain multiple restore points, and test restoration.

## Replacing local persistence

`usePersistentRecords` in `src/App.tsx` is the intentional frontend seam. Replace its localStorage reads/writes with typed API calls. Keep loading, empty, success and error states, and invalidate affected queries after mutation.

## Real-time updates

Use Server-Sent Events or WebSockets for alerts, order status and admin activity. PostgreSQL `LISTEN/NOTIFY` may signal the application server, but clients should connect to the application server rather than directly to the database.
