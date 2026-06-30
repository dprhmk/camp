# Deployment

Production runs on **Vercel** (Next.js host) with a **Neon** Postgres database
and **Vercel Blob** for member-photo storage. All three are on free tiers.

| | |
|---|---|
| **Live URL** | https://camp-khaki-five.vercel.app |
| **Vercel project** | `dprhmks-projects/camp` |
| **Database** | Neon Postgres (project on neon.tech) |
| **Photo storage** | Vercel Blob store `camp-photos` (public) |

Demo accounts (from `prisma/seed.ts`):

| Role | Email | Password |
|------|-------|----------|
| Super-admin | `admin@camp.local` | `admin12345` |
| User | `user1@camp.local` … `user5@camp.local` | `user12345` |

## How it's wired

- `prisma/schema.prisma` datasource `provider = "postgresql"` (Postgres
  everywhere — prod and local dev).
- `package.json` `postinstall: prisma generate` so Vercel's build always has a
  fresh Prisma client.
- `src/app/api/upload/route.ts` stores photos in Vercel Blob when
  `BLOB_READ_WRITE_TOKEN` is set (prod), and falls back to `./public/uploads`
  on disk locally.
- Production env vars live in the Vercel project (Settings → Environment
  Variables): `DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`
  (the Blob token was injected automatically when the store was linked).

Secrets are **not** committed: `.env`, `.env*.local`, and `.vercel/` are
gitignored.

## Prerequisites for redeploying

```bash
npm i -g vercel          # Vercel CLI
export VERCEL_TOKEN=...   # a token from vercel.com/account/settings/tokens
export VSCOPE=dprhmks-projects
```

The repo is already linked (`.vercel/` exists locally). On a fresh machine run
once:

```bash
vercel link --yes --project camp --scope=$VSCOPE --token=$VERCEL_TOKEN
```

## Redeploy after a code change

```bash
vercel deploy --prod --yes --scope=$VSCOPE --token=$VERCEL_TOKEN
```

That uploads the working tree, builds on Vercel, and promotes to production at
the URL above.

> GitHub auto-deploy is **not** connected. To enable "push to deploy": install
> the Vercel GitHub App on `dprhmk/camp` and connect it in the Vercel project's
> Git settings. Then `git push` to `main` deploys automatically.

## Apply a database schema change

After editing `prisma/schema.prisma`, push the change to Neon, then redeploy:

```bash
# Uses DATABASE_URL from .env (the Neon prod DB).
npx prisma db push
vercel deploy --prod --yes --scope=$VSCOPE --token=$VERCEL_TOKEN
```

This project uses `prisma db push` (schema-sync), not `prisma migrate`. The
`prisma/migrations/` folder is SQLite-era history kept for reference only.

## Re-seed demo data

⚠️ Destructive — wipes and recreates the demo camp.

```bash
npx prisma db seed
```

## Local development

`.env` ships pointing at the **production** Neon database, so `npm run dev`
works out of the box — but it shares prod data, and `npm run db:reset` would
wipe production. For isolated local work, create a Neon **branch** (Neon
dashboard → Branches → New branch) and put its connection string in `.env`.

```bash
npm run dev          # http://localhost:3000
```
