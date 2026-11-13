# CLAUDE.md

Instructions for Claude Code on this project. Read this file fully at the start of every session. It holds the working rules (sections 1 to 15) and the full feature list (section 16).

## 1. What we're building

A co-parenting app for separated parents in South Africa. One app, two modes on the same engine:

- **Cooperative**: for parents who get along. Feels like a calm family organiser.
- **High-conflict**: for parents who need distance and proof. Less contact, clear rules, and a record of everything.

The first version runs in the browser and is designed for phone screens. iOS and Android apps come later by wrapping the same code. A second product, a household manager app, will be built later on the same core (shared calendar, money, lists, documents, profiles). Every architecture choice must keep that reuse possible.

The app name is not chosen. Use the constant `APP_NAME` from one config file everywhere. Never hard-code a name.

## 2. Who you're working with

Eddie is the only developer. He works on Windows, builds with SvelteKit (Svelte 5 runes) and uses Claude Code in VS Code. He holds an LLB, so he will review legal wording himself. Keep explanations short and practical. Ask before making a decision that is hard to undo.

## 3. Source of truth

- Section 16 of this file lists every feature and marks it V1 or Later. Build V1 features only.
- If the rules and the feature list disagree, stop and ask Eddie.
- Record every decision you make in `docs/decisions.md` (date, decision, reason).
- Keep `docs/progress.md` current: what is done, what is in progress, what is next.

## 4. Tech stack

- **Frontend**: SvelteKit with Svelte 5 runes and TypeScript (strict mode).
- **Build mode**: client-side single-page app using `adapter-static` with an SPA fallback. No `+page.server.ts`, no form actions, no server-only SvelteKit code for business logic. This keeps a later Capacitor wrap for iOS and Android simple.
- **Backend**: Supabase (Postgres, Auth, Storage, Row Level Security, Edge Functions). All business rules that must be trusted live in Postgres (constraints, triggers, functions) or Edge Functions, never only in the browser.
- **Styling**: Tailwind CSS with design tokens in one theme file.
- **Tests**: Vitest for logic, Playwright for a few key user journeys, and database tests for Row Level Security.
- **Later, not now**: Capacitor wrap, push notifications, app lock with fingerprint or face, store billing.

Use the latest stable versions. Check the official docs for SvelteKit, Svelte and Supabase before using an API, because versions change often. Local Supabase needs Docker Desktop on Windows. If that causes trouble, use a hosted development project instead and say so in `docs/decisions.md`.

## 5. Project structure

Use a monorepo with pnpm workspaces:

```
apps/
  coparent/          SvelteKit app for this product
packages/
  core/              Domain logic and data access with no co-parenting words in it
  ui/                Shared Svelte components and the theme
supabase/
  migrations/        One file per schema change
  functions/         Edge Functions
  tests/             Row Level Security and database tests
docs/
```

Rules for reuse:

- `packages/core` holds spaces, members, roles, profiles, calendar, money, lists, documents, notifications and the event log. Nothing in it may mention co-parenting, custody, handovers or modes.
- Co-parenting features (care schedule, handovers, change requests, modes, journal, court export) live in `apps/coparent` and in tables prefixed `cp_`.
- The top-level entity is a `space` with a `kind` (`coparenting` now, `household` later). Never name it "family" or "couple" in code.

## 6. Data model outline

Start from this and refine it in each phase plan:

- `spaces` (id, kind, mode, created_at), `space_members` (space_id, user_id, role, status), `invites`
- `profiles` (children and other dependants) with child tables for allergies, conditions, medication, medical aid, doctors, visits, vaccinations, emergency contacts
- `events`, `event_recurrence`, `cp_care_schedules`, `cp_change_requests`, `cp_handovers`
- `messages`, `message_revisions`, `message_receipts`, `message_topics`
- `expenses`, `expense_splits`, `payments`, `maintenance_obligations`
- `documents` (metadata, with files in private Storage buckets)
- `cp_journal_entries` (private to the author)
- `event_log` (append-only, hash-chained)
- `consents` (who consented to what, when, and which policy version)

## 7. Rules that must never be broken

**Records**

1. Every create, edit, removal, schedule change, handover, expense and payment writes a row to `event_log`. This is identical in both modes.
2. `event_log` and `messages` are append-only. Revoke UPDATE and DELETE, and add triggers that reject them. An edit is a new row in `message_revisions`. "Remove from view" is a flag, never a delete.
3. Each `event_log` row stores the hash of the previous row in the same space plus its own SHA-256 hash, so an export can be verified.
4. All record timestamps come from the database server (`now()`). Never trust the browser clock for a record.
5. Either parent can export their space's full record at any time. The other parent is not told. Exports must keep working when a subscription lapses.

**Security and privacy**

6. Every table has Row Level Security on. A user can only reach rows in spaces they belong to. Journal entries are readable by their author only.
7. Write a database test for every table proving a user in space A cannot read or write space B.
8. The Supabase service role key never reaches the browser.
9. Files sit in private buckets and are served through short-lived signed URLs.
10. No live location tracking. The only location is a single reading taken when a parent taps "check in" at a handover, in High-conflict mode only.
11. Parents never see each other's phone number or email address inside the app.
12. No advertising or analytics scripts that receive child or message data. Ask Eddie before adding any third-party script.
13. Before any child data is saved, record a parent's consent in `consents`.
14. No child logins.

**Scope**

15. Do not build Later features, even if they look easy.
16. No AI calls anywhere in V1.

## 8. Modes

- `spaces.mode` is `cooperative` or `high_conflict`. The mode is chosen at sign-up.
- Any parent can switch to `high_conflict` immediately. Switching back to `cooperative` needs a request that the other parent accepts. In a solo space the single parent decides.
- The mode changes the interface and which features show. It never changes what is recorded.
- Define what each mode enables in one file, `apps/coparent/src/lib/modes.ts`. Components read from that file. Never write `if (mode === ...)` checks scattered through the UI.

## 9. Word check (replaces the AI tone check)

- Before a message sends in High-conflict mode, check the text against a word list on the device. Match whole words, ignore case, and cover English and Afrikaans swear words and insults.
- On a match, show: "Are you sure you want to send this?" with a second line, "Messages can't be edited or deleted after sending." Buttons: "Edit message" (default) and "Send anyway".
- It never blocks sending. It makes no network call. The warning itself is not logged.
- Keep the list in a database table so it can be updated without a release, cached in the browser, with a bundled fallback list.
- Controlled by a flag in `modes.ts`. Off in Cooperative mode by default.

## 10. Build phases

Work through one phase at a time. Do not start the next phase until Eddie says so.

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Setup | Git and a private GitHub repo (section 15), monorepo, SvelteKit app, Supabase project, Tailwind theme, lint, type check, tests, navigation shell with five tabs: Today, Calendar, Messages, Money, Kids | The empty app runs in the browser, all checks pass, and the first commit is on GitHub |
| 1. Accounts and spaces | Sign-up and sign-in, two-step login, create a space, pick a mode, invite a co-parent by link, solo use, child profiles (basics), consent record, `event_log` with hash chain | Two test parents can join one space, and the cross-space tests pass |
| 2. Calendar | Care schedule templates, events, SA school terms and public holidays, special-day rules, change requests, Today view, email reminders | A week on/week off schedule shows correctly for both parents, and a swap request works end to end |
| 3. Child info bank | Allergies, medical basics, medication, medical aid, doctors, visit log, vaccinations, emergency contacts, emergency card with PDF, day-to-day and school details, document vault | A parent can find an allergy and the last doctor visit in under ten seconds |
| 4. Messaging | Messages, topics, read receipts, attachments, Cooperative edit window, locked messages, word check, quiet hours, flood limit | Both modes behave as section 16 describes, and no message can be changed in the database |
| 5. Money | Expenses with receipts, splits, approve or query, balance, payments with proof, maintenance tracker, recurring costs, statements | The balance is right after a mix of expenses, queries and payments |
| 6. High-conflict pack | Schedule locked to the plan, handover check-in, late and missed log, strict expenses, private journal, court-ready PDF export, mode switching rules | An export for a date range verifies against the hash chain |
| 7. Launch prep | Subscriptions, privacy policy and terms, help page, testing with real parents, Capacitor wrap for the stores | Agreed with Eddie at the time |

**Milestone 1** is the end of Phase 4. At that point two real parents can use it in a browser for calendar, child info and messaging. Aim there first.

## 11. How to work

1. At the start of a phase, write `docs/plans/phase-N.md`: scope, tables and policies, screens, tests, and anything unclear. Wait for Eddie's go-ahead before writing code.
2. Every schema change is a new migration file. Never edit a migration that has been applied.
3. Write the Row Level Security policies and their tests in the same change as the table.
4. Put logic that can be tested without a browser (recurrence, split maths, balances, hash chain, word check) in `packages/core` with unit tests.
5. Follow the Git and GitHub rules in section 15. Do not deploy or create other cloud resources unless Eddie asks.
6. Ask before adding a paid service or a large dependency, and say why it's needed.
7. At the end of a phase, run lint, type check and all tests, update `docs/progress.md`, and give Eddie a short list of things to click through and check.
8. If a requirement is unclear, ask. Do not guess on anything that touches records, privacy or money.

## 12. Interface and wording

- Design for a phone screen first (360 px wide), then let it stretch for desktop. Large tap targets. Keep pages light, because mobile data is expensive in South Africa.
- Do not rely on browser-only features that would break inside a Capacitor wrap.
- Plain English with South African spelling. Short sentences. No em dashes. No jargon.
- Neutral, calm wording that never takes a side or blames a parent.
- Use South African legal terms: "care" and "contact", not "custody" and "access". Say "court-ready records", never "court-admissible".
- Rand amounts with the R symbol, dates as 13 Nov 2026, 24-hour time.
- Mark any legal text you draft (consent wording, privacy policy, terms, export certificate) with `LEGAL-REVIEW` so Eddie can check it.

## 13. Open decisions

Use the default in brackets, note it in `docs/decisions.md`, and raise it with Eddie when the phase reaches it.

1. App name (use `APP_NAME`).
2. Supabase region. Supabase has no African region, so data will sit overseas (default: a European region). The privacy policy needs cross-border transfer wording under POPIA.
3. Cooperative edit window (default: 5 minutes).
4. What a co-parent sees from before they joined a solo space (default: shared items yes, journal never).
5. Extra encryption for medical fields on top of database encryption (default: decide in Phase 3).
6. Web hosting for the app (default: decide in Phase 0).
7. Price and trial length (default: leave until Phase 7).
8. A family law attorney must check the "court-ready" wording, the consent flow and the record retention rule before launch. Flag this again in Phase 7.

## 14. Commands

Run these from the repo root.

| What | Command |
| --- | --- |
| Install | `pnpm install`, then once: `pnpm --filter coparent e2e:install` |
| Run the app | `pnpm dev` (http://localhost:5173) |
| Lint | `pnpm lint` |
| Type check | `pnpm check` |
| Unit and component tests | `pnpm test` |
| Browser journeys (Playwright) | `pnpm test:e2e` |
| Everything before a commit | `pnpm verify` (lint, type check, unit tests), then `pnpm test:e2e` |
| Start local Supabase | `pnpm db:start` (needs Docker Desktop running) |
| Stop local Supabase | `pnpm db:stop` |
| Run database tests | `pnpm db:test` |
| Create a migration | `pnpm db:migration <name>` |
| Reset the local database | `pnpm db:reset` |
| Production build | `pnpm build` (output in `apps/coparent/build`) |

## 15. Git and GitHub

The app is built and run locally. Git tracks every step, and a private GitHub repo is the off-machine backup.

**Setup in Phase 0**

1. Run `git init` with `main` as the default branch.
2. Before the first commit, create `.gitignore` covering `node_modules`, build output, `.svelte-kit`, `.env` and every `.env.*` file except `.env.example`, Supabase temp folders, logs and editor folders.
3. Create `.env.example` listing every variable name with no values. Real values go in `.env`, which is never committed.
4. Create a private repo and push the first commit: `gh repo create coparent-app --private --source=. --remote=origin --push`. If the GitHub CLI is missing or not signed in, stop and give Eddie the exact steps.
5. Add a short `README.md`: what the project is, how to install it and how to run it.

**Day to day**

- Work on one branch per phase, named like `phase-1-accounts`. Commit in small steps with clear messages that say what changed and why.
- Run lint, type check and tests before each commit. Do not commit code that fails them.
- Push the branch to GitHub at the end of every working session, so the backup is never more than a day old.
- When Eddie approves a phase, merge the branch into `main`, tag it (`phase-1-done`) and push the tag. Each tag is a known working point to roll back to.
- Never force-push and never rewrite history on `main`.

**Secrets and data**

- Never commit keys, passwords, tokens or the Supabase service role key. Check the staged files before every commit.
- If a secret is ever committed, stop and tell Eddie at once. The key must be replaced, because deleting it from the history is not enough.
- The repo stays private. Never change its visibility.
- No real people's data in the repo. Seed and test data use invented names only.

## 16. Feature list

Every feature, marked V1 or Later. Build V1 features only, in the phase order from section 10. Where a V1 feature needs a phone app (push alerts, fingerprint or face lock, offline access), build the browser version described in F8 and leave the rest for the Capacitor wrap.

### F1. How it fits together

- One family space holds the children, the calendar, messages, money and the child info bank. Both modes use the same data.
- The mode changes the look, the tone and which features show. It never changes what is recorded.
- A parent picks the mode at sign-up. Either parent can switch to High-conflict at any time. Switching back to Cooperative needs both to agree.
- One parent can use the app alone if the other won't join (solo use). Records start from day one and the other parent can join later.
- No child logins in V1. Parents hold all the information.
- The calendar, money, lists, documents and profiles are built as a shared core, so the household manager app can reuse them later.

### F2. Core features (both modes)

#### Setup and accounts

| Feature | What it does | When |
| --- | --- | --- |
| Sign-up and mode choice | Sign up with email or phone, then pick Cooperative or High-conflict | V1 |
| Invite co-parent | Invite by link, with no need to swap phone numbers | V1 |
| Solo use | One parent keeps the calendar, expenses and records alone until the other joins | V1 |
| Child profiles | Add each child once. Calendar, expenses and info all attach to the profile | V1 |
| Plan or court order upload | Store the signed parenting plan or court order and pin it as the reference | V1 |
| Family circle | Grandparents, a nanny or a new partner get limited access, such as calendar only | Later |

#### Calendar

| Feature | What it does | When |
| --- | --- | --- |
| Care schedule templates | Week on/week off, 2-2-3, alternate weekends, or a custom pattern | V1 |
| School terms and public holidays | SA school terms and public holidays preloaded | V1 |
| Holiday and special-day rules | Alternate Christmas, birthdays, Mother's Day and Father's Day | V1 |
| Events | School, sport, doctor and party events with a place and notes | V1 |
| Change requests | Ask to swap or change a day. The other parent accepts or declines | V1 |
| Handover reminders | Reminder before pick-up or drop-off, with the time and place | V1 |
| Today view | Home screen shows who has the children today and what's on | V1 |
| Calendar sync | Push the schedule to Google or Apple Calendar | Later |

#### Messaging

| Feature | What it does | When |
| --- | --- | --- |
| Parent-to-parent messages | In-app chat, so personal numbers stay private | V1 |
| Timestamps and read receipts | Sent and read times on every message | V1 |
| Attachments | Photos and documents | V1 |
| Topic threads | Keeps school, medical, money and schedule talk apart | V1 |
| Private notifications | Push alerts, with the option to hide message content on the lock screen | V1 |
| Voice notes | Recorded voice messages, stored like any other message | Later |

#### Money

| Feature | What it does | When |
| --- | --- | --- |
| Add an expense | Amount, category, child and a receipt photo | V1 |
| Split rules | Default split from the plan (50/50, 60/40), changeable per expense | V1 |
| Approve or query | The other parent approves or queries each expense | V1 |
| Running balance | Shows who owes whom | V1 |
| Mark as paid | Record a payment and attach proof of payment | V1 |
| Maintenance tracker | Monthly amount due, date paid, and any short or late payments | V1 |
| Recurring costs | School fees, medical aid and aftercare repeat automatically | V1 |
| Statements | Monthly or yearly statement as a PDF | V1 |
| Pay in the app | Settle a balance by card or EFT inside the app | Later |

#### Documents

| Feature | What it does | When |
| --- | --- | --- |
| Document vault | Birth certificate, ID, passport, medical aid card, school reports, plan or order | V1 |
| Expiry reminders | Reminder before a passport or other document expires | Later |

### F3. Child info bank

Each child gets one profile that both parents can open in seconds, so nobody has to remember an allergy or a medical aid number in a doctor's waiting room.

| Section | What it holds | When |
| --- | --- | --- |
| Basics | Full name, date of birth with the age worked out automatically, photo, school, grade, teacher | V1 |
| Allergies | Each allergy, the reaction it causes, and what to do | V1 |
| Medical basics | Blood type, weight for medicine doses, ongoing conditions and how they're managed | V1 |
| Medication | Medicine, dose, times, and who prescribed it | V1 |
| Medical aid | Scheme, plan, member number, main member and dependant code | V1 |
| Doctors | GP, paediatrician, dentist and specialists with contact details | V1 |
| Visit log | Date, doctor or hospital, reason, outcome, medicine given, follow-up date, who took the child, and the script or sick note attached. The last visit shows at the top | V1 |
| Vaccinations | Each vaccination with its date, plus a photo of the clinic card | V1 |
| Emergency contacts | People to call, in order | V1 |
| Emergency card | One screen with allergies, conditions, medication, blood type, medical aid and contacts. Works offline and can be sent to a school, carer or doctor as a PDF | V1 |
| Day-to-day details | Clothes and shoe sizes, dietary needs, bedtime routine, comfort items | V1 |
| School details | School contacts, timetable and extramurals | V1 |
| Medication reminders | Dose reminders with a "given" tick, so both homes know a dose was given and nobody doubles up | Later |

#### How it stays secure

- Encrypted in storage and in transit.
- App lock with a PIN, fingerprint or face.
- Every change is logged: who changed what, and when. In High-conflict mode the other parent is notified when medical info changes.
- Shared links to the emergency card expire, for example after 24 hours.
- Under POPIA, a child's information and health information both get extra protection. A parent's consent is recorded at sign-up before any child data is saved.

### F4. Cooperative mode

Built to feel like a calm family organiser, not a court tool. The goal is less admin and fewer forgotten things.

| Area | Feature | What it does | When |
| --- | --- | --- | --- |
| Messaging | Normal chat feel | Reactions, photos and quick replies | V1 |
| Messaging | Short edit window | Fix a typo within a few minutes. The message shows as edited and the original stays in the archive | V1 |
| Calendar | One-tap swaps | "Can you take Thursday?" with accept in one tap | V1 |
| Calendar | Shared events | Either parent adds school and sport events directly | V1 |
| Handover | Handover notes | Quick note for the other home: ate, slept, homework, medicine given | V1 |
| Handover | Packing list | Reusable checklist of what travels with the child | V1 |
| Money | Simple settle-up | Expenses under an agreed amount approve automatically. Settle the balance monthly | V1 |
| Lists | Shared to-dos | School forms, birthday gifts and uniform shopping, each assigned to a parent | V1 |
| Lists | Items between homes | Track things that move between houses, like a blazer or a tablet | Later |
| Moments | Photo sharing | Private album of the children that both parents add to | Later |
| Routines | Rules in common | Shared bedtime, screen time and homework rules so both homes match | Later |
| Decisions | Big decisions | Propose a decision (new school, braces), discuss it and record the outcome | Later |

### F5. High-conflict mode

Built for parallel parenting: less contact, clear rules and a record of everything.

| Area | Feature | What it does | When |
| --- | --- | --- | --- |
| Messaging | Locked messages | No editing or deleting. Sent, delivered and read times are shown | V1 |
| Messaging | Structured topics | Every message sits under a topic (schedule, medical, school, money) | V1 |
| Messaging | Word check | Checks a message for swear words and insults before sending and asks "Are you sure you want to send this?" No AI involved | V1 |
| Messaging | Quiet hours | Messages arrive only in set hours. A real emergency about the child can be flagged urgent | V1 |
| Messaging | Flood limit | Caps how many messages can be sent in a short time | V1 |
| Messaging | No presence | No "online" or "typing" indicators | V1 |
| Messaging | Incoming shield | Option to see a neutral summary of a hostile message first. The original stays in the archive | Later |
| Calendar | Schedule locked to the plan | The care schedule follows the plan or court order and can't be edited directly | V1 |
| Calendar | Formal change requests | Request with a reason. Accept or decline is recorded, and unanswered requests expire | V1 |
| Handover | Check-in | One tap at pick-up or drop-off records the time and a one-off location stamp | V1 |
| Handover | Late and missed log | Late arrivals and no-shows are recorded against the schedule | V1 |
| Money | Strict expenses | Receipt required. A dispute must state a reason. Nothing approves automatically | V1 |
| Journal | Private journal | Timestamped notes and photos that only you can see, and can export | V1 |
| Records | Court-ready export | PDF by date range and type, with page numbers, timestamps and a verification code | V1 |
| Access | Professional access | Read-only, time-limited access for your attorney, mediator or social worker | Later |
| Reports | Pattern summary | Counts of handovers kept, late payments and response times over a period | Later |
| Calls | Recorded calls | Voice or video calls logged or recorded with consent | Later |

### F6. Records and backup

Logging is identical in both modes, so a Cooperative family that turns sour already has a full record.

- Every message, edit, deletion, schedule change, handover, expense and payment gets a server timestamp and goes into a locked archive.
- In Cooperative mode a parent can fix a typo or remove a message from view. The original stays in the archive.
- Both parents are told at sign-up that everything is kept.
- Either parent can export the full record at any time without the other's permission. The other parent is not notified.
- Exports stay available if the subscription lapses or the other parent leaves.
- Each record carries a tamper check, so an attorney or a court can verify that an export hasn't been altered.
- Each account is tied to a verified email address and phone number, which helps prove who sent a message.
- Marketing wording: "court-ready records". Avoid "court-admissible" until a family law attorney signs off.

Why this design: in South Africa, electronic messages are already admissible under section 15 of ECTA. What a court weighs is how reliably the record was kept, whether it is intact, and who sent it. The archive is built to answer those three questions.

### F7. Safety and privacy (both modes)

- No live location tracking. The only location is a one-off stamp at a handover check-in, and only in High-conflict mode.
- Parents never need to share phone numbers or email addresses with each other.
- Two-step login and app lock.
- Lock-screen notifications can hide message content.
- Either parent can switch to High-conflict alone. Going back needs both.
- Flood limits and quiet hours stop the app being used to harass.
- A help page lists emergency and domestic violence support contacts for South Africa.
- POPIA: consent recorded at sign-up, a plain-language privacy policy, and data kept only as long as needed.
- Records one parent may need as proof are not wiped when the other parent deletes their account. An attorney must check this rule.
- No adverts and no selling of data.

### F8. Accounts, pricing and platforms

- One subscription per family. One parent pays and the other joins free.
- Target price: R49 to R79 per family per month, with a yearly option. To be tested.
- Free trial, length to be decided.
- The first version runs in the browser and is designed for phone screens. The iOS and Android apps follow from the same code.
- In the browser version, alerts go by email and in the app. Push alerts, app lock with fingerprint or face, and offline access to the emergency card arrive with the phone apps.
- Rand pricing, SA date formats and the SA school calendar.
- English at launch. Afrikaans and isiZulu Later.

### F9. Later versions (not in the tables above)

- Parenting plan builder that follows the topics in section 33 of the Children's Act: where the child lives, maintenance, contact, schooling and religious upbringing.
- Travel consent letter template for trips with one parent.
- Photo of a school notice turned into a calendar event.
- Child logins for teenagers, with a view of their own schedule.
- UK version, with local legal wording and pricing.
