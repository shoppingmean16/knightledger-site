# KnightLedger manuscript direction

## Product
Make a quest feel like an inviting side quest, not a work email. Cards lead with illustration, title, one short summary, effort and locality. Individual pages lead with the goal and a real next action, then numbered short steps. Expanded details retain exact completion standards, sources, access/safety requirements and privacy rules. Never simplify away a condition that changes whether someone can safely participate or earn credit.

## Artwork
Original late-medieval Bohemian illuminated-manuscript miniatures: tempera, parchment, lapis, vermilion, forest green, dull gold, branching acanthus/vine marginalia. Historically convincing armored knight and medieval world; a modern unbranded smartphone or laptop is the deliberate anachronism. Affectionate dry absurdity. No political caricatures, offensive content, logos, fabricated evidence or invented partnerships. Art is illustrative, never proof of a real event or accurate external UI.

The initial atlas has 16 separate miniatures, one for each pre-existing quest. public/art/quest-atlas.webp is one shared atlas asset. public/art/moltbook-knight.webp is a dedicated Moltbook painting. Both were generated with the built-in image tool, then encoded as WebP for the site. Keep the originals locally during a generation run; retain final project assets in GitHub. Do not send a paid model API request.

## Automatic presentation
components/quest-art.tsx and lib/quest-presentation.ts supply art for every current and future quest. Known quests use the atlas; semantic fallback picks a related miniature so a new quest is never blank. Everything shows all published quests, Anywhere only global quests, specific localities only exact local quests.
lib/quest-art-overrides.json maps quest IDs to {"src":"/art/unique-file.webp","alt":"Concise literal description"}. Dedicated original images take precedence. Media overrides are presentation only; they do not alter evidence standards, approval hashes, source dates or petition deadlines.

## Maintenance, bounded to two originals per run
1. Complete operational queue work first. Inspect new published/approved quests and previous media coverage.
2. Choose up to two quests lacking dedicated art; prioritise new tasks and the smallest atlas art on detail pages. Read the actual task before composing the scene.
3. Use the built-in image-generation tool for a single relevant original illustration per new dedicated asset. If unavailable or access blocked, keep the semantic fallback and report the limit; do not buy API access.
4. Optimise the asset as WebP (roughly 1200–1600 px wide; keep a reasonable byte size), add a distinct descriptive filename, and update only its data override. Read the image before accepting it. Do not invent branded interfaces, partner logos, factual maps or evidence in art.
5. Commit assets and mapping together to current main using expected-head checks; preserve concurrent changes. Test art resolution, all existing filters, safe rendering and production build. Confirm Vercel READY and public asset/quest response before claiming deployment. Only routine media and presentation changes are authorized here; broader code, evidence, privacy or policy changes need owner review.
6. Record generic progress in run Learning; never put private submissions, identities, proof or credentials in GitHub.

## Writing on each new quest
Use an accurate, warm title with a little wit. Summary: one sentence, ideally 10–20 words, max 125 characters. Aim for 3–4 numbered steps. The first sentence of each step should be a short actionable instruction; supporting details follow and render behind “The finer points.” Say exactly what to open, do, submit and retain. Provide an actual official start link when available. A template prompt can explain complicated agent setup, but must check tool capabilities and avoid pretending that a chat or a saved prompt is a running automation.
Proof summary should put the minimum useful evidence first. Subsequent sentences give privacy and format details. Preserve exact published standards and complete instructions in expandable sections; never truncate the stored task.

## Initial atlas prompt (built-in generation)
Use case: historical-scene. Asset: ONE coherent illustrated atlas sheet for a website, a strict 4-column by 4-row grid of SIXTEEN equally sized SQUARE miniature paintings, each cell fills exactly one quarter of the image width and height. High resolution 4096x4096 if possible. No text, numbers, lettering, labels or logos. Consistent authentic late-medieval Bohemian illuminated manuscript style circa 1400: flat tempera, lapis blue, cinnabar red, forest green, dull gold leaf, warm parchment, naive medieval perspective, charming expressive animals, intricate branching/fractal vine marginalia contained WITHIN each cell edge. Thin identical borders. Every vignette features a knight in convincing full plate armor and heraldic regalia inside an otherwise completely medieval world, using a clearly modern unbranded smartphone or laptop as an incongruous tool. The joke is understated and affectionate. Painted miniature, not 3D, not photorealistic, not a UI mockup. No parchment blank spaces between cells; exact even grid, no shared scene across cells. ROW ONE left to right: 1 knight collecting litter by a wooden bench, smartphone nearby; 2 knight checking a smartphone beside a medieval inn's opening-hours sign with illegible markings; 3 kneeling knight photographing a tiny butterfly in a meadow with smartphone; 4 knight repairing a wooden chair with a laptop open on a medieval workbench. ROW TWO: 5 knight checking a broken chain beside a village noticeboard while using laptop (broken website link metaphor); 6 knight measuring stone steps with smartphone in medieval street (accessibility); 7 knight proofreads a giant manuscript beside a modern laptop; 8 knight reports a leaking village fountain using smartphone. ROW THREE: 9 knight sorting spiral galaxies on laptop in candlelit scriptorium; 10 knight looking at a simple dipping star graph on laptop below stars; 11 knight separates glowing tiny galaxies from inkblots using laptop; 12 knight remotely operates a little brass astronomical instrument using laptop in castle tower. ROW FOUR: 13 armored knight beside a long astronomical telescope in a castle garden at night, laptop at feet; 14 knight compares stars in a manuscript chart and smartphone under night sky; 15 knight plants native flowers beside a reservoir with a medieval city behind, smartphone tucked visibly in gauntlet; 16 knight at a medieval council table uses laptop to give town-planning input, miniature town model beside it. Each square must be a complete finished illuminated miniature, visually legible as a card thumbnail. Keep all important objects away from cell edges.

## Moltbook painting brief
An armored knight in blue-gold regalia introduces a tiny mechanical lobster to an unbranded modern laptop in a medieval scriptorium. Late-medieval illuminated tempera, gold leaf, intricate branching vine borders, warm parchment, quiet absurdity. All other objects are period appropriate. No text or logos.


## Main-page wording
The owner requests the original wording on main pages, including the homepage heading and introduction. Preserve this copy during visual maintenance; do not replace it with new slogans, jokes or marketing copy. Keep the short, simple quest wording and manuscript illustrations. New quest copy and art may follow the quest-specific guidance above; that permission does not extend to rewriting main-page copy.


## Proportionate quest effort and AI designation
Keep quests fun, clear and easy to complete where possible. Moltbook requires a new claimed agent and one original public post; each distinct agent counts once. Preserve existing safety and receiving-project requirements. Show a small AI agent: Yes/No badge on each quest. Use lib/agent-quest-policies.json; digital format alone does not establish independent agent eligibility. The board’s AI-ready filter and machine-readable /api/agents/quests list use the same server policy. Keep the owner-requested contact link and AI welcome note, and preserve the other main-page wording.


The owner requests no coverage map, map-pin instructions or participation-count list on the quest board. Keep the locality dropdown and AI-ready filter; do not reintroduce the removed map during visual maintenance.

Public copy should describe only what participants need to do. Omit change announcements, removed requirements and internal process commentary. In particular, do not mention an absent posting schedule in Moltbook instructions. Keep safety, permissions, privacy and completion standards complete and concise.

Use concrete actions and observable completion criteria rather than vague labels such as “useful” or “helpful.” Moltbook credit is per distinct newly claimed agent with its own original public post, never per additional post. Keep this rule consistent in drafting, proof decisions, public copy and API guidance.
