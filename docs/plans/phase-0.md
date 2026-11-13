# Phase 0: Setup

## Scope

- Git, `.gitignore`, `.env.example`, `README.md`, push to the private GitHub repo.
- pnpm workspace: `apps/coparent`, `packages/core`, `packages/ui`, `supabase/`.
- SvelteKit app as a client-side SPA (`adapter-static`, fallback `index.html`, no server code).
- Tailwind CSS 4 with tokens in `packages/ui/src/lib/theme.css`.
- Navigation shell with five tabs: Today, Calendar, Messages, Money, Kids. Phone first (360 px).
- Checks: Prettier, ESLint, svelte-check and `tsc` (strict), Vitest, Playwright, Supabase database tests.
- Supabase local config (`supabase/config.toml`) and a smoke test for `pnpm db:test`.

## Tables and policies

None in Phase 0. The first tables, with RLS and cross-space tests, come in Phase 1.

## Screens

Five placeholder pages behind the tab bar. Today shows the date in SA format.

## Tests

- `packages/core`: rand, date and time formatting.
- `apps/coparent`: a component test (PageHeader) and a unit test (APP_NAME).
- Playwright: all five tabs open on a 360 px screen, and a deep link loads through the SPA fallback.
- Database: smoke test that the `public` schema exists.

## Needs Eddie

- Install Docker Desktop (or choose a hosted dev project instead).
- Run the app and checks once on Windows.
- Agree the first commit going onto `main`.

## Done when

The empty app runs in the browser, all checks pass, and the first commit is on GitHub.
