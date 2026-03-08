# Quit Interview (V1)

Public-read, verified-anonymous quit review platform with moderation-first publishing.

## Stack

- Next.js (App Router)
- Prisma ORM
- Postgres
- Vitest

## Setup

1. Copy `.env.example` to `.env` and set your Postgres URL.
2. Install dependencies:
   - `npm install`
3. Start Postgres (Docker option):
   - `docker compose up -d`
   - This uses [`docker-compose.yml`](/Users/stark/Documents/my project/quit-interview/docker-compose.yml) and binds Postgres to `localhost:5432`.
3. Run Prisma:
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init`
4. Seed demo data:
   - `npx tsx prisma/seed.ts`
5. Start app:
   - `npm run dev`

## Troubleshooting Database Connection

If you see:

`Can't reach database server at localhost:5432`

- Ensure Postgres is running.
- If you are using Docker:
  - `docker compose up -d`
  - `docker compose ps`
- If Postgres runs on a different host/port, update `DATABASE_URL` in `.env`.
- After DB is reachable, rerun:
  - `npm run prisma:migrate -- --name init`

## Key API Endpoints

- `POST /api/auth/start`
- `POST /api/auth/complete`
- `POST /api/companies`
- `GET /api/companies`
- `GET /api/companies/:slug`
- `POST /api/verifications/start`
- `POST /api/verifications/complete`
- `POST /api/interviews`
- `GET /api/interviews`
- `GET /api/interviews/:id`
- `POST /api/interviews/:id/company-response`
- `POST /api/reports`
- `GET /api/moderation/cases`
- `POST /api/moderation/cases/:id`
- `POST /api/moderation/companies/merge`
- `POST /api/moderation/company-claims`
- `POST /api/moderation/roles`

## Auth Behavior (V1)

Magic link auth endpoints return a dev link/token. Wire email provider in production.

## Notes

- All interviews and company responses are created as `pending` and require moderation approval before public visibility.
- `EmploymentVerification` remains private and is not returned in public endpoints.
- Moderation audit is append-only via `ModerationEvent` records.
