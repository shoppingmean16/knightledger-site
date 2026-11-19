import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import sharp from 'sharp';
import { put, get } from '@vercel/blob';
import { createHmac } from 'node:crypto';
import { getVercelOidcTokenSync } from '@vercel/oidc';
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { load, change, databaseConfigured, storageMode } from '@/lib/store';
import { id, iso, secret, digest, sanitizePublic, privateLedger, windowFor, approve, eligible, sameTask, freshProof, type State, type Locality } from '@/lib/domain';
import { SESSION, OPERATOR, cookieOptions, currentMember, isOperator, equal, operatorToken } from '@/lib/auth';
import { worker, retention } from '@/lib/worker';
import { applyProofReview, ownerNote, approveKnighthood, proclamationHash, verifyAssistedProclamation, reopenProofReview } from '@/lib/review';
import { assistedMode } from '@/lib/mode';
import { beginAssistedRun, finishAssistedRun } from '@/lib/assisted-run';
import { preparePack, assistedResultsSchema, retrieveAssistedSources, importAssistedResult } from '@/lib/assisted';
import { verifyLocality } from '@/lib/localities';
import { requestEditorialRevision } from '@/lib/editorial';
import { prepareMoltbook, simplifyMoltbook } from '@/lib/moltbook';
import {trimQuestCopy} from '@/lib/quest-copy';
import {proofAccount} from '@/lib/proof-input';
import {assertAgentQuestAccess} from '@/lib/agent-quests';
import { releaseReadiness } from '@/lib/readiness';
import { safeUrl, publicError, reserveCall, model, fetchSource, withAIStatus } from '@/lib/research';
const REQUEST_COOKIE='kl_requests';
const requestOwner=(req:NextRequest)=>{const token=req.cookies.get(REQUEST_COOKIE)?.value;return token?'request-'+digest(token):null;};
export const runtime='nodejs';export const maxDuration=300;export const dynamic='force-dynamic';
const response=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
const str=(max:number)=>z.string().trim().max(max);
const sourceUrl=z.union([z.literal(''),z.string().url().max(1500)]).optional();
function aiConfigured(){try{return !!(process.env.AI_GATEWAY_API_KEY||getVercelOidcTokenSync());}catch{return false;}}
function mutationOrigin(req:NextRequest){const origin=req.headers.get('origin');const host=req.headers.get('host');if(!origin||!host)throw new Error('This action must be submitted from KnightLedger.');const u=new URL(origin);if(u.host!==host||!['http:','https:'].includes(u.protocol)||u.username||u.password)throw new Error('This action must be submitted from KnightLedger.');}
function rate(s:State,key:string,max=12){const today=iso().slice(0,10);if(s.audits.filter(a=>a.action==='rate'&&a.recordId===key&&a.at.startsWith(today)).length>=max)throw new Error('The daily submission limit was reached. Please return tomorrow.');s.audits.push({id:id(),at:iso(),action:'rate',recordId:key,note:''});s.audits=s.audits.filter(a=>a.action!=='rate'||Date.now()-new Date(a.at).getTime()<2*86400_000);}
function resolveLocality(s:State,input:string):Locality{
 const normalized=input.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();if(normalized.length<2||normalized.length>130)throw new Error('Enter a town and region, or a recognized city neighborhood.');
 const existing=s.localities.find(l=>l.id!=='everywhere'&&(l.id===input||l.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()===normalized||l.aliases?.includes(normalized)));
 if(existing)return existing;
 const loc:Locality={id:'place-'+digest(normalized).slice(0,18),name:input.trim(),type:'pending verification',source:'',verified:false,aliases:[normalized]};s.localities.push(loc);return loc;
}
const kick=()=>after(async()=>{try{await worker('refresh',true);}catch{/* Durable job and status remain authoritative. */}});
export async function GET(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 const path=(await params).path.join('/');
 try{
  if(path.startsWith('cron/')){if(!process.env.CRON_SECRET||!equal(req.headers.get('authorization')||'',`Bearer ${process.env.CRON_SECRET}`))return response({error:'Unauthorized'},401);return response(await worker(path.split('/')[1]));}
  if(path==='status')return response({database:databaseConfigured(),privateStorage:!!process.env.BLOB_READ_WRITE_TOKEN,aiAuth:aiConfigured(),temporaryDatabaseExpiresAt:storageMode()==='blob'?null:process.env.NEON_DATABASE_EXPIRES_AT||null});
  const {state}=await load();
  if(path==='agents'||path==='agents/quests')return response({version:1,guide:'https://www.knightledger.com/agents',contact:'jason@knightledger.com',rules:['Use an agent passport and keep its recovery code private.','Only AI agent: Yes quests qualify for independent completion.','Follow destination automation rules and required bot approvals.','Fresh, truthful contributions only; no bulk outreach or invented physical work.'],endpoints:{enroll:{method:'POST',path:'/api/enroll',body:{alias:'YourAgentName',actorType:'agent',locality:'everywhere',visibility:'masked',hideLocality:true}},proof:{method:'POST',path:'/api/petition/proof',body:{questId:'eligible-quest-id',completionDate:'YYYY-MM-DD',text:'Optional for Moltbook with a public contribution link; otherwise describe the completed deed in at least 40 characters.',evidenceLink:'https://public-contribution-url'}},ledger:{method:'GET',path:'/api/ledger'}},transport:{origin:'https://www.knightledger.com',authentication:'Retain the session cookie from enroll. Recover with POST /api/recover and {code:privateRecoveryCode}. Never share that code.',proofReview:'Proof returns a receipt; credit is applied only after review. Read /api/ledger for status.'},quests:sanitizePublic(state).quests.filter(q=>q.aiAgent.allowed&&Date.parse(q.recheckAt)>Date.now())});
  if(path==='public')return response(sanitizePublic(state));
  if(path==='requests'){const m=await currentMember(state),owner=requestOwner(req);return response({requests:state.petitions.filter(p=>p.kind==='local'&&(p.memberId===m?.id||p.memberId===owner)).map(p=>({id:p.id,locality:state.localities.find(l=>l.id===p.localityId)?.name,status:p.status,response:p.response,targetAt:p.targetAt,questId:p.status==='Published'?p.draftId:undefined,overdue:!!p.targetAt&&!p.finalAt&&p.targetAt<iso()}))});}
  const member=await currentMember(state);
  if(path==='ledger')return response(member?privateLedger(state,member.id):{member:null});
  if(path==='operator'){if(!await isOperator())return response({authorized:false},401);return response(operatorView(state));}
  if(path.startsWith('evidence/')){
   const file=state.evidence.find(e=>e.id===path.split('/')[1]);if(!file||file.memberId!==member?.id&&!await isOperator())return response({error:'Not found'},404);
   const result=await get(file.url,{token:process.env.BLOB_READ_WRITE_TOKEN,access:'private'});if(!result||result.statusCode!==200)return response({error:'Not found'},404);
   return new Response(result.stream,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','Content-Disposition':'inline; filename="private-evidence.jpg"','X-Content-Type-Options':'nosniff'}});
  }
  return response({error:'Not found'},404);
 }catch(e){return response({error:publicError(e)},503);}
}
function operatorView(s:State){return {authorized:true,assisted:assistedMode(),storage:storageMode(),readiness:releaseReadiness(s),proofs:s.petitions.filter(p=>p.kind==='proof'&&p.status==='Ready for owner review'&&p.proofReview),knighthoods:s.petitions.filter(p=>p.kind==='knighthood'&&!p.finalAt&&(p.proclamationDraft?.verified||p.proclamationDraft?.origin==='assisted')).map(p=>({...p,participantType:s.members.find(m=>m.id===p.memberId)?.actorType||'human',reviewHash:proclamationHash(p),acceptedDeeds:s.completions.filter(c=>c.memberId===p.memberId).map(c=>({id:c.id,account:c.account,standard:c.standard,completedOn:c.completedOn}))})),notes:s.audits.filter(a=>a.action==='owner-note'&&!a.resolvedAt),quests:s.quests.filter(q=>q.status!=='published'&&q.status!=='removed'),requests:s.petitions.filter(p=>p.kind==='local').map(p=>({...p,memberId:undefined})),jobs:s.jobs,localities:s.localities,runs:s.runs.slice(-35).reverse(),prompts:s.prompts,settings:s.meta[0],evidenceCount:s.evidence.length,temporaryDatabaseExpiresAt:storageMode()==='blob'?null:process.env.NEON_DATABASE_EXPIRES_AT||null,aiConfigured:aiConfigured(),blobConfigured:!!process.env.BLOB_READ_WRITE_TOKEN};}
export async function POST(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 const path=(await params).path.join('/');
 try{
  mutationOrigin(req);
  if(Number(req.headers.get('content-length')||0)>4_000_000) return response({error:'Submission too large.'},413);
  const {state}=await load();const member=await currentMember(state);
  if(path==='upload'){
  if(!member)return response({error:'A Squire passport is required to record proof.'},401);
   if(!process.env.BLOB_READ_WRITE_TOKEN)return response({error:'Private evidence storage is not configured. Text-only proof is available.'},503);
   const form=await req.formData(),files=form.getAll('files');if(files.length<1||files.length>3)throw new Error('Choose one to three small images.');
   if(state.evidence.filter(e=>e.memberId===member!.id&&new Date(e.createdAt).getTime()>Date.now()-86400_000).length+files.length>12)throw new Error('The daily image limit was reached.');
   const uploaded=[];
   for(const file of files){
    if(!(file instanceof File)||file.size>1_200_000||file.size<20)throw new Error('Each image must be a JPEG, PNG or WebP under 1.2 MB.');
    const bytes=Buffer.from(await file.arrayBuffer());const image=sharp(bytes,{limitInputPixels:12_000_000});const metadata=await image.metadata();if(!['jpeg','png','webp'].includes(metadata.format||''))throw new Error('Actual image type must be JPEG, PNG or WebP.');
    const clean=await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();const eid=id();
    const stored=await put(`evidence/${eid}.jpg`,clean,{token:process.env.BLOB_READ_WRITE_TOKEN,access:'private',contentType:'image/jpeg',addRandomSuffix:true});
    const e={id:eid,memberId:member.id,url:stored.url,digest:digest(clean.toString('base64')),createdAt:iso(),deleteAfter:new Date(Date.now()+86400_000).toISOString(),type:'image/jpeg',size:clean.length};
    await change(s=>{if(!s.members.some(m=>m.id===member!.id&&!m.withdrawn))throw new Error('Passport is unavailable.');s.evidence.push(e);});uploaded.push(eid);
   }return response({files:uploaded});
  }
  const body=await req.json();
  if(path==='operator/login'){
   const {password}=z.object({password:str(250)}).parse(body);
   const key=createHmac('sha256',process.env.SESSION_SECRET||'not-configured').update(iso().slice(0,10)+':operator:'+(req.headers.get('x-forwarded-for')||'local')).digest('hex');
   // Commit attempts before checking credentials so rejected attempts cannot roll them back.
   await change(s=>rate(s,key,30));
   if(!process.env.OPERATOR_SECRET||!equal(password,process.env.OPERATOR_SECRET))return response({error:'The Steward key was not recognized.'},401);
   const res=response({ok:true});res.cookies.set(OPERATOR,operatorToken(),{...cookieOptions,maxAge:8*3600});return res;
  }
  if(path==='enroll'||path==='recover'){
   const networkKey=createHmac('sha256',process.env.SESSION_SECRET||'not-configured').update(iso().slice(0,10)+':'+(req.headers.get('x-forwarded-for')||'local')).digest('hex');
   const token=secret(),sid=digest(token);let recoveryCode:string|undefined;let mid:string;
   if(path==='enroll'){
    if(member)throw new Error('This passport is already enrolled.');
    const data=z.object({actorType:z.enum(['human','agent']).default('human'),alias:str(45).optional(),locality:str(130).min(2),visibility:z.enum(['public','masked']).default('masked'),hideLocality:z.boolean().default(true)}).parse(body);recoveryCode=secret();mid=id();
    await change(s=>{rate(s,networkKey,8);const loc=data.actorType==='agent'&&data.locality==='everywhere'?s.localities.find(l=>l.id==='everywhere')!:resolveLocality(s,data.locality);const alias=data.alias||`Squire ${mid.slice(0,6).toUpperCase()}`;s.members.push({actorType:data.actorType,id:mid,alias,localityId:loc.id,visibility:data.visibility,hideLocality:data.hideLocality,recoveryDigest:digest(recoveryCode!),createdAt:iso(),rank:'Squire',undertaken:[]});s.sessions.push({id:sid,memberId:mid,expiresAt:new Date(Date.now()+30*86400_000).toISOString()});});
   }else{
    const {code}=z.object({code:str(100).min(30)}).parse(body);
    await change(s=>rate(s,networkKey,30));
    mid=await change(s=>{const m=s.members.find(m=>equal(m.recoveryDigest,digest(code))&&!m.withdrawn);if(!m)throw new Error('Recovery code not recognized.');s.sessions.push({id:sid,memberId:m.id,expiresAt:new Date(Date.now()+30*86400_000).toISOString()});return m.id;});
   }
   const res=response({ok:true,recoveryCode});res.cookies.set(SESSION,token,{...cookieOptions,maxAge:30*86400});return res;
  }
  if(path==='logout'){await change(s=>{const token=req.cookies.get(SESSION)?.value;s.sessions=s.sessions.filter(x=>x.id!==digest(token||''));});const res=response({ok:true});res.cookies.delete(SESSION);res.cookies.delete(OPERATOR);return res;}
  if(path.startsWith('operator/')){
   if(!await isOperator())return response({error:'Operator access required.'},401);
   const action=path.slice(9);
   if(action==='trim-quest-copy')return response(await change(s=>trimQuestCopy(s,z.object({items:z.array(z.object({id:z.string(),version:z.number().int().positive()}).strict()).min(1).max(24)}).strict().parse(body).items)));
   if(action==='simplify-moltbook')return response(await change(s=>simplifyMoltbook(s,z.union([z.literal(1),z.literal(2)]).parse(body.expectedVersion))));
   if(action==='prepare-moltbook')return response(await change(prepareMoltbook));
   if(action==='begin-review-run')return response(await change(beginAssistedRun));
   if(action==='finish-review-run'){
    const data=z.object({runId:z.string().max(90),status:z.enum(['done','failed']),count:z.number().int().min(0).max(24),detail:str(700)}).strict().parse(body);
    return response(await change(s=>finishAssistedRun(s,data.runId,data.status,data.count,data.detail)));
   }
   if(action==='prepare-work'){
    if(!assistedMode())throw new Error('Assisted mode is not enabled.');
    const filter=z.enum(['all','local','editorial','proof','knighthood','note']).default('all').parse(body.kind);
    const {state:pending}=await load();const placeIds=[...new Set(pending.jobs.filter(j=>j.status!=='done'&&(filter==='all'||j.kind===filter)&&['local','proof'].includes(j.kind)).flatMap(j=>{const p=pending.petitions.find(p=>p.id===j.petitionId);const m=pending.members.find(m=>m.id===p?.memberId);return [j.kind==='local'?p?.localityId:m?.localityId].filter((x):x is string=>!!x&&pending.localities.some(l=>l.id===x&&!l.verified));}))].slice(0,6);
    for(const placeId of placeIds){try{await new Promise(resolve=>setTimeout(resolve,1250));await verifyLocality(placeId);}catch(e){await change(s=>{for(const j of s.jobs.filter(j=>s.petitions.some(p=>p.id===j.petitionId&&p.localityId===placeId)&&j.status!=='done'))j.reason=publicError(e);});}}
    return response(await change(s=>preparePack(s,filter)));
   }
   if(action==='import-work'){
    const payload=assistedResultsSchema.parse(body.payload);const imported:string[]=[],duplicates:string[]=[],errors:{id:string;reason:string}[]=[];
    for(const result of payload.results){try{const sources=await retrieveAssistedSources(result);const out=await change(s=>importAssistedResult(s,payload.packId,result,sources));(out.duplicate?duplicates:imported).push(result.recordId);}catch(e){errors.push({id:result.recordId,reason:publicError(e)});}}
    return response({ok:!errors.length,imported,duplicates,errors});
   }
   if(action==='check-source'){const url=z.enum(['https://www.amherstma.gov/','https://www.nyc.gov/site/planning/data-maps/open-data.page']).parse(body.url);const text=await fetchSource(url);return response({ok:true,url,characters:text.length,excerpt:text.slice(0,350)});}
   if(action==='claim-database'){
    if(!process.env.NEON_PROJECT_ID||!process.env.NEON_CLAIM_ASSERTION)throw new Error('No temporary database claim is configured.');
    const tokenResponse=await fetch('https://claimable.neon.tech/v1/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:process.env.NEON_CLAIM_ASSERTION,resource:'https://claimable.neon.tech/'}),signal:AbortSignal.timeout(15000)});
    if(!tokenResponse.ok)throw new Error('Neon could not authorize the claim. The database may already have been claimed.');const token=await tokenResponse.json();
    const claim=await fetch(`https://claimable.neon.tech/v1/projects/${encodeURIComponent(process.env.NEON_PROJECT_ID)}/claim`,{method:'POST',headers:{Authorization:`Bearer ${token.access_token}`},signal:AbortSignal.timeout(15000)});if(!claim.ok)throw new Error('Neon could not prepare the claim.');const data=await claim.json();
    const url=new URL(data.verification_uri_complete);if(url.protocol!=='https:'||!(url.hostname==='neon.com'||url.hostname.endsWith('.neon.tech')))throw new Error('Unexpected claim destination.');return response({url:url.href,expiresIn:data.expires_in});
   }
   if(action==='check-ai'){
    if(assistedMode())return response({ok:false,message:'Assisted mode uses private work packs. No model API call was made.'});
    await reserveCall();try{const r=await withAIStatus(()=>generateText({model:gateway(model()),prompt:'Reply with the word ready.',maxOutputTokens:40,maxRetries:0,abortSignal:AbortSignal.timeout(30000)}));return response({ok:true,model:model(),text:r.text});}catch(e){const error=e as {statusCode?:number;cause?:{statusCode?:number}};return response({ok:false,statusCode:error.statusCode||error.cause?.statusCode,message:publicError(e)});}
   }
   if(action==='phase'){
    const {phase}=z.object({phase:z.enum(['refresh','publish00','publish12','induction','retention','prompt-evaluate'])}).parse(body);
    // Manual publication is useful in staging; induction still respects the weekly ceremony.
    return response(await worker(phase,phase!=='induction'));
   }
   if(action==='pause'){await change(s=>{s.meta[0].paused=z.boolean().parse(body.paused);});return response({ok:true});}
   if(action==='approve'){
    const {items}=z.object({items:z.array(z.object({id:z.string(),version:z.number().int(),note:str(1000).optional()})).min(1).max(50)}).parse(body);
    await change(s=>{for(const item of items){approve(s,item.id,item.version);ownerNote(s,item.id,item.note);}});return response({ok:true});
   }
   if(action==='review-modes'){
    const data=z.object({proof:z.enum(['owner','automatic']),induction:z.enum(['owner','automatic'])}).parse(body);await change(s=>{s.meta[0].proofReviewMode=data.proof;s.meta[0].inductionReviewMode=data.induction;s.audits.push({id:id(),at:iso(),action:'review-policy',recordId:'settings',note:JSON.stringify(data)});});return response({ok:true});
   }
   if(action==='proof-review'){
    const data=z.object({id:z.string(),hash:z.string().length(64),decision:z.enum(['approve','return','more-evidence','decline']),note:str(1000).default('')}).parse(body);if(data.decision!=='approve'&&data.note.length<10)throw new Error('Please give a specific reason.');
    await change(s=>{const p=s.petitions.find(p=>p.id===data.id&&p.kind==='proof');if(!p||p.finalAt||p.proofReview?.hash!==data.hash)throw new Error('The prepared review changed. Reload.');if(data.decision==='return'){p.proofReview=undefined;p.status='Reviewing';p.response='The owner requested a more careful review.';s.audits.push({id:id(),at:iso(),action:'proof-return',recordId:p.id,note:data.note});const j=s.jobs.find(j=>j.petitionId===p.id);if(j){j.status='pending';j.attempts=0;j.retryAt=undefined;j.leaseUntil=undefined;}}else applyProofReview(s,p,data.hash,'owner',data.decision==='more-evidence'?'More evidence needed':data.decision==='decline'?'Declined':undefined,data.note);});if(data.decision==='return')kick();return response({ok:true});
   }
   if(action==='verify-proclamation'){
    const data=z.object({id:z.string(),hash:z.string().length(64),groundingConfirmed:z.literal(true),note:str(700).min(25)}).strict().parse(body);
    const changed=await change(s=>{const p=s.petitions.find(p=>p.id===data.id&&p.kind==='knighthood'&&!p.finalAt);if(!p)throw new Error('Pending knighthood not found.');return verifyAssistedProclamation(s,p,data.hash,data.note);});return response({ok:true,changed});
   }
   if(action==='knight-review'){
    const data=z.object({id:z.string(),hash:z.string().length(64),decision:z.enum(['approve','return']),groundingConfirmed:z.boolean().default(false),note:str(1000).default('')}).parse(body);if(data.decision==='return'&&data.note.length<10)throw new Error('Please give a specific revision.');await change(s=>{const p=s.petitions.find(p=>p.id===data.id&&p.kind==='knighthood');if(!p||p.finalAt||!p.proclamationDraft||proclamationHash(p)!==data.hash)throw new Error('The proclamation changed. Reload.');if(data.decision==='approve'){if(p.proclamationDraft.origin==='assisted'&&!p.proclamationDraft.verified){if(!data.groundingConfirmed)throw new Error('Verify the proclamation against accepted deeds before approving.');const words=p.proclamationDraft.text.trim().split(/\s+/).length;if(words<150||words>250)throw new Error('A proclamation needs 150–250 words.');p.proclamationDraft.verified=true;s.audits.push({id:id(),at:iso(),action:'owner-grounding',recordId:p.id,note:'Owner checked the exact assisted proclamation against accepted deeds.'});}approveKnighthood(s,p,proclamationHash(p),data.note);}else{p.proclamationDraft=undefined;p.status='Eligible — proclamation revision requested';p.response='The owner requested a revision to your proclamation. Your accepted work remains eligible.';s.audits.push({id:id(),at:iso(),action:'proclamation-return',recordId:p.id,note:data.note});}});if(data.decision==='return')kick();return response({ok:true});
   }
   if(action==='note'){
    const data=z.object({id:z.string(),note:str(1000).min(1)}).parse(body);await change(s=>{if(!s.quests.some(q=>q.id===data.id)&&!s.petitions.some(p=>p.id===data.id))throw new Error('Record not found.');ownerNote(s,data.id,data.note);});return response({ok:true});
   }
   if(action==='note-done'){await change(s=>{const note=s.audits.find(a=>a.id===body.id&&a.action==='owner-note');if(!note)throw new Error('Note not found.');note.resolvedAt=iso();});return response({ok:true});}
   if(action==='edit'){
    const data=z.object({id:z.string(),version:z.number().int(),title:str(100).min(8),summary:str(280).min(10),standard:str(700).min(50),benefit:str(500).min(10).optional(),effort:str(70).optional(),cost:str(150).optional(),mode:z.enum(['Digital','In person']).optional(),category:z.enum(['People','Other species','Shared places','Science']).optional(),steps:z.array(str(600).min(15)).min(3).max(6).optional(),evidence:str(600).min(40).optional(),constraints:str(700).min(30).optional()}).parse(body);
    await change(s=>{const q=s.quests.find(q=>q.id===data.id);if(!q||q.version!==data.version||q.status==='published')throw new Error('Draft changed. Reload.');if(q.replacesId){const published=s.quests.find(x=>x.id===q.replacesId);if(!published||!sameTask(published,{...q,...data}))throw new Error('A source-only refresh preserves the published task and evidence standard.');}const previous={...q};delete previous.revisions;q.revisions=[...(q.revisions||[]),previous];for(const [key,value] of Object.entries(data)){if(key!=='id'&&key!=='version'&&value!==undefined)(q as unknown as Record<string,unknown>)[key]=value;}for(const j of s.jobs.filter(j=>j.kind==='editorial'&&j.questId===q.id&&j.status!=='done')){j.status='done';j.leaseId=undefined;j.leaseUntil=undefined;j.reason='Resolved by the owner’s direct edit.';}q.version++;q.status='draft';q.approvedHash=undefined;q.approvedAt=undefined;s.audits.push({id:id(),at:iso(),action:'edit',recordId:q.id,note:'Owner edited draft fields: '+Object.keys(data).filter(k=>!['id','version'].includes(k)).join(', ')});const p=s.petitions.find(p=>p.id===q.requestId);if(p)p.status='Ready for approval';});return response({ok:true});
   }
   if(['return','decline','remove'].includes(action)){
    const {id:qid,reason}=z.object({id:z.string(),reason:str(500).min(10)}).parse(body);
    await change(s=>{const q=s.quests.find(q=>q.id===qid);if(!q)throw new Error('Quest not found.');if(action==='return'&&!q.requestId){requestEditorialRevision(s,q,reason);return;}q.status='removed';q.approvedHash=undefined;for(const j of s.jobs.filter(j=>j.kind==='editorial'&&j.questId===q.id&&j.status!=='done')){j.status='done';j.leaseId=undefined;j.leaseUntil=undefined;j.reason='Removed by the owner.';}const p=s.petitions.find(p=>p.id===q.requestId);if(p){p.status=action==='return'?'Researching':'Declined';p.response=reason;p.updatedAt=iso();if(action==='return'){const j=s.jobs.find(j=>j.petitionId===p.id)!;j.status='pending';j.attempts=0;j.retryAt=undefined;j.leaseId=undefined;j.leaseUntil=undefined;j.sources=[];j.reason=reason;p.draftId=undefined;}else p.finalAt=iso();}s.audits.push({id:id(),at:iso(),action,recordId:q.id,note:reason});});if(action==='return')kick();return response({ok:true});
   }
   if(action==='prompt-rollback'){
    const pid=z.string().parse(body.id);await change(s=>{const p=s.prompts.find(p=>p.id===pid);if(!p)throw new Error('Prompt not found.');if(pid!=='quest-v1'&&!s.audits.some(a=>a.action==='prompt-validation'&&a.recordId===pid))throw new Error('This candidate has not passed independent validation.');for(const x of s.prompts)x.active=x.id===pid;s.meta[0].promptId=pid;s.audits.push({id:id(),at:iso(),action:'prompt-rollback',recordId:pid,note:'Owner selected a previously validated version.'});});return response({ok:true});
   }
   if(action==='retry'){
    await change(s=>{const j=s.jobs.find(j=>j.id===body.id);if(!j||j.status==='done')throw new Error('Pending job not found.');j.status='pending';j.attempts=0;j.retryAt=undefined;j.leaseId=undefined;j.leaseUntil=undefined;});kick();return response({ok:true});
   }
   return response({error:'Unknown operator action.'},404);
  }
   if(path==='petition/local'){
   const data=z.object({locality:str(130).min(2),text:str(1200).default(''),source:sourceUrl,publicConsent:z.boolean().default(false)}).parse(body);if(data.source)safeUrl(data.source);
   const requestToken=req.cookies.get(REQUEST_COOKIE)?.value||secret(),owner=member?.id||'request-'+digest(requestToken);
   const networkKey=createHmac('sha256',process.env.SESSION_SECRET||'not-configured').update(iso().slice(0,10)+':local:'+(req.headers.get('x-forwarded-for')||'local')).digest('hex');
   const result=await change(s=>{const loc=resolveLocality(s,data.locality);const text=data.text+(data.source?'\n'+data.source:'');const duplicate=s.petitions.find(p=>p.memberId===owner&&p.kind==='local'&&p.localityId===loc.id&&p.text===text&&!p.finalAt);if(duplicate)return {receipt:duplicate.id,targetAt:duplicate.targetAt,duplicate:true};
    rate(s,networkKey,8);const pid=id(),now=iso(),targetAt=windowFor(now);s.petitions.push({id:pid,memberId:owner,kind:'local',status:'Received',createdAt:now,updatedAt:now,localityId:loc.id,text,targetAt,publicConsent:data.publicConsent});s.jobs.push({id:id(),petitionId:pid,kind:'local',status:'pending',attempts:0,createdAt:now,targetAt});return {receipt:pid,targetAt};});kick();const res=response(result);if(!member)res.cookies.set(REQUEST_COOKIE,requestToken,{...cookieOptions,maxAge:180*86400});return res;
  }
  if(!member)return response({error:'A Squire passport is required to record proof.'},401);
  const memberId=member.id;
  if(path==='undertake'){
   const questId=z.string().parse(body.questId);await change(s=>{const m=s.members.find(m=>m.id===memberId)!;const q=s.quests.find(q=>q.id===questId&&q.status==='published');if(!q)throw new Error('Published quest not found.');assertAgentQuestAccess(m,q);if(!m.undertaken.includes(questId))m.undertaken.push(questId);});return response({ok:true});
  }
  if(path==='preferences'){
   const data=z.object({alias:str(45).min(2),hideLocality:z.boolean(),visibility:z.enum(['masked','public'])}).parse(body);await change(s=>{const m=s.members.find(m=>m.id===memberId)!;Object.assign(m,data);for(const c of s.chronicles.filter(c=>c.memberId===memberId)){c.alias=data.alias;c.showLocality=!data.hideLocality;}});return response({ok:true});
  }
  if(path==='withdraw'||path==='delete'){
   if(body.confirm!=='DELETE'&&path==='delete')throw new Error('Type DELETE to confirm deletion.');
   await change(s=>{const pids=new Set(s.petitions.filter(p=>p.memberId===memberId).map(p=>p.id));const completionIds=new Set(s.completions.filter(c=>c.memberId===memberId).map(c=>c.id));s.members=s.members.filter(m=>m.id!==memberId);s.sessions=s.sessions.filter(x=>x.memberId!==memberId);s.jobs=s.jobs.filter(j=>!pids.has(j.petitionId||''));s.petitions=s.petitions.filter(p=>p.memberId!==memberId);s.completions=s.completions.filter(c=>c.memberId!==memberId);s.chronicles=s.chronicles.filter(c=>c.memberId!==memberId);s.audits=s.audits.filter(a=>!pids.has(a.recordId)&&!completionIds.has(a.recordId));for(const e of s.evidence.filter(e=>e.memberId===memberId)){e.memberId='deleted';e.deleteAfter=iso();}for(const q of s.quests)if(q.requestId&&pids.has(q.requestId))q.requestId=undefined;});after(async()=>{try{await retention();}catch{}});const res=response({ok:true});res.cookies.delete(SESSION);return res;
  }
  if(path==='petition/proof'){
   const data=z.object({questId:z.string(),completionDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),text:str(3500).default(''),evidenceLink:sourceUrl,files:z.array(z.string()).max(3).default([])}).parse(body);if(data.evidenceLink)safeUrl(data.evidenceLink);if(!Number.isFinite(new Date(data.completionDate).getTime())||new Date(data.completionDate).getTime()>Date.now())throw new Error('Choose a valid completion date that is not in the future.');
   const result=await change(s=>{const q=s.quests.find(q=>q.id===data.questId&&q.status==='published');if(!q)throw new Error('Select a published quest.');assertAgentQuestAccess(member!,q);data.text=proofAccount(q.id,data.text,data.evidenceLink);
    const duplicate=s.petitions.find(p=>p.memberId===memberId&&p.kind==='proof'&&p.questId===q.id&&p.completionDate===data.completionDate&&p.text===data.text&&(p.evidenceLink||'')===(data.evidenceLink||'')&&JSON.stringify([...(p.files||[])].sort())===JSON.stringify([...data.files].sort())&&!p.finalAt);if(duplicate){if(duplicate.status==='More evidence needed'){rate(s,memberId,12);reopenProofReview(s,duplicate);return {receipt:duplicate.id,reopened:true};}return {receipt:duplicate.id,duplicate:true};}
    rate(s,memberId,12);if(data.files.some(fid=>!s.evidence.some(e=>e.id===fid&&e.memberId===memberId&&!e.petitionId)))throw new Error('An image is unavailable or belongs to another petition.');
    const pid=id(),now=iso(),petition={id:pid,memberId,kind:'proof' as const,status:'Received',createdAt:now,updatedAt:now,localityId:member!.localityId,text:data.text,questId:q.id,completionDate:data.completionDate,evidenceLink:data.evidenceLink,files:data.files,publicConsent:false};freshProof(s,petition);s.petitions.push(petition);for(const e of s.evidence.filter(e=>data.files.includes(e.id))){e.petitionId=pid;e.deleteAfter=new Date(Date.now()+60*86400_000).toISOString();}s.jobs.push({id:id(),petitionId:pid,kind:'proof',status:'pending',attempts:0,createdAt:now});return {receipt:pid};});kick();return response(result);
  }
  if(path==='petition/knighthood'){
   const data=z.object({text:str(700).default(''),publicName:str(45).optional(),visibility:z.enum(['public','masked']),chronicleConsent:z.boolean()}).parse(body);if(!data.chronicleConsent)throw new Error('A public chronicle under your chosen or masked name needs your consent.');
   const result=await change(s=>{if(s.members.find(m=>m.id===memberId)!.rank==='Knight')throw new Error('One passport can receive one knighthood.');const existing=s.petitions.find(p=>p.kind==='knighthood'&&p.memberId===memberId&&!p.finalAt);if(existing)return {receipt:existing.id};const pid=id(),now=iso();const p={id:pid,memberId,kind:'knighthood' as const,status:'Received',createdAt:now,updatedAt:now,localityId:member!.localityId,text:data.text,publicConsent:false,chronicleConsent:data.chronicleConsent,publicName:data.publicName||member!.alias,visibility:data.visibility};if(!eligible(s,p))throw new Error('Complete your frozen qualifying quest target before petitioning for knighthood.');p.status='Eligible — awaiting weekly induction';s.petitions.push(p);return {receipt:pid};});return response(result);
  }
  return response({error:'Not found'},404);
 }catch(e){return response({error:e instanceof z.ZodError?'Please check the form fields and their limits.':publicError(e)},400);}
}
