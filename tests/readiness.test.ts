import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../lib/seed.ts';
import { intakeDelay, recordServiceCheck, releaseReadiness } from '../lib/readiness.ts';
const env={DATABASE_URL:'configured',BLOB_READ_WRITE_TOKEN:'configured',SESSION_SECRET:'a'.repeat(40),OPERATOR_SECRET:'b'.repeat(40),CRON_SECRET:'c'.repeat(40),AI_GATEWAY_MODEL:'provider/current',KNIGHTLEDGER_AI_MODE:'automatic'};
test('configured AI identity and a working temporary database cannot make a release ready',()=>{
  const s=initialState(),report=releaseReadiness(s,{...env,NEON_DATABASE_EXPIRES_AT:'2026-10-28T12:47:00Z',KNIGHTLEDGER_PRIVATE_PREVIEW:'true'});
  assert.equal(report.ready,false);
  for(const key of ['database','ai','research','scheduling','preview']) assert.equal(report.items.find(i=>i.id===key)?.ready,false);
  assert.ok(!JSON.stringify(report).includes('a'.repeat(40)));
});
test('an AI outage remains public even if an unrelated job clears lastError; success alone does not verify research',()=>{
  const s=initialState();recordServiceCheck(s,'ai',false,'provider/current','Provider access requires owner setup.');s.meta[0].lastError=undefined;
  assert.match(intakeDelay(s)!,/review are delayed/);
  recordServiceCheck(s,'ai',true,'provider/current','Live reply received.');assert.equal(intakeDelay(s),null);
  const report=releaseReadiness(s,env);assert.equal(report.items.find(i=>i.id==='ai')?.ready,true);assert.equal(report.items.find(i=>i.id==='research')?.ready,false);
});
test('stale or different-model checks cannot validate provider access; failed native delivery cannot validate scheduling',()=>{
  const s=initialState();recordServiceCheck(s,'ai',true,'provider/old','Live reply.');
  assert.equal(releaseReadiness(s,env).items.find(i=>i.id==='ai')?.ready,false);
  s.meta[0].serviceChecks!.ai!.model='provider/current';s.meta[0].serviceChecks!.ai!.checkedAt=new Date(Date.now()-49*3600_000).toISOString();
  s.runs.push({id:'health:2026-10-25',phase:'health',status:'failed',startedAt:new Date().toISOString(),finishedAt:new Date().toISOString(),leaseUntil:'',count:0});
  const r=releaseReadiness(s,env);for(const key of ['ai','scheduling'])assert.equal(r.items.find(i=>i.id===key)?.ready,false);
});
