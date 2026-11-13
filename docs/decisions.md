# Decisions

Every decision made while building, newest at the bottom. Format: date, decision, reason.

## 13 Nov 2026 (Phase 0)

- **Use the existing private repo `EdWebIgnite/co-parenting`** instead of creating `coparent-app` with `gh repo create`. Reason: the repo was already created and is private.
- **Versions at setup**: SvelteKit 3.2, Svelte 5.57 (runes forced on), Vite 8, Tailwind CSS 4.3, TypeScript 6, Vitest 4, Playwright 1.65, Supabase CLI 3.1, supabase-js 2.119. Reason: latest stable at the time. TypeScript 7 is out, but `typescript-eslint` does not support it yet, so we stay on 6.
- **Project created with the official `sv create`** (minimal template, TypeScript, Prettier, ESLint, Vitest, Playwright, Tailwind, adapter-static). Reason: gets the current SvelteKit 3 config right instead of guessing it.
- **SPA fallback page is `index.html`**, with `ssr = false` and `prerender = false` in the root layout. Reason: nothing is prerendered, and `index.html` is what Capacitor loads later.
- **Environment variables are declared in `apps/coparent/src/env.ts`** with `defineEnvVars`, as public and static (inlined at build time), and read from `$app/env/public`. Reason: this is how SvelteKit 3 handles env vars, and a static SPA has no server to read them at run time. Both are optional for now so the empty shell runs before Supabase exists.
- **Supabase key name is `PUBLIC_SUPABASE_PUBLISHABLE_KEY`**. Reason: Supabase now calls the browser-safe key the publishable key. The service role key is never given a `PUBLIC_` name and never goes near the app.
- **Money is stored and passed around as whole cents** (integers). Reason: no rounding errors in splits and balances. `formatRand` in `packages/core` refuses fractions of a cent.
- **Dates and times are shown in `Africa/Johannesburg`**, whatever the device time zone. Reason: SA product, and both parents must see the same day.
- **Placeholder `APP_NAME` is "Co-parent (working name)"** in `apps/coparent/src/lib/config.ts` (open decision 1).
- **Tests can use an existing Chromium** through the optional `PLAYWRIGHT_CHROMIUM_PATH` variable. Reason: lets CI or a cloud machine reuse a preinstalled browser. On Eddie's machine it is not needed; run `pnpm --filter coparent e2e:install` once instead.
- **Supabase region (open decision 2)**: default is a European region, chosen when the hosted project is created. Privacy policy will need POPIA cross-border wording. LEGAL-REVIEW.
- **Web hosting (open decision 6)**: not needed yet, because nothing is deployed in Phase 0. The build is plain static files, so any static host works. Raise again when a shared test URL is needed.
- **Local database**: the repo is set up for local Supabase (Docker Desktop). If Docker gives trouble on Windows, switch to a hosted development project and record it here.
