import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../lib/seed.ts';
import { approve, leaseJob, questHash, publish } from '../lib/domain.ts';
import { prepareAstronomy } from '../lib/astronomy.ts';
import { requestEditorialRevision, saveEditorialRevision } from '../lib/editorial.ts';
test('returning an editorial astronomy proposal creates a retryable job, never a fake petition or publication',()=>{
  const s=initialState();prepareAstronomy(s);const q=s.quests.find(q=>q.category==='Science')!;approve(s,q.id,1);
  const job=requestEditorialRevision(s,q,'Clarify the account and contribution requirements.');
  assert.equal(s.petitions.length,0);assert.equal(q.status,'draft');assert.equal(q.approvedHash,undefined);assert.equal(job.questId,q.id);
  assert.throws(()=>approve(s,q.id,1),/research/);assert.equal(publish(s),0);
  job.attempts=5;job.leaseId='expired';job.leaseUntil='2099-01-01';
  assert.equal(requestEditorialRevision(s,q,'Research this new clarification carefully.').id,job.id);assert.equal(job.attempts,0);assert.equal(job.leaseId,undefined);assert.equal(s.jobs.length,1);
});
test('a completed editorial revision changes the version and still requires exact owner approval',()=>{
  const s=initialState();prepareAstronomy(s);const q=s.quests.find(q=>q.category==='Science')!;
  requestEditorialRevision(s,q,'Clarify the beginner contribution instructions.');const job=leaseJob(s)!;const hash=questHash(q);
  assert.equal(saveEditorialRevision(s,job.id,job.leaseId!,hash,{...q,title:'A source-grounded revised astronomy title'}),true);
  assert.equal(q.version,2);assert.equal(q.revisions?.length,1);assert.equal(q.status,'draft');assert.equal(s.jobs[0].status,'done');
  assert.equal(saveEditorialRevision(s,job.id,job.leaseId!,hash,q),false);assert.throws(()=>approve(s,q.id,1));approve(s,q.id,2);assert.equal(q.status,'approved');
});
test('late editorial output cannot overwrite owner edits or a newly returned revision',()=>{
  const s=initialState();prepareAstronomy(s);const q=s.quests.find(q=>q.category==='Science')!;
  requestEditorialRevision(s,q,'Please verify the standard.');const job=leaseJob(s)!,hash=questHash(q);q.title+=' Owner edit';
  assert.throws(()=>saveEditorialRevision(s,job.id,job.leaseId!,hash,{...q,title:'Stale model title'}),/changed/);
  requestEditorialRevision(s,q,'Please verify the updated standard.');assert.equal(saveEditorialRevision(s,job.id,job.leaseId!,hash,q),false);assert.ok(q.title.endsWith('Owner edit'));
});
test('source-only editorial revisions preserve the published task and successor version',()=>{
  const s=initialState(),original=s.quests[0];
  const q={...original,id:'source-refresh-fixture',replacesId:original.id,version:original.version+1,status:'draft' as const};s.quests.push(q);
  requestEditorialRevision(s,q,'Check the sources again before this refresh.');const job=leaseJob(s)!,hash=questHash(q);
  assert.throws(()=>saveEditorialRevision(s,job.id,job.leaseId!,hash,{...q,standard:'An unapproved different task standard.'}),/silently change/);
  assert.equal(saveEditorialRevision(s,job.id,job.leaseId!,hash,{...q,recheckAt:new Date(Date.now()+86400_000).toISOString()}),true);
  assert.equal(q.version,original.version+1);approve(s,q.id,q.version);assert.equal(publish(s),1);assert.equal(original.replacedById,q.id);
});
