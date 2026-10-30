// Private operator bridge. Credentials and session cookies are never printed.
import { writeFile } from 'node:fs/promises';
import { approvalItems, publicationInput } from './review-client-guards.mjs';
const action=process.argv[2];
const allowed=new Set(['status','begin-review-run','finish-review-run','prepare-work','import-work','verify-proclamation','evidence','approve-quests','publish','prepare-moltbook','simplify-moltbook','trim-quest-copy']);
if(!allowed.has(action))throw new Error('Unsupported review action.');
const base='https://www.knightledger.com';
if(!process.env.OPERATOR_SECRET)throw new Error('OPERATOR_SECRET is required privately.');
const login=await fetch(base+'/api/operator/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password:process.env.OPERATOR_SECRET}),signal:AbortSignal.timeout(30000)});
if(!login.ok)throw new Error('Operator authentication failed.');
const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
const headers={Origin:base,'Content-Type':'application/json',Cookie:cookie};
let raw='';if(!['status','begin-review-run'].includes(action)){for await(const chunk of process.stdin)raw+=chunk;}
let input=raw?JSON.parse(raw):{};
let endpoint=action;
if(action==='approve-quests'){
 const r=await fetch(base+'/api/operator',{headers,signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw new Error('Unable to check current review policy.');
 input={items:approvalItems(input,await r.json())};endpoint='approve';
}
if(action==='publish'){input=publicationInput(input);endpoint='phase';}
if(action==='evidence'){
 if(!/^[a-f0-9-]{36}$/i.test(input.id)||typeof input.output!=='string')throw new Error('Evidence ID and private output path required.');
 const r=await fetch(base+'/api/evidence/'+input.id,{headers,signal:AbortSignal.timeout(30000)});
 if(!r.ok||!/^image\/(jpeg|png|webp)/.test(r.headers.get('content-type')||''))throw new Error('Authorized evidence delivery failed.');
 await writeFile(input.output,Buffer.from(await r.arrayBuffer()),{mode:0o600});console.log(JSON.stringify({saved:true}));
}else{
 const r=await fetch(base+'/api/operator'+(action==='status'?'':'/'+endpoint),{method:action==='status'?'GET':'POST',headers,...(action==='status'?{}:{body:JSON.stringify(input)}),signal:AbortSignal.timeout(180000)});
 const data=await r.json();if(!r.ok)throw new Error(data.error||'Private operation failed.');console.log(JSON.stringify(data));
}
