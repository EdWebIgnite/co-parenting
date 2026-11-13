# Co-parenting app

A co-parenting app for separated parents in South Africa, with Cooperative and High-conflict modes on one engine. The first version runs in the browser and is designed for phone screens. The full brief and working rules are in [CLAUDE.md](CLAUDE.md).

## Layout

```
apps/coparent/     SvelteKit app (client-side SPA)
packages/core/     Shared domain logic, no co-parenting words
packages/ui/       Shared Svelte components and the theme
supabase/          Migrations, Edge Functions and database tests
docs/              Plans, decisions and progress
```

## What you need

- Node.js 22 or newer
- pnpm 10 (`corepack enable` sets it up)
- Docker Desktop, for the local Supabase database

## Install

```
pnpm install
pnpm --filter coparent e2e:install
copy apps\coparent\.env.example apps\coparent\.env
```

## Run

```
pnpm dev
```

Open http://localhost:5173. See CLAUDE.md section 14 for every command.
