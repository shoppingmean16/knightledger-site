import type { AssistedPack } from './assisted.ts';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

export const iso = () => new Date().toISOString();
export const id = () => randomUUID();
export const digest = (s: string) => createHash('sha256').update(s).digest('hex');
export const secret = () => randomBytes(32).toString('base64url');
export type Source = { title: string; url: string; checkedAt: string; fact?: string };
export type Locality = { id: string; name: string; parentId?: string; type: string; source: string; lat?: number; lon?: number; verified: boolean; aliases?: string[] };
export type Member = { id: string; alias: string; recoveryDigest: string; createdAt: string; localityId: string; visibility: 'masked'|'public'; hideLocality: boolean; rank: 'Squire'|'Knight'; target?: number; title?: string; undertaken: string[]; withdrawn?: boolean };
export type Session = { id: string; memberId: string; expiresAt: string };
export type Quest = { id: string; templateId: string; version: number; title: string; summary: string; benefit: string; effort: string; cost: string; localityId: string; mode: 'Digital'|'In person'; category: 'People'|'Other species'|'Shared places'|'Science'; project?:{name:string;url:string;requirements:string;availability:string}; steps: string[]; standard: string; evidence: string; constraints: string; sources: Source[]; recheckAt: string; status: 'draft'|'approved'|'published'|'removed'; approvedHash?: string; approvedAt?: string; publishedAt?: string; requestId?: string; promptVersion?: string; uncertainty?: string; replacesId?:string; replacedById?:string; revisions?:Omit<Quest,'revisions'>[] };
export type Petition = { id: string; memberId: string; kind: 'local'|'proof'|'knighthood'; status: string; createdAt: string; updatedAt: string; localityId: string; text: string; targetAt?: string; questId?: string; completionDate?: string; evidenceLink?: string; files?: string[]; publicConsent: boolean; chronicleConsent?: boolean; response?: string; draftId?: string; finalAt?: string; publicName?: string; visibility?: 'masked'|'public'; overdue?: boolean; proofReview?:{decision:'Accepted'|'More evidence needed'|'Declined';reason:string;summary:string;model:string;preparedAt:string;inputHash:string;hash:string}; proclamationDraft?:{title:string;text:string;factRefs:string[];verified?:boolean;model:string;approvedHash?:string;approvedAt?:string;origin?:'assisted'} };
export type Job = { id: string; petitionId?: string; questId?: string; kind: 'local'|'proof'|'knighthood'|'editorial'; status: 'pending'|'running'|'done'|'blocked'; attempts: number; createdAt: string; targetAt?: string; leaseUntil?: string; leaseId?: string; retryAt?: string; reason?: string; sources?: Source[]; promptVersion?: string };
export type Completion = { id: string; memberId: string; questId: string; templateId: string; petitionId: string; acceptedAt: string; completedOn?: string; account: string; standard: string; evidenceFingerprint: string; evidenceKeys?: string[]; deedFingerprint?: string; reason: string; model: string; promptVersion: string };
export type Chronicle = { id: string; memberId: string; title: string; text: string; factRefs: string[]; inductedAt: string; localityId: string; showLocality: boolean; alias: string; heraldry: string; rollId: string };
export type Prompt = { id: string; text: string; active: boolean; createdAt: string; parentId?: string; scores?: Record<string, number>; outcome?: string; feedbackIds?: string[]; evaluation?: { index:number; baseline:unknown[]; candidate:unknown[]; deterministicBaseline:number[]; deterministicCandidate:number[]; leaseUntil?:string; leaseId?:string; judge?:unknown; complete?:boolean; promoted?:boolean } };
export type Run = { id: string; phase: string; startedAt: string; leaseUntil: string; status: 'running'|'done'|'failed'; finishedAt?: string; detail?: string; count: number };
export type Audit = { id: string; at: string; action: string; recordId: string; note: string; reply?: string; resolvedAt?: string };
export type Evidence = { id: string; memberId: string; petitionId?: string; url: string; digest: string; createdAt: string; deleteAfter?: string; type: string; size: number };
export type Meta = { id: string; paused: boolean; lastPublication?: string; lastInduction?: string; promptId: string; lastError?: string; geocodeAt?:string; aiLeaseId?:string; aiLeaseUntil?:string; aiCalls: Record<string, number>; proofReviewMode?:'owner'|'automatic'; inductionReviewMode?:'owner'|'automatic'; assistedPacks?:AssistedPack[]; serviceChecks?:{ai?:{ok:boolean;checkedAt:string;model:string;message:string};research?:{ok:boolean;checkedAt:string;model:string;message:string}} };
export type State = { localities: Locality[]; members: Member[]; sessions: Session[]; quests: Quest[]; petitions: Petition[]; jobs: Job[]; completions: Completion[]; chronicles: Chronicle[]; prompts: Prompt[]; runs: Run[]; audits: Audit[]; evidence: Evidence[]; meta: Meta[] };
export const collections = ['localities','members','sessions','quests','petitions','jobs','completions','chronicles','prompts','runs','audits','evidence','meta'] as const;
export const questHash = (q: Quest) => digest(JSON.stringify({ ...q, revisions:undefined, status: undefined, approvedHash: undefined, approvedAt: undefined, publishedAt: undefined }));
export function sameTask(a:Quest,b:Quest){return ['title','summary','benefit','effort','cost','localityId','mode','category','steps','standard','evidence','constraints','templateId','project'].every(k=>JSON.stringify(a[k as keyof Quest])===JSON.stringify(b[k as keyof Quest]));}
export function windowFor(received: string | Date) {
  const t = new Date(received).getTime();
  const next = new Date(t); next.setUTCHours(next.getUTCHours() < 12 ? 12 : 24, 0, 0, 0);
  if (next.getTime() - t < 2 * 3600_000) next.setUTCHours(next.getUTCHours() + 12);
  return next.toISOString();
}
export function nextInduction(now = new Date()) {
  const d = new Date(now); d.setUTCDate(d.getUTCDate() + ((7-d.getUTCDay())%7)); d.setUTCHours(18,0,0,0);
  if (d <= now) d.setUTCDate(d.getUTCDate()+7); return d.toISOString();
}
export const qualified = (s: State, localityId: string) => s.members.filter(m => m.localityId===localityId && !m.withdrawn && s.completions.some(c=>c.memberId===m.id)).length;
export const targetFor = (n: number) => n<50 ? 3 : n<250 ? 5 : 7;
export const progress = (s: State, memberId: string) => s.completions.filter(c=>c.memberId===memberId).length;
export function approve(s: State, questId: string, version: number) {
  const q=s.quests.find(q=>q.id===questId); if(!q || q.version!==version || q.status==='published' || q.status==='removed') throw new Error('The draft changed. Reload the prepared list.');
  if(s.jobs.some(j=>j.questId===q.id&&j.kind==='editorial'&&j.status!=='done'))throw new Error('This proposal is still awaiting research. Review the finished revision before approving.');
  q.approvedHash=questHash(q);q.approvedAt=iso();q.status='approved';
  const p=s.petitions.find(p=>p.id===q.requestId); if(p){p.status='Approved for publication';p.updatedAt=iso();}
  s.audits.push({id:id(),at:iso(),action:'approve',recordId:q.id,note:`Exact version ${version}, hash ${q.approvedHash}`});
}
export function publish(s: State, now = iso()) {
  let n=0;
  for(const q of s.quests) {
    const p=s.petitions.find(p=>p.id===q.requestId);
    if(q.status==='approved'&&Date.parse(q.recheckAt)<=Date.parse(now)&&p){const j=s.jobs.find(j=>j.petitionId===p.id);if(j){q.status='removed';q.approvedHash=undefined;j.status='pending';j.attempts=0;j.retryAt=undefined;j.leaseUntil=undefined;j.sources=[];p.status='Researching';p.response='The source recheck date passed before publication. Research has reopened automatically; a fresh proposal and approval are required.';p.updatedAt=now;p.overdue=!!p.targetAt&&p.targetAt<now;}continue;}
    if(q.status==='approved' && q.approvedHash===questHash(q) && Date.parse(q.recheckAt)>Date.parse(now) && (!p?.targetAt || p.targetAt<=now)) {
      if(q.replacesId){const previous=s.quests.find(x=>x.id===q.replacesId);if(!previous||previous.status!=='published'||q.version!==previous.version+1||!sameTask(previous,q))continue;previous.status='removed';previous.replacedById=q.id;for(const m of s.members)m.undertaken=m.undertaken.map(id=>id===previous.id?q.id:id);}
      q.status='published';q.publishedAt=now;n++;
      if(p){p.status='Published';p.updatedAt=now;p.response=`A researched quest is on the board: ${q.title}.`;p.finalAt=now;}
    }
  }
  s.meta[0].lastPublication=now; return n;
}
const normalizedAccount=(text:string)=>text.trim().toLowerCase().replace(/\s+/g,' ');
const normalizedLink=(link:string)=>{const url=new URL(link);url.hash='';return url.toString();};
export function freshProof(s:State,p:Petition){
  const q=s.quests.find(q=>q.id===p.questId),files=s.evidence.filter(e=>p.files?.includes(e.id));
  const link=p.evidenceLink?normalizedLink(p.evidenceLink):'';
  const evidenceKeys=[...(link?[digest('link:'+link)]:[]),...files.map(e=>digest('image:'+e.digest))];
  const fingerprint=digest(JSON.stringify([link,...files.map(e=>e.digest).sort(),normalizedAccount(p.text)]));
  const deedFingerprint=digest(JSON.stringify([p.memberId,q?.templateId,p.completionDate,normalizedAccount(p.text)]));
  if(s.completions.some(c=>c.evidenceFingerprint===fingerprint||c.deedFingerprint===deedFingerprint))throw new Error('This deed or account already received credit. Submit a separate contribution with fresh evidence.');
  if(evidenceKeys.some(key=>s.completions.some(c=>c.evidenceKeys?.includes(key))))throw new Error('This image or public evidence link already received credit. Each new deed needs its own evidence.');
  // Compatibility for records accepted before durable evidence hashes were introduced.
  if(files.some(e=>s.evidence.some(other=>other.id!==e.id&&other.digest===e.digest&&s.completions.some(c=>c.petitionId===other.petitionId))))throw new Error('An image already received credit.');
  if(link&&s.completions.some(c=>{const prior=s.petitions.find(x=>x.id===c.petitionId)?.evidenceLink;return prior&&normalizedLink(prior)===link;}))throw new Error('This public evidence link already received credit.');
  return {fingerprint,evidenceKeys,deedFingerprint};
}
export function acceptProof(s: State, p: Petition, reason: string, model: string, summary?:string) {
  const m=s.members.find(m=>m.id===p.memberId),q=s.quests.find(q=>q.id===p.questId);
  if(!m||!q||q.status!=='published'&&!q.replacedById&&!q.publishedAt)throw new Error('Published quest or passport no longer available.');
  if(s.completions.some(c=>c.petitionId===p.id)){return false;}
  const files=s.evidence.filter(e=>p.files?.includes(e.id));
  const {fingerprint,evidenceKeys,deedFingerprint}=freshProof(s,p);
  m.target??=targetFor(qualified(s,m.localityId));
  s.completions.push({id:id(),memberId:m.id,questId:q.id,templateId:q.templateId,petitionId:p.id,acceptedAt:iso(),completedOn:p.completionDate,account:summary||p.text.slice(0,400),standard:q.standard,evidenceFingerprint:fingerprint,evidenceKeys,deedFingerprint,reason,model,promptVersion:'proof-v2-repeat-deeds'});
  p.status='Accepted';p.response=reason;p.updatedAt=iso();p.finalAt=iso();
  for(const f of files)f.deleteAfter=new Date(Date.now()+30*86400_000).toISOString();
  return true;
}
export function eligible(s: State, p: Petition) { const m=s.members.find(m=>m.id===p.memberId);return !!m&&!m.withdrawn&&s.localities.some(l=>l.id===m.localityId&&l.verified)&&m.rank==='Squire'&&!!m.target&&progress(s,m.id)>=m.target&&!!p.chronicleConsent; }
export function induct(s: State, petitionId: string, text: string, title: string, factRefs: string[], now=iso()) {
  const p=s.petitions.find(p=>p.id===petitionId);if(!p||!eligible(s,p))throw new Error('Petition is not eligible.');
  const m=s.members.find(m=>m.id===p.memberId)!;
  if(factRefs.some(ref=>!s.completions.some(c=>c.id===ref&&c.memberId===m.id)))throw new Error('The proclamation cites unaccepted work.');
  if(text.trim().split(/\s+/).length<150||text.trim().split(/\s+/).length>250)throw new Error('Proclamation must contain 150–250 words.');
  m.rank='Knight';m.title=title;
  s.chronicles.push({id:id(),memberId:m.id,title,text,factRefs,inductedAt:now,localityId:m.localityId,showLocality:!m.hideLocality,alias:p.publicName||m.alias,heraldry:digest(m.id).slice(0,12),rollId:now.slice(0,10)});
  p.status='Conferred';p.finalAt=now;p.updatedAt=now;s.meta[0].lastInduction=now;return true;
}
export const publicQuest=(q:Quest)=>({...q,revisions:undefined,requestId:undefined,approvedHash:undefined,approvedAt:undefined,promptVersion:undefined,uncertainty:undefined,sources:q.sources.map(source=>({title:source.title,url:source.url,checkedAt:source.checkedAt}))});
export function sanitizePublic(s: State) {
  return {
    quests:s.quests.filter(q=>q.status==='published').map(publicQuest),localities:s.localities.filter(l=>l.verified).map(l=>({...l,aliases:undefined})),
    coverage:s.localities.filter(l=>l.id!=='everywhere'&&l.verified).map(l=>({localityId:l.id,squires:s.members.filter(m=>!m.withdrawn&&m.localityId===l.id&&m.rank==='Squire').length,knights:s.chronicles.filter(c=>c.localityId===l.id).length,quests:s.quests.filter(q=>q.status==='published'&&q.localityId===l.id).length})).filter(c=>c.squires+c.knights+c.quests>0),
    petitions:s.petitions.filter(p=>p.kind==='local'&&p.publicConsent&&['Ready for approval','Approved for publication','Published'].includes(p.status)).map(p=>({id:p.id,localityId:p.localityId,status:p.status,response:p.response||'The Steward has prepared a researched proposal.',questId:p.draftId,createdAt:p.createdAt})),
    chronicles:s.chronicles.map(c=>({...c,memberId:undefined,localityId:c.showLocality?c.localityId:undefined})),lastPublication:s.meta[0].lastPublication,nextPublication:windowFor(new Date(Date.now()-2*3600_000)),nextIntakeTarget:windowFor(new Date()),nextInduction:nextInduction(),paused:s.meta[0].paused,
  };
}
export function privateLedger(s: State, memberId: string) {
 const m=s.members.find(m=>m.id===memberId);if(!m)return null;
 return {member:{...m,recoveryDigest:undefined},petitions:s.petitions.filter(p=>p.memberId===m.id),completions:s.completions.filter(c=>c.memberId===m.id),quests:s.quests.filter(q=>q.status==='published'&&m.undertaken.includes(q.id)).map(publicQuest),progress:progress(s,m.id),qualified:qualified(s,m.localityId),knights:s.chronicles.filter(c=>c.localityId===m.localityId).length};
}
export function leaseJob(s:State, now=iso()) {
 const j=s.jobs.filter(j=>j.kind!=='knighthood'&&j.status!=='done'&&j.attempts<5&&(!j.leaseUntil||j.leaseUntil<now)&&(!j.retryAt||j.retryAt<=now)).sort((a,b)=>(a.targetAt||a.createdAt).localeCompare(b.targetAt||b.createdAt))[0];
 if(!j||s.meta[0].paused)return null;j.status='running';j.attempts++;j.leaseId=id();j.leaseUntil=new Date(Date.parse(now)+4*60000).toISOString();j.reason=undefined;
 const p=s.petitions.find(p=>p.id===j.petitionId);if(p){p.status=j.kind==='local'?'Researching':'Reviewing';p.updatedAt=now;}return structuredClone(j);
}
export function failJob(s:State,jobId:string,leaseId:string,reason:string,now=iso()) {
 const j=s.jobs.find(j=>j.id===jobId);if(!j||j.leaseId!==leaseId)return false;j.status='blocked';j.reason=reason+(j.attempts>=5?' Automatic retries are exhausted; the owner must resolve the service issue and retry.':'');j.retryAt=new Date(Date.parse(now)+Math.min(6*3600000,15*60000*2**Math.min(j.attempts,5))).toISOString();j.leaseUntil=undefined;
 const p=s.petitions.find(p=>p.id===j.petitionId);if(p){p.response=j.reason;p.updatedAt=now;p.overdue=!!p.targetAt&&p.targetAt<now;}s.meta[0].lastError=j.reason;return true;
}
