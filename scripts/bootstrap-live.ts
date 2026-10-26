import assert from 'node:assert/strict';
import { initialState } from '../lib/seed.ts';
import { astronomyQuests, prepareAstronomy } from '../lib/astronomy.ts';
import { approve, publish, iso, id } from '../lib/domain.ts';
import { load as loadPrevious } from '../lib/postgres-store.ts';
import { initialize } from '../lib/blob-store.ts';
import { load } from '../lib/store.ts';
assert.equal(process.env.KNIGHTLEDGER_STORAGE,'blob');
assert.ok(['production','free-preview'].includes(process.env.KL_NAMESPACE||''));
const destination=process.env.KL_NAMESPACE;
const previous=await (async()=>{
 process.env.KL_NAMESPACE=process.env.KL_SOURCE_NAMESPACE||'live';
 try{return (await loadPrevious()).state;}finally{process.env.KL_NAMESPACE=destination;}
})();
// The old preview is empty of member work. Refuse a fresh catalog if that changes.
assert.equal(previous.members.length+previous.petitions.length+previous.completions.length+previous.chronicles.length+previous.evidence.length,0,'Existing preview member records require a preserving migration.');
const s=initialState();prepareAstronomy(s);
for(const q of s.quests){
 const sourceRefresh=previous.quests.find(old=>old.templateId===q.templateId&&old.replacesId&&old.status==='draft');
 if(sourceRefresh){q.sources=sourceRefresh.sources;q.recheckAt=sourceRefresh.recheckAt;}
 q.status='draft';q.publishedAt=undefined;q.approvedHash=undefined;q.approvedAt=undefined;
 approve(s,q.id,q.version);
}
assert.equal(publish(s),14);assert.equal(astronomyQuests.length,6);
s.meta[0].proofReviewMode='owner';s.meta[0].inductionReviewMode='owner';
s.audits.push({id:id(),at:iso(),action:'launch-authorization',recordId:'catalog',note:'Owner authorized the initial live site, concise public wording and no-card assisted operation in the October 26 chat. Exact initial catalog versions were approved before publication.'});
const created=await initialize(s);const current=await load();
console.log(JSON.stringify({namespace:process.env.KL_NAMESPACE,created,published:current.state.quests.filter(q=>q.status==='published').length,members:current.state.members.length,knights:current.state.chronicles.length,storage:'private Blob CAS',processing:'assisted; model API disabled'}));
