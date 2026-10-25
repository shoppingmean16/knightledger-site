import { id, iso, questHash, sameTask, type Quest, type State } from './domain.ts';

export function requestEditorialRevision(s: State, q: Quest, reason: string) {
  if(q.requestId || !['draft','approved'].includes(q.status)) throw new Error('Only an unpublished editorial proposal can enter this revision queue.');
  q.status='draft';q.approvedHash=undefined;q.approvedAt=undefined;
  let job=s.jobs.find(j=>j.kind==='editorial'&&j.questId===q.id&&j.status!=='done');
  if(!job){job={id:id(),questId:q.id,kind:'editorial',status:'pending',attempts:0,createdAt:iso()};s.jobs.push(job);}
  Object.assign(job,{status:'pending',attempts:0,reason,retryAt:undefined,leaseUntil:undefined,leaseId:undefined,sources:[]});
  s.audits.push({id:id(),at:iso(),action:'return',recordId:q.id,note:reason});
  return job;
}

export function saveEditorialRevision(s: State, jobId: string, leaseId: string, inputHash: string, revised: Quest) {
  const job=s.jobs.find(j=>j.id===jobId),q=s.quests.find(q=>q.id===job?.questId);
  if(!job||job.leaseId!==leaseId||job.status!=='running'||!q) return false;
  if(q.status!=='draft'||questHash(q)!==inputHash) throw new Error('The editorial proposal changed during research. The owner’s current version was preserved.');
  if(q.replacesId){const original=s.quests.find(x=>x.id===q.replacesId);if(!original||!sameTask(original,revised)) throw new Error('A source refresh cannot silently change the published task.');}
  const previous={...q};delete previous.revisions;
  Object.assign(q,revised,{id:q.id,templateId:q.templateId,requestId:undefined,replacesId:q.replacesId,version:q.replacesId?q.version:q.version+1,status:'draft',approvedHash:undefined,approvedAt:undefined,publishedAt:undefined,revisions:[...(q.revisions||[]),previous]});
  job.status='done';job.leaseUntil=undefined;job.reason=undefined;
  s.audits.push({id:id(),at:iso(),action:'editorial-revision',recordId:q.id,note:`Researched revision ${q.version}; owner approval remains required.`});
  return true;
}
