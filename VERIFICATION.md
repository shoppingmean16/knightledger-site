# KnightLedger verification — October 25, 2026

Working isolated staging: https://knightledger-quests-preview.vercel.app

Source branch: `feat/knightledger-quests`. Latest private launch-readiness application deployment `b7cc3abbcfb2ab52687203c66dae4164c840e6fa` is READY at https://knightledger-quests-preview-noer2yvcl.vercel.app. The astronomy baseline was `cdb4b4ad45c771e1c2b01f891fa34c5546c63d29`. The baseline owner-review deployment was `eb4d91f9308526d88ec7a5cc79b0ee277bc07d78`; later documentation/screenshot commits do not change the deployed application. Original `main`, production project and custom domain are preserved. The staging project has its own production-target deployment for native Vercel Cron; Vercel SSO remains enabled.

## Observed results

| Flow | Result | Evidence / boundary |
| --- | --- | --- |
| Production build, types and lint | Pass | Next 16.4.3 / React 19.3.1 / TypeScript 6.0.3 / Node 24; committed npm lockfile; ESLint passes. |
| Focused unit tests | 38 pass | Cutoff equality/midnight; exact approval hash; edited/stale/unapproved publication; repeat-deed credit and duplicate evidence prevention; frozen 3/5/7 targets; unlimited earned Knight places; one title; exact owner evidence/proclamation gates; public privacy; leases/retries; prompt promotion guards; malformed budgets; source-only editions; expired source withholding. |
| Real SQL + HTTP integration | Pass | Production server against the real Neon DB in a disposable `qa-*` namespace. Creation, session ownership, origin rejection, saved quests, recovery, logout, deletion, locality-only requests for Amherst and Greenpoint, owner approval/edit/reapproval and stale-version rejection. All QA rows are removed. |
| Atomic credit and title grants | Pass with isolated full-rule fixtures | Five concurrent credit attempts produce one completion; concurrent publication publishes once; concurrent induction writes produce one title after three separate accepted repetitions of one quest. No qualification thresholds were lowered. These fixtures never appear in staging's real Hall/counts. |
| Repeat-deed policy | Code + SQL verified | Separate useful repetitions of a quest earn full credit, including same-day completions; three repetitions satisfy the founding target. Reused deeds/links/images remain blocked, even after raw evidence is deleted. No locality Knight quota; one title per passport remains. |
| Real deployed persistence | Pass | Created a staging passport and two locality-only requests. Both immediately received durable receipts, target windows and persistent jobs. Requests remained tracked with the real provider failure. Disposable passport and requests were deleted after checks. |
| Real runtime AI authentication | Identity works; service blocked | Deployed OIDC identity is present. Gateway returns HTTP 403: “AI Gateway requires a valid credit card on file to service requests.” No credit purchase or plan upgrade was performed. |
| Actual local research / generated local quests | Not verified | Both locality-only jobs reached the real configured Gateway and were blocked before search/model execution. No fabricated proposal or citations were substituted. |
| Public source fetch | Transport verified | Deployed SSRF-constrained fetch read Amherst's official website (4,351 text characters). The NYC planning legacy URL returned a short page-moved stub; that is not evidence that its datasets were read. |
| Private Blob storage | Pass on staging | A disposable synthetic JPEG was uploaded privately; authenticated delivery returned JPEG with EXIF stripped; another anonymous session got 404; a spoofed GIF-as-JPEG was rejected. |
| Evidence deletion / retention | Deletion verified; timed policy inspected | Deleting the test passport removed private evidence records/files through the real Blob SDK. Final-decision 30-day / unresolved 60-day policies are implemented; no claim of waiting 30 or 60 days is made. |
| Owner review gates | Code + SQL/HTTP fixtures verified | Evidence recommendations remain uncredited until the exact owner decision; verified proclamations remain unconferred without exact approval. Operator-only policy settings permit a later explicit handover. Private comments/reminders persist. Actual model preparation remains blocked by Gateway. |
| AI evidence decisions | Not verified live | Bounded reviewer, private image delivery, source fetch, reasons, minimal summaries and duplicate controls are implemented. The provider account gate prevents real AI acceptance testing. Code-level acceptance/idempotency is verified separately. |
| AI proclamations / weekly induction | Not verified live | Draft checkpoints, independent grounding/privacy check, 150–250 words, accepted-record references, no locality quota and atomic grants are implemented. No apparently real Knights were manufactured. |
| Prompt improvement | Deterministic guards verified; live evaluations unverified | Feedback threshold, immutable append-only boundary, four frozen synthetic cases, resumable output generation, deterministic checks, blinded comparison, nonregression gate, automatic promotion and validated rollback are implemented. Actual model evaluations await provider access. |
| Protected manual phases | Pass | Refresh, approved publication (zero pending approvals), and retention ran on staging. No unapproved draft was published. |
| Native unattended schedule | Observed | Staging's real `health:2026-10-25` run completed 2026-10-25 13:50:40 UTC. No manual staging health invocation was made; CLI health tests used disposable QA namespaces. Other scheduled phase configurations are deployed, but their complete unattended AI outcomes are not claimed verified. |
| Latest deployed owner desk | Pass | Authenticated GET of the real operator API exposes the new evidence/proclamation queues and private reminder worklist. Both review modes resolve to owner approval; queues have no fabricated decisions. Four source drafts remain awaiting owner approval. |
| Public empty states and map | Pass | Eight substantive Anywhere quests; zero invented members/Knights/impact; empty Hall and aggregate atlas/list fallback. Geography and map component load lazily. |
| Browser | Desktop and mobile verified in 390px iframe | Main navigation, keyboard skip link, responsive rendering, live Digital filter (8 to 3 quests), public forms, lazy atlas and empty-state list fallback inspected. Narrow iframe content width equaled its viewport (373 px excluding its scrollbar); no horizontal overflow. Browser extension metadata warnings are unrelated to application code. Updated funding copy and the repeat-credit/owner-approval rules were verified on deployed pages. Updated 390px content width remains 373px without overflow. Screenshots are saved in `docs/`. |

## Exact owner-only steps

1. In the authorized Vercel team's AI Gateway, add a valid payment method to unlock eligible free credits. Do not enable auto-top-up or buy credits without a chosen budget. Use **Check live AI connection** in `/steward`, then retry retained jobs. If a chosen model is not free-tier eligible, select an eligible model or explicitly authorize purchased credits.
2. Claim the preview Neon database before **October 28, 2026 at 8:47 a.m. EDT (12:47 UTC)**. At `/steward`, choose **Prepare database claim link** only when ready. Sign in to Neon and accept the transfer. Continuing rotates DATABASE_URL: update the staging environment and redeploy. Remove obsolete claim credentials afterward. The unclaimed database is real but temporary (100 MB storage / 1 GB transfer).
3. Use the staging project's **OPERATOR_SECRET** from its private Vercel environment settings to open the Steward desk. Four editorial source refreshes are prepared as drafts. Approving the exact list permits their next publication; the current eight quests remain live until then. Source refresh publication archives the old edition, preserves the task/evidence standard, and does not double the quest supply.
4. Before public production promotion, verify live AI research (town and NYC neighborhood), AI evidence review, a grounded weekly ceremony, and prompt evaluation/rollback with provider access. Confirm account-level spend limits and the actual Vercel plan. The connected team's normalized API response did not expose its subscription plan; schedules deliberately use once-daily entries compatible with Hobby. No plan upgrade is required by this configuration.

## Required configuration (names only)

Configured: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET`, `OPERATOR_SECRET`, `CRON_SECRET`, `AI_GATEWAY_MODEL`. Deployed Gateway authentication uses Vercel OIDC; no separate model key was required to reach the account-verification gate. Local development may set `AI_GATEWAY_API_KEY`.

Limits: `MAX_AI_TASKS_PER_DAY=12`, `MAX_CYCLE_ITEMS=3`; optional `AI_PAUSED`, `KL_NAMESPACE`. Temporary claim metadata: `NEON_PROJECT_ID`, `NEON_DATABASE_EXPIRES_AT`, `NEON_CLAIM_ASSERTION`.

No secrets, private evidence, user submissions, recovery codes, or private LEGION brain content are committed. The app has no access to the builder's personal connected accounts.

## Operating limits

No model calls happen on page views. Daily call reservations and per-cycle batches are bounded in code, including malformed-config fallbacks. This is not a dollar-denominated billing cap. README gives current model/search rates and a $2.25/30-day illustrative AI estimate at the specified assumptions. Hosting/storage may incur plan-dependent usage, and quota exhaustion can stop service. No paid resources, credits or upgrades were purchased.

The initial persistence adapter uses short atomic whole-state commits across typed JSONB tables. It is suitable for this small preview; indexed record-level queries and write paths should replace full-state loads before a large public launch. PostgreSQL enforces unique credit/title constraints, and AI calls do not hold SQL transactions open.

## Astronomy extension — October 25

Six researched astronomy proposals were inserted durably as drafts, idempotently. Eight previously published quests, membership, accepted work and titles were preserved. A staging-only preview setting exposes marked editorial astronomy proposals for review; private/local research drafts remain hidden. New tests cover draft-only preparation, private-preview scoping, explicit publication approval, and the exclusion of closed SETI/ESA batches from completion quests. The extended SQL/HTTP suite checks that an astronomy detail can be reviewed while unauthorized undertaking/proof is rejected. See docs/ASTRONOMY.md for receiving projects, current-source checks and deliberate exclusions.

The astronomy deployment was verified in the browser: six proposals in beginner-first order, complete telescope instructions, and mobile science filtering from six to four digital proposals. At a 390px iframe width, inner viewport/content widths were both 373px; no horizontal overflow. No application-origin console errors/warnings were observed. The deployed public API still returns only the eight published quests and zero fabricated Knights. Screenshot: docs/astronomy-preview.jpg. Original domain was rechecked on its unchanged main deployment.

## Final invited-preview readiness — October 25, 23:57 UTC

38 focused tests, TypeScript, lint and a fresh production build pass. The extended SQL/HTTP suite passes in a disposable namespace and cleans it: durable editorial revision jobs, stale-result/owner-edit protection, source-only version preservation, premature-approval denial, persistent failed sign-in/recovery attempts, private service diagnostics and public outage notices. Existing passport, exact quest/evidence/proclamation approval, repeat-credit, concurrency, deletion and lease tests continue to pass.

The exact `b7cc3ab` build is READY in the isolated staging project. A fresh deployed live AI check returned HTTP 403 again; its concise failure is persisted and rendered as a real service delay. Operator preflight correctly passes configured credentials, native heartbeat, owner review modes and source dates, while holding temporary database ownership, AI access, runtime research and public-release presentation. It does not equate a configured identity with a working model or a ping with full AI acceptance.

An actual deployed anonymous passport and locality-only Greenpoint request were created, read back with receipt/target/private status, and found in the persistent job queue. No researched proposal, accepted deed or title was fabricated. The disposable passport and request were deleted; the public API again shows eight published quests and zero members/Knights. Six astronomy proposals remain drafts excluded from public API and qualification.

The current browser rendering shows the true provider-delay notice. At the 390px verification iframe, content and viewport are both 373px wide, with no horizontal overflow; selecting Science & astronomy shows six marked proposals. No application-origin console errors/warnings were seen (browser-extension metadata errors are unrelated). The deployed fatal/error log-count query returned no groups in the inspected 20-minute window. Screenshot: docs/launch-preview.jpg.

The owner-only account steps remain: claim/rotate the real database before October 28 at 12:47 UTC; restore Gateway account access and choose an account spending limit. Full real town/neighborhood AI research, evidence preparation, grounded weekly proclamation and prompt evaluation/rollback remain unverified until then. No paid upgrade, production-domain promotion or outreach was performed. KnightLedger.com was rechecked on original deployment dpl_D3EcRGyHtxkr5DneqBG9dydqSaiu.
