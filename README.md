# Загінецька база — Camp Management

Mobile-first PWA for running a Christian children's camp from a phone:
camps, squads, members (a single ~70-field profile), schedule, balanced team
generation, QR lookup and a contacts directory. Built for weak/unstable
on-site internet.

The UI is in Ukrainian; all code, comments and docs are in English.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Prisma 6** ORM. SQLite for local dev (zero setup); switch the datasource
  `provider` to `postgresql` for production — no model changes needed.
- **Server Actions + Zod** for mutations and shared client/server validation
- **Custom session auth** (jose JWT in an httpOnly cookie + bcrypt). Accounts
  are created by an admin — there is no open registration.
- **Tailwind CSS v4** + a small custom UI kit (Radix for dialogs)
- **Vitest** for the scoring/distribution module
- **PWA**: web manifest + a service worker (network-first pages with cache
  fallback → offline reads; writes require a connection, by design)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# .env already defaults to a local SQLite DB and a dev AUTH_SECRET

# 3. Create the database schema
npm run db:migrate      # applies migrations + generates the Prisma client

# 4. Load demo data (accounts, a camp, squads, members, schedule)
npm run db:seed

# 5. Run
npm run dev             # http://localhost:3000
```

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Super-admin | `admin@camp.local` | `admin12345` |
| Director | `director@camp.local` | `director123` |
| Leader | `leader1@camp.local` | `leader12345` |
| Leader | `leader2@camp.local` | `leader12345` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run unit tests (scoring + distribution) |
| `npm run db:migrate` | Apply migrations and regenerate the client |
| `npm run db:seed` | Reset and load demo data |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:studio` | Prisma Studio |

## Roles

Roles grant a **scope of actions** — they never hide profile sections. Anyone
who may edit a member sees and fills in all of that member's fields.

| Action | Super-admin | Director | Leader |
|--------|:-:|:-:|:-:|
| Create / delete camps, system settings | ✅ | — | — |
| Manage accounts | ✅ | — | — |
| Manage any squad / change leaders | ✅ | ✅ | own squad only |
| Generate teams | ✅ | ✅ | — |
| Edit schedule | ✅ | ✅ | view |
| Add / delete members | ✅ | ✅ | in own squad |

A leader is bound to a squad via `Squad.leaderUserId` (per season), so the same
account can lead different squads in different camps.

## Architecture notes

- **Camp = root.** Every domain row carries a `campId`; the active camp lives in
  a cookie and a scoping helper (`requireActiveCamp`) keeps seasons separate.
- **Scoring is an isolated, tested module** (`src/lib/scoring`). Weights live in
  `config.ts`; physical/mental scores recompute on every member save, and squad
  totals are cached aggregates. `distribute.ts` balances both headcount and
  scores via greedy longest-processing-time assignment.
- **Photos** are compressed client-side and stored under `public/uploads` in dev
  (`src/app/api/upload`). For production, swap that handler for Vercel Blob /
  Cloudflare R2 — nothing else changes.

## Production

Recommended: **Vercel + Neon (Postgres) + Vercel Blob**.

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Set `DATABASE_URL` (Postgres) and a strong `AUTH_SECRET`.
3. Replace the upload handler with a Blob/R2 implementation.
4. `npm run db:migrate` against the Postgres instance, then deploy.

## Assumptions to confirm

- `residenceType` options (`У корпусі` / `У наметі` / `Удома`) are a placeholder —
  confirm the real values with the customer.
- PWA icons use a single SVG; add PNG `192`/`512` icons for full store/Lighthouse
  compliance.
