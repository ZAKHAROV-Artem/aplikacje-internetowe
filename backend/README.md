# CRM Backend

## Quick start

1. Install dependencies
   - `npm install`
2. Set environment variables (see below)
3. Database (Prisma)
   - If you have migrations: `npx prisma migrate dev`
   - Generate Prisma client (if needed): `npx prisma generate`
4. Run the server
   - Development: `npm run dev`
   - Production: `npm start`

Server listens on `PORT` (defaults to `3005`). Health check: `GET /health`.

## Environment variables

Create a `.env` file in the project root and set:

```env
# Port for the Express server (default: 3005)
PORT=3005

# Base URL of the upstream HQ API (required for proxy routes)
# Example: https://hq.example.com/api
HQ_API_URL=

# Database connection string for Prisma (PostgreSQL, MySQL, etc.)
# Example (Postgres): postgres://user:password@localhost:5432/crm
DATABASE_URL=

# Twilio Verify (for phone verification)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

CUSTOMER_IO_TRACK_BASE=
ANALYTICS_ENABLED=true
```

Notes:

- `HQ_API_URL` is required for proxy endpoints under `/api/*`.
- `DATABASE_URL` is required for Prisma migrations and when modules begin persisting data.

## Current endpoints (minimal)

- `GET /health` — returns `{ status: "ok" }` when `HQ_API_URL` is configured.
- `GET /api/pickups` — proxies to HQ (optional `customerID` query).
- `POST /api/pickups` — proxies create to HQ.
- `GET /api/pickups/:id` — proxies fetch-by-id to HQ (if supported upstream).
- `POST /api/twilio/verify/send` — body: `{ to: "+123...", channel?: "sms" | "call" }` → sends code via Twilio Verify.
- `POST /api/twilio/verify/check` — body: `{ to: "+123...", code: "123456" }` → verifies code via Twilio Verify.

## Architecture and modules approach

We will keep a modular structure, but not one-module-per-database-model. Instead, we group by domain/feature so each module owns its routes, application logic, and data access. This aligns code with behaviors users care about, reduces cross-module churn, and improves cohesion.

- Previous approach in HQ: each model had its own module (per-table modules). This led to scattered logic across many tiny modules.
- New approach here: domain (bounded-context) modules. Examples of how we would map HQ concepts using this approach:
  - Scheduled shifts and roster: one `scheduling` module
  - Time approvals and clocked shifts: one `time-tracking` module

A typical domain module will include:

- HTTP layer (routes/controllers)
- Application/services layer
- Persistence adapters/repositories (Prisma)
- Shared types and validation

This structure keeps data, logic, and APIs for a feature close together, easing maintenance and evolution.

## Scripts

- `npm run dev` — start the server in development
- `npm start` — start the server in production
