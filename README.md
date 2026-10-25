# KnightLedger

A free civic quest board, repurposed on `feat/knightledger-quests`. The original `main`, production project and KnightLedger.com are preserved. This branch uses a separate Vercel project, private evidence store, and Postgres database.

## Run and review

Node 24. `npm ci`; copy `.env.example` to `.env.local`, configure secrets, then `npm run db:migrate`, `npm run dev`. `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` are the checks. Self-hosted Cormorant Garamond and Inter fonts; original heraldic SVGs; Natural Earth public-domain geography. No analytics or external font calls.

Public pages: Quest Board `/`, quest details `/quests/:id`, Hall `/knights`, petitions `/petitions`, and private `/ledger`. Operator desk: `/steward`. Use the `OPERATOR_SECRET` from the staging project's Vercel environment settings; never send it through a URL or commit it. Operator access is separate from anonymous passports.

## Architecture and persistence

One Next.js App Router / TypeScript / Node app, one Neon Postgres database, private Vercel Blob, one configurable AI Gateway model and its supported web-search tool. Real search is performed at runtime, not through the builder's ChatGPT accounts. Public-source fetches use HTTPS, reject internal networks and raw IPs, pin resolved public addresses, bound redirects, size and time. No private LEGION brain or personal-account integrations are deployed.

Authoritative tables: `kl_localities`, `kl_members`, `kl_sessions`, `kl_quests`, `kl_petitions`, `kl_jobs`, `kl_completions`, `kl_chronicles`, `kl_prompts`, `kl_runs`, `kl_audits`, `kl_evidence`, `kl_meta`. These use typed application records in JSONB. A revision row and PostgreSQL `kl_commit` function serialize mutations using optimistic revision checks and a short row lock. Unique indexes enforce passport recovery digest, distinct member/template credit, and one title per membership. Reads/writes currently load a small site's state; migrate to indexed per-record queries before sustained larger traffic. AI/network calls never hold a SQL transaction.

A submission is committed before background work starts. `after()` merely triggers work on an already durable database job. Scheduled reconciliation recovers pending jobs and expired leases. Jobs keep deadlines, attempts, source text, prompt version, reasons and outcomes. Failures stay visible, never become fake approvals.

## Publication and knighthood

Board windows are 00:00 / 12:00 UTC. Requests received at least two hours before a window target it (equality included); later requests target the following window. Target time is fixed on the receipt. Missed deadlines are retained and marked; approval delays keep the prior board. Each valid distinct locality petition receives its own research job and linked quest. Same-member exact pending duplicates reuse their receipt. No population supply cap.

The owner reviews finished cards and approves all/selected, edits, returns for research, or declines with a reason. Approval records the version and content hash. Substantive edits clear approval. Publication checks the exact hash and due time atomically. Initial Anywhere quests are authored seed content for this new preview; subsequent local quests require owner approval.

Proof is checked against each published standard by a bounded AI reviewer. Text-only proof is supported where proportionate. Accepted does not mean independently inspected. Code enforces ownership, duplicate evidence/template credit, frozen qualification targets and capacity.

Requirements freeze on first accepted completion: 3 distinct templates for localities with <50 members with accepted work, 5 at 50–249, 7 at 250+. Knight capacity is `max(3, ceil(qualified_local_members/10), titles_already_granted)`. Raw registrations do not expand capacity. One passport, one fixed home allocation, at most one knighthood. Complete eligible petitions queue by submission time then receipt ID. Sundays at 18:00 UTC, the Steward writes 150–250-word grounded proclamations and confers titles atomically; no routine owner evidence or induction approval. No fake Knights are seeded.

## Scheduling and operation

`vercel.json` has separate once-daily routes for 03/09/15/21 research, 10/22 final preparation, 00/12 publication, daily retention, Sunday 18:00 induction and weekly prompt evaluation. All call one resumable worker and require `Authorization: Bearer CRON_SECRET`. Per-phase/day keys, expiring run/job leases, checkpoints, exact-version publication and duplicate-credit controls make retries safe. On Hobby each cron can run once daily, within the hour after its scheduled time (up to 59 minutes late). This cannot promise exact-minute updates. Cron activates on the isolated project's **production deployment**, not an ordinary branch preview; never point the original production domain to this project without approval.

Protected desk controls refresh prepared lists, pause/resume, publish approved due work, retry failed jobs, run retention, inspect windows, and restore validated prompts. Manual induction respects the weekly ceremony time. The operator's normal task is approval, not research or moving files.

Prompt v1 is preserved. Revisions require actual owner feedback, fixed adversarial cases and nonregressing dimension scores. Model self-evaluation alone does not promote a candidate. The current version remains active until independent validation; rollback is available. Prompt changes cannot change privacy, credentials, authority, approvals, spending or knighthood rules.

## Privacy and recovery

No required email, phone, real name, social login, address, GPS or tracking identifiers. Recovery codes contain 256 random bits; only SHA-256 digests are stored. Session cookies are HttpOnly, SameSite Strict and Secure on deployment. Recovery secrets never appear in URLs, logs or public projections. Losing the code can mean losing access. One passport is not proof of one human.

Evidence is private, at most three images of 1.2 MB, actual format checked and metadata stripped by Sharp. Authorized delivery checks ownership. Raw evidence expires 30 days after final decision or 60 days unresolved; unattached uploads expire after one day. A daily retention phase deletes files. Minimal accepted-deed summaries remain until deletion. Withdrawal/deletion removes membership, petitions, decisions and public chronicle; private files enter immediate deletion. Ordinary infrastructure logs/backups and AI processing are disclosed at `/privacy`. The map shows only public geographic centroids and aggregate counts; unverified places have a list fallback and no invented pin.

CSRF protection checks same-origin mutations; all inputs are bounded/validated; public rendering is escaped. Daily short-lived salted network digests limit anonymous recovery/enrollment abuse. Never log raw secrets, evidence or request bodies. Vercel SSO remains enabled.

## Configuration and cost boundaries

Required: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET`, `OPERATOR_SECRET`, `CRON_SECRET`. AI: `AI_GATEWAY_MODEL`, deployed Vercel OIDC identity (or `AI_GATEWAY_API_KEY` for local development). Optional: `MAX_AI_TASKS_PER_DAY` (12), `MAX_CYCLE_ITEMS` (3), `AI_PAUSED`, `KL_NAMESPACE`. Temporary database metadata: `NEON_DATABASE_EXPIRES_AT`, `NEON_PROJECT_ID`, `NEON_CLAIM_ASSERTION` (private; not used by public app).

No paid plan or purchased credits are authorized by this code. This preview uses a free claimable Neon database with a 72-hour expiration and small storage/transfer limits. The owner must claim it before expiry; claiming rotates database credentials, so update DATABASE_URL and redeploy afterward. Claim links expire quickly and are minted only when needed. Private Blob uses plan allowances. AI Gateway may require account payment verification to use free credit; lack of authorization is displayed and requests stay pending. No automatic credit purchase is configured.

Calls are bounded (12 daily, at most 3 items/cycle, output and time limits); this is a call cap, not a dollar-denominated hard billing cap. Set an account-level AI Gateway spend limit before opening unrestricted intake. Actual AI/search costs depend on the configured model/tool rates. No model call on page views. Vercel/Neon/Blob quota exhaustion pauses dependent flows; it must not be described as a working mock substitute.

## Promotion and rollback

Review the PR, claim durable storage, verify runtime AI/search and active cron delivery, choose the account's budget, and complete acceptance checks before production promotion. After approval only: back up original data/config, merge or select the approved commit, provision production-isolated resources, configure secrets, migrate/seed, deploy, verify then change the domain/project alias. Rollback restores the original deployment alias and its original environment/data. This preview never deletes or migrates the original site's production data.

See `VERIFICATION.md` for the actual verification record and outstanding limits.
