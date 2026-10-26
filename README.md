# KnightLedger

A free, self-funded, not-for-profit quest board. Native forms, anonymous passports, private evidence and earned knighthood. Current launch operation is **assisted AI**, without model API calls or a card requirement.

Public: `/`, `/quests/:id`, `/knights`, `/knights/:id`, `/petitions`, `/ledger`, `/privacy`. Private owner desk: `/steward` with OPERATOR_SECRET from Vercel settings. No Tally, social login, analytics, payments, ads or forum.

## Operate

1. Open the Owner desk; prepare and copy the AI work prompt.
2. Run it in the LEGION chat. Attach private images when their contents are necessary; they are not silently embedded in prompts.
3. Paste the JSON response and import. The server validates the schema, exact input snapshots, source pages and authority boundaries.
4. Approve finished quests, evidence recommendations and grounded proclamations. Quests publish in their assigned window; titles wait for the weekly induction.

[RUN_LEGION.md](docs/RUN_LEGION.md) includes a short prompt that lets the connected LEGION chat perform the private preparation/import bridge. [ENABLE_FULL_AI.md](docs/ENABLE_FULL_AI.md) is the complete standby prompt for restoring runtime AI without rebuilding the public site.

Returns, comments and reminders stay in the private queue. Work preparation queues source rechecks due within 48 hours; a source-only successor preserves the published task until exact approval. Existing proof can still be reviewed after a quest is withdrawn; new proof requires an open quest. Expired packs, stale records and conflicting imports are rejected. Replayed identical imports do not create duplicate quests or credit. Every valid locality request retains a job and deadline. A blocked source or unresolved place remains visible to the owner; no need, research success or approval is invented.

## Run locally

Node 24. `npm ci`; copy `.env.example` to `.env.local` and set private values. `npm run db:migrate`; `npm run dev`.

Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

`node --experimental-strip-types --env-file=.env.local scripts/integration.ts` runs a production server against an isolated `qa-*` storage namespace and removes its records. `scripts/blob-smoke.ts` verifies real consistent reads, concurrent conditional writes and private access denial. Never point test scripts at a live member namespace or lower qualification rules to manufacture Knights.

## Current storage

One Next.js App Router/TypeScript application. Set `KNIGHTLEDGER_STORAGE=blob` to use the existing private Vercel Blob store for an authoritative JSON ledger and private evidence. The ledger is **not public**, not in GitHub and not on serverless disk. `get(...useCache:false)` with identity encoding reads current origin data and a strong ETag; `put(...ifMatch:etag)` provides atomic compare-and-swap. Concurrent modifications retry from a fresh snapshot. No-op mutations do not consume a write.

Every atomic commit validates unique record IDs, recovery digests, accepted receipts, deed/evidence fingerprints and one title per member. The adapter has a 2 MB state limit and is intended for a small launch. It does not claim database-scale query performance. Indexed Postgres is the preserved scale-up path in `lib/postgres-store.ts`; migrate with verified record/revision reconciliation rather than two authoritative stores.

A namespace is initialized only if its private object does not exist. A seed cannot overwrite members. Production and staging use separate namespaces and signing secrets. SQL/Neon is optional (`KNIGHTLEDGER_STORAGE=postgres`); the live no-card launch does not depend on the expiring preview Neon database.

## Configuration — names only

Required now: `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET`, `OPERATOR_SECRET`, `CRON_SECRET`, `KNIGHTLEDGER_STORAGE=blob`, `KNIGHTLEDGER_AI_MODE=assisted`, and a distinct `KL_NAMESPACE` per environment. Use random signing/worker secrets of at least 32 characters.

`KNIGHTLEDGER_PRIVATE_PREVIEW=false` keeps unapproved editorial proposals off public pages. `KNIGHTLEDGER_PUBLIC_SITE=true` enables public indexing only in the approved live deployment. Preserve Vercel protection for private previews; custom-domain release uses the existing project's domain binding.

Automatic upgrade only: `AI_GATEWAY_MODEL`, deployed OIDC or a securely configured supported provider, `MAX_AI_TASKS_PER_DAY` and `MAX_CYCLE_ITEMS`. `reserveCall()` rejects before any provider request in assisted mode. Enabling automatic AI does not automatically change owner review policy. Do not purchase credits, upgrade plans or enable auto-top-up without a concrete authorized budget.

## Rules and timing

Locality: verified town/municipality, or recognized neighborhood with parents for large cities. NYC supports city → borough → neighborhood. User-supplied place variants merge through public geographic provenance, never IP/GPS inference. Public coverage is aggregate only.

Board windows: 00:00 and 12:00 UTC. A request received at least two hours earlier targets that window, equality included; later requests target the next. Owner approval binds the exact quest version/hash. Edits invalidate approval; expired source checks withhold publication. Source-only successors preserve the task, saved quests and accepted history. An unapproved quest never publishes.

Every separate useful deed counts, including repeating a quest on the same day/in the same locality. Fresh evidence is required. Targets freeze on first acceptance: 3 deeds where fewer than 50 local members have accepted work, 5 at 50–249, 7 at 250+. No locality Knight quota. One home allocation and at most one knighthood per passport. Complete petitions are ordered by receipt time, then ID.

Weekly induction: Sunday 18:00 UTC. In assisted mode the AI drafts; the owner checks factual grounding against accepted deed IDs and approves the exact proclamation. Code validates eligibility, 150–250 words, references, approval and atomic uniqueness. Only approved titles are conferred. There are no fake members, deeds or Knights in production seeds.

Native Vercel daily routes preserve publication, retention, health and weekly induction. Research/preparation phases do not call models in assisted mode. Separate once-daily entries remain compatible with Hobby scheduling; actual execution can be up to 59 minutes after the nominal time. Branch previews do not run production cron. Scheduled endpoints require CRON_SECRET and use phase/window keys and expiring leases. Protected manual controls are available; configuration alone is not proof of observed unattended delivery.

## Privacy and security

No required contact details or real identity. Random 256-bit recovery code shown once; digest only in storage. Secure HttpOnly SameSite Strict sessions; separate owner access. Ownership and same-origin mutations are enforced. Rejected sign-in/recovery attempts count toward short-lived salted abuse limits.

Evidence: at most 3 JPEG/PNG/WebP images of 1.2 MB, actual decode/type limits, metadata removal, private authorized delivery. Raw proof retention is 30 days after a final decision / 60 days unresolved / 1 day unattached. Minimal deed summaries and one-way evidence keys prevent duplicate credit after deletion. Account deletion removes member records/chronicles and queues private-file deletion. Ordinary provider logs/backups and owner-mediated AI processing are disclosed at `/privacy`.

AI imports are untrusted structured data. They cannot change credentials, privacy, budgets, review modes, authority or qualification. Sources are fetched server-side with HTTPS/DNS/IP/redirect/size/time protections. Hidden chain-of-thought is not retained. The deployed app cannot access the owner's private LEGION brain or personal connected accounts.

## Free operating boundary

No model API calls, new paid resources, credit purchase, card entry or plan upgrade are part of this launch. The existing storage is reused. Vercel's current Hobby Blob allowance is 1 GB storage, 10,000 simple operations, 2,000 advanced operations and 10 GB Blob transfer per month. These are finite shared allowances; Hobby service pauses at excess instead of billing overage. The account's actual subscription is not exposed by the normalized connector, so confirm it in Vercel before increasing traffic or resources. Other infrastructure usage also follows the existing plan.

Conditional writes, image uploads, reads and retries consume operations. This is a small pilot, not unlimited free hosting. No automatic paid fallback exists. Current primary documentation: [Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing), [consistent reads/conditional writes](https://vercel.com/docs/vercel-blob/using-blob-sdk). Model/search estimates from the earlier Gateway preview are not current launch costs.

## Promotion and rollback

Keep the old production deployment and data intact. Test the exact candidate on isolated storage, configure only the intended production environment, initialize the new namespace without overwriting data, then deploy the approved commit through the existing Vercel project. Its existing KnightLedger.com / www bindings avoid Namecheap DNS changes. Verify READY and the actual public domain, persisted forms, owner import/approval and private evidence.

Rollback points the domain back to the preserved prior deployment with its original services. Keep the new private ledger intact for later recovery; a domain rollback must not delete member data. Restore assisted processing if a later automatic upgrade fails.

Actual checks and release identifiers are recorded in `VERIFICATION.md`. Private financial/journal material and unrelated attachments are not website content.

Browsing and requesting local quests require no passport. The first proof flow creates a Squire passport for recognition; guest request cookies do not count as Squires.

Live: https://www.knightledger.com/. No Namecheap DNS change was needed. The merged release and current limits are recorded in VERIFICATION.md.
