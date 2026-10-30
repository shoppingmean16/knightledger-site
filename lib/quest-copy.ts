import {id,iso,questHash,type Quest,type State} from './domain.ts';
const edits:[string,string][]=[
 ['A Useful Thing Gets a Second Life','Give It a Second Life'],
 ['Turn a quiet observation into useful biodiversity data.','Record a wildlife observation for biodiversity research.'],
 ['Take a useful photo where permitted.','Take a clear photo where permitted.'],
 ['One useful broken-link report','One broken-link report'],
 ['Make one genuinely useful correction to openly shared knowledge.','Correct a factual error in openly shared knowledge.'],
 ['policy-compliant useful correction','policy-compliant factual correction'],
 ['Inspect ten TESS light curves for possible transits. An honest “nothing here” is useful too.','Inspect ten TESS light curves and submit your assessments.'],
 ['Help a dark-energy survey distinguish useful detections from noise, ten subjects at a time.','Classify ten detections as galaxy signals or noise for a dark-energy survey.'],
 ['Report noise or uncertainty honestly; rejecting a bad detection can be useful work.','Report noise or uncertainty when the data supports it.'],
 ['New useful analyses can count again;','New analyses can count again;'],
 ['Give Manchester Township useful local input through its current community visioning survey.','Share your local knowledge in Manchester Township’s community visioning survey.']
];
export function leanQuestCopy(q:Quest):Quest{
 const trim=(text:string)=>edits.reduce((s,[before,after])=>s.replaceAll(before,after),text);
 return {...q,title:trim(q.title),summary:trim(q.summary),benefit:trim(q.benefit),steps:q.steps.map(trim),standard:trim(q.standard),evidence:trim(q.evidence),constraints:trim(q.constraints)};
}
export function trimQuestCopy(s:State,items:{id:string;version:number}[]){
 if(s.meta[0].paused)throw new Error('The Steward is paused.');
 if(!s.runs.some(r=>r.phase==='chat-review'&&r.status==='running'&&r.leaseUntil>iso()))throw new Error('Acquire a current review lease.');
 if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Use unique quest IDs.');
 const plans=items.map(item=>{const q=s.quests.find(q=>q.id===item.id&&q.version===item.version&&q.status==='published');if(!q)throw new Error('A quest changed. Reload before editing.');const next=leanQuestCopy(q);if(JSON.stringify(q)===JSON.stringify(next))return null;if(s.quests.some(n=>n.replacesId===q.id&&n.status!=='removed'))throw new Error('A source revision is pending. Reconcile it before editing.');return {q,next};});
 const changed=[];
 for(const plan of plans){if(!plan)continue;const {q,next}=plan,previous=structuredClone(q);delete previous.revisions;Object.assign(q,next,{version:q.version+1,revisions:[...(q.revisions||[]),previous],approvedAt:iso()});q.approvedHash=questHash(q);
  for(const p of s.petitions.filter(p=>p.questId===q.id&&p.kind==='proof'&&!p.finalAt)){p.proofReview=undefined;p.status='Reviewing';p.response='Reviewing your proof.';const j=s.jobs.find(j=>j.kind==='proof'&&j.petitionId===p.id);if(j)Object.assign(j,{status:'pending',attempts:0,retryAt:undefined,leaseId:undefined,leaseUntil:undefined});}
  s.audits.push({id:id(),at:iso(),action:'owner-requested-copy-edit',recordId:q.id,note:'Pre-approved concrete wording; quantities, evidence, sources and permissions preserved. Exact version '+q.version});changed.push({id:q.id,version:q.version});
 }
 return {changed};
}
