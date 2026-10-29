import { iso, type State } from './domain.ts';

export type ServiceCheck = { ok: boolean; checkedAt: string; model: string; message: string };
export type ReleaseCheck = { id: string; label: string; ready: boolean; detail: string };
type Environment = Record<string, string | undefined>;
const configuredModel = (env: Environment) => env.AI_GATEWAY_MODEL || 'openai/gpt-6-luna';

export function recordServiceCheck(s: State, service: 'ai' | 'research', ok: boolean, model: string, message: string) {
  s.meta[0].serviceChecks ??= {};
  // Only bounded operational descriptions belong here, never provider payloads or evidence.
  s.meta[0].serviceChecks[service] = { ok, checkedAt: iso(), model, message: message.slice(0,300) };
}

export function intakeDelay(s: State) {
  if(s.meta[0].paused) return 'The Steward is paused. Petitions are saved, but research and review targets may be missed.';
  if(s.meta[0].serviceChecks?.ai?.ok === false || s.meta[0].lastError?.includes('AI Gateway'))
    return 'Local research and evidence review are delayed while the owner restores the AI service. Petitions are saved with their target windows; publication cannot be promised during this delay.';
  return null;
}

export function releaseReadiness(s: State, env: Environment = process.env, now = Date.now()) {
  const assisted=env.KNIGHTLEDGER_AI_MODE!=='automatic',blob=env.KNIGHTLEDGER_STORAGE==='blob';
  const model = configuredModel(env), checks = s.meta[0].serviceChecks;
  const recent = (check?: ServiceCheck) => !!check?.ok && check.model === model && Date.parse(check.checkedAt) <= now && now-Date.parse(check.checkedAt) < 48*3600_000;
  const missing = [...(blob?[]:['DATABASE_URL']),'BLOB_READ_WRITE_TOKEN','SESSION_SECRET','OPERATOR_SECRET','CRON_SECRET'].filter(key => !env[key]);
  const weak = ['SESSION_SECRET','OPERATOR_SECRET','CRON_SECRET'].filter(key => env[key] && env[key]!.length < 32);
  const temporary = !blob&&!!(env.NEON_DATABASE_EXPIRES_AT || env.NEON_CLAIM_ASSERTION);
  const heartbeat = s.runs.filter(r => r.phase === 'health' && r.id.startsWith('health:') && r.status === 'done' && r.finishedAt && Date.parse(r.finishedAt) <= now && now-Date.parse(r.finishedAt) < 36*3600_000).at(-1);
  const stale = s.quests.filter(q => q.status === 'published' && (!Number.isFinite(Date.parse(q.recheckAt)) || Date.parse(q.recheckAt) <= now));
  const items: ReleaseCheck[] = [
    {id:'configuration',label:'Required private configuration',ready:!missing.length&&!weak.length,detail:missing.length?'Missing names: '+missing.join(', '):weak.length?'Use at least 32 random characters for: '+weak.join(', '):'Database, private evidence and signing/worker credentials are configured. Values are never shown here.'},
    {id:'database',label:'Durable storage',ready:!temporary,detail:blob?'Private, nonexpiring Blob ledger with consistent reads and conditional writes. Postgres is preserved as an upgrade option.':temporary?'Claim the preview database in Neon, rotate DATABASE_URL, remove obsolete NEON_CLAIM_ASSERTION and NEON_DATABASE_EXPIRES_AT, then redeploy. A working temporary database is not permanent storage.':'No temporary claim metadata is configured. Confirm the database is owned by the project before public release.'},
    {id:'ai',label:assisted?'AI work packs':'Live AI access',ready:assisted||recent(checks?.ai),detail:assisted?'ChatGPT task runs process private work packs and import validated results. API model calls are disabled.':checks?.ai?`${checks.ai.message} Checked ${checks.ai.checkedAt}. A successful check must use the current model and be less than 48 hours old.`:'Use Check live AI connection. A configured identity alone does not verify provider access.'},
    {id:'research',label:'Research sources',ready:assisted||recent(checks?.research),detail:assisted?'The AI researches in the owner’s chat. Import fetches cited pages server-side; finished quests still need exact owner approval.':checks?.research?`${checks.research.message} Checked ${checks.research.checkedAt}.`:'A real research run must retrieve current search results and readable public sources. Builder-authored proposals do not count as a deployed research test.'},
    {id:'scheduling',label:'Observed unattended heartbeat',ready:!!heartbeat,detail:heartbeat?`Native health window completed ${heartbeat.finishedAt}. This verifies delivery, not every AI phase. Hobby execution can be up to 59 minutes late.`:'No successful native health window within 36 hours. Schedule configuration alone does not prove delivery.'},
    {id:'review',label:'Review policy',ready:true,detail:`Quests require exact owner approval. Evidence: ${s.meta[0].proofReviewMode||'owner'}. Knighthood: ${s.meta[0].inductionReviewMode||'owner'}.`},
    {id:'sources',label:'Published source checks',ready:!stale.length,detail:stale.length?`${stale.length} published quest source check(s) need refreshing. Approve researched refreshes before public release.`:'Published quests have not passed their recheck dates. Unpublished drafts require exact owner approval.'},
    {id:'preview',label:'Public-release presentation',ready:env.KNIGHTLEDGER_PRIVATE_PREVIEW!=='true',detail:env.KNIGHTLEDGER_PRIVATE_PREVIEW==='true'?'Keep the invited preview flag on while testing. Turn it off only in the separately approved public release.':'Curated unapproved proposals are not exposed as open quests.'}
  ];
  return {ready:items.every(item=>item.ready),items,remainingAcceptance:assisted?'ChatGPT task runs prepare work and review evidence. The owner approves quests. See docs/ENABLE_FULL_AI.md for the automatic upgrade. Scheduling and retention stay active.':'After service setup, verify real town and NYC-neighborhood research, proof review, a grounded induction, and prompt evaluation/rollback with isolated records. A green connection check is not an end-to-end acceptance test. Production promotion still requires the owner’s explicit deploy instruction.'};
}
