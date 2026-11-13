-- Smoke test so `pnpm db:test` has something to run in Phase 0.
-- From Phase 1, every table gets a test proving a user in space A
-- cannot read or write space B (CLAUDE.md rule 7).
begin;
select plan(1);
select has_schema('public', 'public schema exists');
select * from finish();
rollback;
