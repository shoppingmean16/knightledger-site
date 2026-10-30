import {agentEligibility} from './agent-quests.ts';
import { acceptProof, digest, eligible, id, induct, iso, questHash, type Petition, type State } from './domain.ts';

export const reviewMode=(s:State,kind:'proof'|'induction')=>kind==='proof'?(s.meta[0].proofReviewMode||'owner'):(s.meta[0].inductionReviewMode||'owner');
export function proofHash(s:State,p:Petition){
 const q=s.quests.find(q=>q.id===p.questId);if(!q)throw new Error('Quest unavailable.');
 return digest(JSON.stringify({quest:questHash(q),...(s.members.find(m=>m.id===p.memberId)?.actorType==='agent'?{participantType:'agent',agentPolicy:agentEligibility(q)}:{}),text:p.text,date:p.completionDate,link:p.evidenceLink||'',files:s.evidence.filter(e=>p.files?.includes(e.id)).map(e=>[e.id,e.digest]).sort()}));
}
export function ownerNote(s:State,recordId:string,note?:string){if(note?.trim())s.audits.push({id:id(),at:iso(),action:'owner-note',recordId,note:note.trim()});}
export function applyProofReview(s:State,p:Petition,hash:string,authority:'owner'|'automatic',override?:'More evidence needed'|'Declined',note?:string){
 if(authority==='automatic'&&reviewMode(s,'proof')!=='automatic')throw new Error('Owner approval is required for evidence decisions.');
 const r=p.proofReview;if(!r||r.hash!==hash||r.hash!==digest(JSON.stringify({inputHash:r.inputHash,decision:r.decision,reason:r.reason,summary:r.summary,model:r.model}))||proofHash(s,p)!==r.inputHash)throw new Error('The evidence or prepared decision changed. Request a fresh review.');
 if(p.finalAt)return false;
 const decision=override||r.decision,reason=override?note||r.reason:r.reason;
 if(decision==='Accepted')acceptProof(s,p,reason,r.model,r.summary);
 else {p.status=decision;p.response=reason;p.updatedAt=iso();if(decision==='Declined')p.finalAt=iso();}
 if(p.finalAt)for(const e of s.evidence.filter(e=>e.petitionId===p.id))e.deleteAfter=new Date(Date.now()+30*86400_000).toISOString();
 s.audits.push({id:id(),at:iso(),action:'proof-decision',recordId:p.id,note:authority+': '+decision+'; exact evidence '+hash});ownerNote(s,p.id,note);return true;
}
export function saveProofReview(s:State,p:Petition,result:{decision:'Accepted'|'More evidence needed'|'Declined';reason:string;summary:string},model:string,expectedInputHash?:string){
 const inputHash=proofHash(s,p);if(expectedInputHash&&inputHash!==expectedInputHash)throw new Error('The evidence changed while LEGION was reviewing it. A fresh review is required.');const hash=digest(JSON.stringify({inputHash,decision:result.decision,reason:result.reason,summary:result.summary,model}));p.proofReview={...result,model,preparedAt:iso(),inputHash,hash};
 p.status='Ready for owner review';p.response='LEGION has prepared the evidence decision. The owner reviews it before your progress changes.';p.updatedAt=iso();
 if(reviewMode(s,'proof')==='automatic')applyProofReview(s,p,p.proofReview.hash,'automatic');
}
export function proclamationHash(p:Petition){const d=p.proclamationDraft;if(!d)throw new Error('No prepared proclamation.');return digest(JSON.stringify({title:d.title,text:d.text,factRefs:d.factRefs,verified:d.verified,model:d.model}));}
export function approveKnighthood(s:State,p:Petition,hash:string,note?:string){
 if(!eligible(s,p)||!p.proclamationDraft?.verified||p.proclamationDraft.factRefs.some(ref=>!s.completions.some(c=>c.id===ref&&c.memberId===p.memberId))||proclamationHash(p)!==hash)throw new Error('The eligible record or verified proclamation changed. Reload the review.');
 p.proclamationDraft.approvedHash=hash;p.proclamationDraft.approvedAt=iso();p.status='Approved — awaiting weekly induction';p.response='The owner approved your exact proclamation. Your title will be conferred in the weekly ceremony.';p.updatedAt=iso();ownerNote(s,p.id,note);
 s.audits.push({id:id(),at:iso(),action:'knighthood-approval',recordId:p.id,note:'Exact proclamation '+hash});
}
export function conferReviewedKnighthood(s:State,p:Petition){
 if(p.finalAt&&p.status==='Conferred')return false;
 const d=p.proclamationDraft;if(!d?.verified)throw new Error('A grounded proclamation is required.');
 if((reviewMode(s,'induction')==='owner'||d.origin==='assisted')&&d.approvedHash!==proclamationHash(p))throw new Error('Owner approval is required for this exact proclamation.');
 return induct(s,p.id,d.text,d.title,d.factRefs);
}

export function verifyAssistedProclamation(s:State,p:Petition,hash:string,note:string){
 if(reviewMode(s,'induction')!=='automatic')throw new Error('Owner approval is required for knighthood.');
 const d=p.proclamationDraft;
 if(!eligible(s,p)||!d||d.origin!=='assisted'||proclamationHash(p)!==hash)throw new Error('The eligible record or proclamation changed. Reload the review.');
 const words=d.text.trim().split(/\s+/).length;
 if(words<150||words>250||!d.factRefs.length||new Set(d.factRefs).size!==d.factRefs.length||d.factRefs.some(ref=>!s.completions.some(c=>c.id===ref&&c.memberId===p.memberId)))throw new Error('A complete proclamation grounded in accepted deeds is required.');
 if(d.verified&&d.approvedHash===hash)return false;
 d.verified=true;d.approvedHash=proclamationHash(p);d.approvedAt=iso();p.status='Approved — awaiting weekly induction';p.response='LEGION verified your proclamation against your accepted deeds. Your title awaits the weekly ceremony.';p.updatedAt=iso();
 s.audits.push({id:id(),at:iso(),action:'legion-grounding',recordId:p.id,note:'Exact proclamation '+d.approvedHash+'; '+note.slice(0,700)});return true;
}

export function reopenProofReview(s:State,p:Petition){
 if(p.kind!=='proof'||p.finalAt||p.status!=='More evidence needed')return false;
 const job=s.jobs.find(j=>j.kind==='proof'&&j.petitionId===p.id);if(!job)throw new Error('Proof review job is unavailable.');
 p.proofReview=undefined;p.status='Reviewing';p.response='Your evidence has been queued for another review.';p.updatedAt=iso();job.status='pending';job.attempts=0;job.reason=undefined;job.retryAt=undefined;job.leaseId=undefined;job.leaseUntil=undefined;
 s.audits.push({id:id(),at:iso(),action:'proof-return',recordId:p.id,note:'Member resubmitted the evidence for review after a requested correction.'});return true;
}
