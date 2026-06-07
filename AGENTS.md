<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Загінецька база — agent guide

Mobile-first PWA for running a Christian children's camp from a phone. UI is in
**Ukrainian**; every repo artefact (code, comments, commits, docs) is **English**.
Human setup lives in [README.md](README.md) — read it first.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · SQLite (dev) /
Postgres (prod) · Server Actions + Zod · Tailwind v4 + a small custom UI kit
(Radix only for dialogs) · Vitest.

## Where things live

```
prisma/schema.prisma     data model (Camp → Squad → Member, ScheduleEntry, User)
prisma/seed.ts           demo data (npm run db:seed)
src/lib/
  scoring/               PURE, TESTED scoring + balanced team distribution
  validation.ts          Zod schemas shared by client & server (single source)
  enums.ts               enum-like values + Ukrainian labels (SQLite has no enums)
  session.ts auth.ts     custom JWT session (jose) + bcrypt + guards
  rbac.ts                can() / canManageSquad() / canManageMember()
  camp.ts                active-camp scoping (requireActiveCamp)
  actions/               server actions — one file per domain area
src/app/(app)/           authenticated screens (each: page.tsx + *-client.tsx)
src/components/ui|layout|form   the UI kit and app chrome
src/proxy.ts             auth gate (Next 16 renamed "middleware" → "proxy")
```

## Conventions (follow these)

- **Mutations = server actions** in `src/lib/actions/`, validated with a Zod schema
  from `validation.ts`. Return `ActionState` (`{ ok, message, fieldErrors }`); never
  throw to the user. `revalidatePath` what changed.
- **Server components** fetch data and pass plain serialisable props to small
  `"use client"` islands. Don't make a whole page a client component.
- **Permissions are about action SCOPE, not hiding fields.** Anyone who may edit a
  member sees all ~70 profile fields. Always gate actions with `rbac.ts`, not the UI.
- **Camp is the root.** Every query is scoped by the active camp — start camp-bound
  pages/actions with `requireActiveCamp()`. Never mix data across camps.
- **Enum-like fields are strings** (SQLite limitation). Add values + labels to
  `enums.ts`; validate with the matching Zod field.
- **Scores are derived, not entered.** `computeScores()` runs on every member save;
  squad totals are cached aggregates recomputed via `src/lib/aggregates.ts`.
- Dialog forms close on success via `useDialogAction` (no setState-in-effect — ESLint
  rule `react-hooks/set-state-in-effect` is an error here).
- Large tap targets, clear empty/loading/error states, confirm before destructive acts.

## Deliberate decisions (don't "fix" these without reason)

- **Custom auth**, not Auth.js — accounts are admin-created, no open registration.
- **Prisma pinned to 6** — v7 forces driver adapters + `prisma.config.ts`.
- **SQLite for dev**; switch to Postgres for prod by changing only the datasource
  `provider` in `schema.prisma` (no model changes).
- **Photos** stored in `public/uploads` in dev (`src/app/api/upload`). For prod swap
  that one handler for Vercel Blob / R2.

## Verify before declaring done

```
npm test          # scoring unit tests (17)
npm run typecheck
npx eslint .      # must be clean
npm run build
```

## Open question to confirm with the customer

`residenceType` options in `enums.ts` (У корпусі / У наметі / Удома) are a guess.
