import { id, iso, type State } from './domain.ts';
export function beginAssistedRun(s:State){
 if(s.meta[0].paused)throw new Error('The Steward is paused.');
 const now=iso();
 if(s.runs.some(r=>r.phase==='chat-review'&&r.status==='running'&&r.leaseUntil>now))return {acquired:false};
 for(const r of s.runs.filter(r=>r.phase==='chat-review'&&r.status==='running')){r.status='failed';r.finishedAt=now;r.detail='Review lease expired; unfinished work remains queued.';}
 const runId='chat-review:'+id(),leaseUntil=new Date(Date.now()+45*60_000).toISOString();s.runs.push({id:runId,phase:'chat-review',startedAt:now,leaseUntil,status:'running',count:0});return {acquired:true,runId,leaseUntil};
}
export function finishAssistedRun(s:State,runId:string,status:'done'|'failed',count:number,detail:string){
 const r=s.runs.find(r=>r.id===runId&&r.phase==='chat-review');if(!r||r.status!=='running'||r.leaseUntil<iso())throw new Error('Review lease expired or already finished.');
 r.status=status;r.count=count;r.detail=detail;r.finishedAt=iso();return {ok:true};
}
