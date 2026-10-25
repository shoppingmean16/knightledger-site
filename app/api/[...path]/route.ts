import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import sharp from 'sharp';
import { put, get } from '@vercel/blob';
import { createHmac } from 'node:crypto';
import { getVercelOidcTokenSync } from '@vercel/oidc';
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { load, change, databaseConfigured } from '@/lib/store';
import { id, iso, secret, digest, sanitizePublic, privateLedger, windowFor, approve, eligible, sameTask, type State, type Locality } from '@/lib/domain';
import { SESSION, OPERATOR, cookieOptions, currentMember, isOperator, equal, operatorToken } from '@/lib/auth';
import { worker, retention } from '@/lib/worker';
import { safeUrl, publicError, reserveCall, model, fetchSource } from '@/lib/research';
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
  if(path==='status')return response({database:databaseConfigured(),privateStorage:!!process.env.BLOB_READ_WRITE_TOKEN,aiAuth:aiConfigured(),temporaryDatabaseExpiresAt:process.env.NEON_DATABASE_EXPIRES_AT||null});
  const {state}=await load();
  if(path==='public')return response(sanitizePublic(state));
  const member=await currentMember(state);
  if(path==='ledger')return response(member?privateLedger(state,member.id):{member:null});
  if(path==='operator'){if(!await isOperator())return response({authorized:false},401);return response(operatorView(state));}
  if(path.startsWith('evidence/')){
   const file=state.evidence.find(e=>e.id===path.split('/')[1]);if(!file||file.memberId!==member?.id&&!await isOperator())return response({error:'Not found'},404);
   const result=await get(file.url,{access:'private'});if(!result||result.statusCode!==200)return response({error:'Not found'},404);
   return new Response(result.stream,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','Content-Disposition':'inline; filename="private-evidence.jpg"','X-Content-Type-Options':'nosniff'}});
  }
  return response({error:'Not found'},404);
 }catch(e){return response({error:publicError(e)},503);}
}
function operatorView(s:State){return {authorized:true,quests:s.quests.filter(q=>q.status!=='published'&&q.status!=='removed'),requests:s.petitions.filter(p=>p.kind==='local').map(p=>({...p,memberId:undefined})),jobs:s.jobs,localities:s.localities,runs:s.runs.slice(-35).reverse(),prompts:s.prompts,settings:s.meta[0],evidenceCount:s.evidence.length,temporaryDatabaseExpiresAt:process.env.NEON_DATABASE_EXPIRES_AT||null,aiConfigured:aiConfigured(),blobConfigured:!!process.env.BLOB_READ_WRITE_TOKEN};}
export async function POST(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 const path=(await params).path.join('/');
 try{
  mutationOrigin(req);
  if(Number(req.headers.get('content-length')||0)>4_000_000) return response({error:'Submission too large.'},413);
  const {state}=await load();const member=await currentMember(state);
  if(path==='upload'){
   if(!member)return response({error:'Enter the Ledger first.'},401);
   if(!process.env.BLOB_READ_WRITE_TOKEN)return response({error:'Private evidence storage is not configured. Text-only proof is available.'},503);
   const form=await req.formData(),files=form.getAll('files');if(files.length<1||files.length>3)throw new Error('Choose one to three small images.');
   if(state.evidence.filter(e=>e.memberId===member!.id&&new Date(e.createdAt).getTime()>Date.now()-86400_000).length+files.length>12)throw new Error('The daily image limit was reached.');
   const uploaded=[];
   for(const file of files){
    if(!(file instanceof File)||file.size>1_200_000||file.size<20)throw new Error('Each image must be a JPEG, PNG or WebP under 1.2 MB.');
    const bytes=Buffer.from(await file.arrayBuffer());const image=sharp(bytes,{limitInputPixels:12_000_000});const metadata=await image.metadata();if(!['jpeg','png','webp'].includes(metadata.format||''))throw new Error('Actual image type must be JPEG, PNG or WebP.');
    const clean=await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();const eid=id();
    const stored=await put(`evidence/${eid}.jpg`,clean,{access:'private',contentType:'image/jpeg',addRandomSuffix:true});
    const e={id:eid,memberId:member.id,url:stored.url,digest:digest(clean.toString('base64')),createdAt:iso(),deleteAfter:new Date(Date.now()+86400_000).toISOString(),type:'image/jpeg',size:clean.length};
    await change(s=>{if(!s.members.some(m=>m.id===member!.id&&!m.withdrawn))throw new Error('Passport is unavailable.');s.evidence.push(e);});uploaded.push(eid);
   }return response({files:uploaded});
  }
  const body=await req.json();
  if(path==='operator/login'){
   const {password}=z.object({password:str(250)}).parse(body);
   if(!process.env.OPERATOR_SECRET||!equal(password,process.env.OPERATOR_SECRET))return response({error:'The Steward key was not recognized.'},401);
   const res=response({ok:true});res.cookies.set(OPERATOR,operatorToken(),{...cookieOptions,maxAge:8*3600});return res;
  }
  if(path==='enroll'||path==='recover'){
   const networkKey=createHmac('sha256',process.env.SESSION_SECRET||'not-configured').update(iso().slice(0,10)+':'+(req.headers.get('x-forwarded-for')||'local')).digest('hex');
   const token=secret(),sid=digest(token);let recoveryCode:string|undefined;let mid:string;
   if(path==='enroll'){
    if(member)throw new Error('This passport is already enrolled.');
    const data=z.object({alias:str(45).optional(),locality:str(130).min(2),visibility:z.enum(['public','masked']).default('masked'),hideLocality:z.boolean().default(true)}).parse(body);recoveryCode=secret();mid=id();
    await change(s=>{rate(s,networkKey,8);const loc=resolveLocality(s,data.locality);const alias=data.alias||`Squire ${mid.slice(0,6).toUpperCase()}`;s.members.push({id:mid,alias,localityId:loc.id,visibility:data.visibility,hideLocality:data.hideLocality,recoveryDigest:digest(recoveryCode!),createdAt:iso(),rank:'Squire',undertaken:[]});s.sessions.push({id:sid,memberId:mid,expiresAt:new Date(Date.now()+30*86400_000).toISOString()});});
   }else{
    const {code}=z.object({code:str(100).min(30)}).parse(body);
    mid=await change(s=>{rate(s,networkKey,30);const m=s.members.find(m=>equal(m.recoveryDigest,digest(code))&&!m.withdrawn);if(!m)throw new Error('Recovery code not recognized.');s.sessions.push({id:sid,memberId:m.id,expiresAt:new Date(Date.now()+30*86400_000).toISOString()});return m.id;});
   }
   const res=response({ok:true,recoveryCode});res.cookies.set(SESSION,token,{...cookieOptions,maxAge:30*86400});return res;
  }
  if(path==='logout'){await change(s=>{const token=req.cookies.get(SESSION)?.value;s.sessions=s.sessions.filter(x=>x.id!==digest(token||''));});const res=response({ok:true});res.cookies.delete(SESSION);res.cookies.delete(OPERATOR);return res;}
  if(path.startsWith('operator/')){
   if(!await isOperator())return response({error:'Operator access required.'},401);
   const action=path.slice(9);
   if(action==='check-source'){const url=z.enum(['https://www.amherstma.gov/','https://www.nyc.gov/site/planning/data-maps/open-data.page']).parse(body.url);const text=await fetchSource(url);return response({ok:true,url,characters:text.length,excerpt:text.slice(0,350)});}
   if(action==='claim-database'){
    if(!process.env.NEON_PROJECT_ID||!process.env.NEON_CLAIM_ASSERTION)throw new Error('No temporary database claim is configured.');
    const tokenResponse=await fetch('https://claimable.neon.tech/v1/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:process.env.NEON_CLAIM_ASSERTION,resource:'https://claimable.neon.tech/'}),signal:AbortSignal.timeout(15000)});
    if(!tokenResponse.ok)throw new Error('Neon could not authorize the claim. The database may already have been claimed.');const token=await tokenResponse.json();
    const claim=await fetch(`https://claimable.neon.tech/v1/projects/${encodeURIComponent(process.env.NEON_PROJECT_ID)}/claim`,{method:'POST',headers:{Authorization:`Bearer ${token.access_token}`},signal:AbortSignal.timeout(15000)});if(!claim.ok)throw new Error('Neon could not prepare the claim.');const data=await claim.json();
    const url=new URL(data.verification_uri_complete);if(url.protocol!=='https:'||!(url.hostname==='neon.com'||url.hostname.endsWith('.neon.tech')))throw new Error('Unexpected claim destination.');return response({url:url.href,expiresIn:data.expires_in});
   }
   if(action==='check-ai'){
    await reserveCall();try{const r=await generateText({model:gateway(model()),prompt:'Reply with the word ready.',maxOutputTokens:40,maxRetries:0,abortSignal:AbortSignal.timeout(30000)});return response({ok:true,model:model(),text:r.text});}catch(e){const error=e as {name?:string;message?:string;statusCode?:number;cause?:{message?:string;statusCode?:number;responseBody?:string}};let providerMessage='';try{const parsed=JSON.parse(error.cause?.responseBody||'{}');providerMessage=parsed.error?.message||parsed.message||'';}catch{}return response({ok:false,name:error.name,statusCode:error.statusCode||error.cause?.statusCode,message:(providerMessage||error.message||'Unavailable').replace(/Bearer\s+\S+|postgres(?:ql)?:\/\/\S+/gi,'[redacted]').slice(0,1300)});}
   }
   if(action==='phase'){
    const {phase}=z.object({phase:z.enum(['refresh','publish00','publish12','induction','retention','prompt-evaluate'])}).parse(body);
    // Manual publication is useful in staging; induction still respects the weekly ceremony.
    return response(await worker(phase,phase!=='induction'));
   }
   if(action==='pause'){await change(s=>{s.meta[0].paused=z.boolean().parse(body.paused);});return response({ok:true});}
   if(action==='approve'){
    const {items}=z.object({items:z.array(z.object({id:z.string(),version:z.number().int()})).min(1).max(50)}).parse(body);
    await change(s=>{for(const item of items)approve(s,item.id,item.version);});return response({ok:true});
   }
   if(action==='edit'){
    const data=z.object({id:z.string(),version:z.number().int(),title:str(100).min(8),summary:str(280).min(30),standard:str(700).min(50),benefit:str(500).min(30).optional(),effort:str(70).optional(),cost:str(150).optional(),mode:z.enum(['Digital','In person']).optional(),category:z.enum(['People','Other species','Shared places']).optional(),steps:z.array(str(600).min(15)).min(3).max(6).optional(),evidence:str(600).min(40).optional(),constraints:str(700).min(30).optional()}).parse(body);
    await change(s=>{const q=s.quests.find(q=>q.id===data.id);if(!q||q.version!==data.version||q.status==='published')throw new Error('Draft changed. Reload.');if(q.replacesId){const published=s.quests.find(x=>x.id===q.replacesId);if(!published||!sameTask(published,{...q,...data}))throw new Error('A source-only refresh preserves the published task and evidence standard.');}const previous={...q};delete previous.revisions;q.revisions=[...(q.revisions||[]),previous];for(const [key,value] of Object.entries(data)){if(key!=='id'&&key!=='version'&&value!==undefined)(q as unknown as Record<string,unknown>)[key]=value;}q.version++;q.status='draft';q.approvedHash=undefined;q.approvedAt=undefined;s.audits.push({id:id(),at:iso(),action:'edit',recordId:q.id,note:'Owner edited draft fields: '+Object.keys(data).filter(k=>!['id','version'].includes(k)).join(', ')});const p=s.petitions.find(p=>p.id===q.requestId);if(p)p.status='Ready for approval';});return response({ok:true});
   }
   if(['return','decline','remove'].includes(action)){
    const {id:qid,reason}=z.object({id:z.string(),reason:str(500).min(10)}).parse(body);
    await change(s=>{const q=s.quests.find(q=>q.id===qid);if(!q)throw new Error('Quest not found.');q.status='removed';q.approvedHash=undefined;const p=s.petitions.find(p=>p.id===q.requestId);if(p){p.status=action==='return'?'Researching':'Declined';p.response=reason;p.updatedAt=iso();if(action==='return'){const j=s.jobs.find(j=>j.petitionId===p.id)!;j.status='pending';j.retryAt=undefined;j.reason=reason;p.draftId=undefined;}else p.finalAt=iso();}s.audits.push({id:id(),at:iso(),action,recordId:q.id,note:reason});});if(action==='return')kick();return response({ok:true});
   }
   if(action==='prompt-rollback'){
    const pid=z.string().parse(body.id);await change(s=>{const p=s.prompts.find(p=>p.id===pid);if(!p)throw new Error('Prompt not found.');if(pid!=='quest-v1'&&!s.audits.some(a=>a.action==='prompt-validation'&&a.recordId===pid))throw new Error('This candidate has not passed independent validation.');for(const x of s.prompts)x.active=x.id===pid;s.meta[0].promptId=pid;s.audits.push({id:id(),at:iso(),action:'prompt-rollback',recordId:pid,note:'Owner selected a previously validated version.'});});return response({ok:true});
   }
   if(action==='retry'){
    await change(s=>{const j=s.jobs.find(j=>j.id===body.id);if(!j||j.status==='done')throw new Error('Pending job not found.');j.status='pending';j.attempts=0;j.retryAt=undefined;j.leaseUntil=undefined;});kick();return response({ok:true});
   }
   return response({error:'Unknown operator action.'},404);
  }
  if(!member)return response({error:'Enter the Ledger first.'},401);
  const memberId=member.id;
  if(path==='undertake'){
   const questId=z.string().parse(body.questId);await change(s=>{const m=s.members.find(m=>m.id===memberId)!;if(!s.quests.some(q=>q.id===questId&&q.status==='published'))throw new Error('Published quest not found.');if(!m.undertaken.includes(questId))m.undertaken.push(questId);});return response({ok:true});
  }
  if(path==='preferences'){
   const data=z.object({alias:str(45).min(2),hideLocality:z.boolean(),visibility:z.enum(['masked','public'])}).parse(body);await change(s=>{const m=s.members.find(m=>m.id===memberId)!;Object.assign(m,data);for(const c of s.chronicles.filter(c=>c.memberId===memberId)){c.alias=data.alias;c.showLocality=!data.hideLocality;}});return response({ok:true});
  }
  if(path==='withdraw'||path==='delete'){
   if(body.confirm!=='DELETE'&&path==='delete')throw new Error('Type DELETE to confirm deletion.');
   await change(s=>{const pids=new Set(s.petitions.filter(p=>p.memberId===memberId).map(p=>p.id));const completionIds=new Set(s.completions.filter(c=>c.memberId===memberId).map(c=>c.id));s.members=s.members.filter(m=>m.id!==memberId);s.sessions=s.sessions.filter(x=>x.memberId!==memberId);s.jobs=s.jobs.filter(j=>!pids.has(j.petitionId));s.petitions=s.petitions.filter(p=>p.memberId!==memberId);s.completions=s.completions.filter(c=>c.memberId!==memberId);s.chronicles=s.chronicles.filter(c=>c.memberId!==memberId);s.audits=s.audits.filter(a=>!pids.has(a.recordId)&&!completionIds.has(a.recordId));for(const e of s.evidence.filter(e=>e.memberId===memberId)){e.memberId='deleted';e.deleteAfter=iso();}for(const q of s.quests)if(q.requestId&&pids.has(q.requestId))q.requestId=undefined;});after(async()=>{try{await retention();}catch{}});const res=response({ok:true});res.cookies.delete(SESSION);return res;
  }
  if(path==='petition/local'){
   const data=z.object({locality:str(130).min(2),text:str(1200).default(''),source:sourceUrl,publicConsent:z.boolean().default(false)}).parse(body);if(data.source)safeUrl(data.source);
   const result=await change(s=>{rate(s,memberId,8);const loc=resolveLocality(s,data.locality);const duplicate=s.petitions.find(p=>p.memberId===memberId&&p.kind==='local'&&p.localityId===loc.id&&p.text===(data.text+(data.source?'\n'+data.source:''))&&!p.finalAt);if(duplicate)return {receipt:duplicate.id,targetAt:duplicate.targetAt,duplicate:true};
    const pid=id(),now=iso(),targetAt=windowFor(now);s.petitions.push({id:pid,memberId,kind:'local',status:'Received',createdAt:now,updatedAt:now,localityId:loc.id,text:data.text+(data.source?'\n'+data.source:''),targetAt,publicConsent:data.publicConsent});s.jobs.push({id:id(),petitionId:pid,kind:'local',status:'pending',attempts:0,createdAt:now,targetAt});return {receipt:pid,targetAt};});kick();return response(result);
  }
  if(path==='petition/proof'){
   const data=z.object({questId:z.string(),completionDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),text:str(3500).min(40),evidenceLink:sourceUrl,files:z.array(z.string()).max(3).default([])}).parse(body);if(data.evidenceLink)safeUrl(data.evidenceLink);if(!Number.isFinite(new Date(data.completionDate).getTime())||new Date(data.completionDate).getTime()>Date.now())throw new Error('Choose a valid completion date that is not in the future.');
   const result=await change(s=>{rate(s,memberId,12);const q=s.quests.find(q=>q.id===data.questId&&q.status==='published');if(!q)throw new Error('Select a published quest.');if(data.files.some(fid=>!s.evidence.some(e=>e.id===fid&&e.memberId===memberId&&!e.petitionId)))throw new Error('An image is unavailable or belongs to another petition.');if(s.completions.some(c=>c.memberId===memberId&&c.templateId===q.templateId))throw new Error('This template already received qualification credit.');if(s.petitions.some(p=>p.memberId===memberId&&p.kind==='proof'&&p.questId===q.id&&!p.finalAt&&p.status!=='More evidence needed'))throw new Error('Proof for this quest is already awaiting review.');
    const pid=id(),now=iso();s.petitions.push({id:pid,memberId,kind:'proof',status:'Received',createdAt:now,updatedAt:now,localityId:member!.localityId,text:data.text,questId:q.id,completionDate:data.completionDate,evidenceLink:data.evidenceLink,files:data.files,publicConsent:false});for(const e of s.evidence.filter(e=>data.files.includes(e.id))){e.petitionId=pid;e.deleteAfter=new Date(Date.now()+60*86400_000).toISOString();}s.jobs.push({id:id(),petitionId:pid,kind:'proof',status:'pending',attempts:0,createdAt:now});return {receipt:pid};});kick();return response(result);
  }
  if(path==='petition/knighthood'){
   const data=z.object({text:str(700).default(''),publicName:str(45).optional(),visibility:z.enum(['public','masked']),chronicleConsent:z.boolean()}).parse(body);if(!data.chronicleConsent)throw new Error('A public chronicle under your chosen or masked name needs your consent.');
   const result=await change(s=>{if(s.members.find(m=>m.id===memberId)!.rank==='Knight')throw new Error('One passport can receive one knighthood.');const existing=s.petitions.find(p=>p.kind==='knighthood'&&p.memberId===memberId&&!p.finalAt);if(existing)return {receipt:existing.id};const pid=id(),now=iso();const p={id:pid,memberId,kind:'knighthood' as const,status:'Received',createdAt:now,updatedAt:now,localityId:member!.localityId,text:data.text,publicConsent:false,chronicleConsent:data.chronicleConsent,publicName:data.publicName||member!.alias,visibility:data.visibility};if(!eligible(s,p))throw new Error('Complete your frozen qualifying quest target before petitioning for knighthood.');p.status='Eligible — awaiting weekly induction';s.petitions.push(p);return {receipt:pid};});return response(result);
  }
  return response({error:'Not found'},404);
 }catch(e){return response({error:e instanceof z.ZodError?'Please check the form fields and their limits.':publicError(e)},400);}
}
