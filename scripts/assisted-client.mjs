// Private operator bridge. Never stores or prints credentials or session cookies.
// node --env-file=.env.production scripts/assisted-client.mjs <action> < input.json
import { writeFile } from 'node:fs/promises';
const action=process.argv[2];
const allowed=new Set(['status','begin-review-run','finish-review-run','prepare-work','import-work','verify-proclamation','evidence']);
if(!allowed.has(action))throw new Error('Unsupported review action. Quest approvals and configuration changes are excluded.');
const base='https://www.knightledger.com';
if(!process.env.OPERATOR_SECRET)throw new Error('OPERATOR_SECRET is required privately.');
const login=await fetch(base+'/api/operator/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password:process.env.OPERATOR_SECRET}),signal:AbortSignal.timeout(30000)});
if(!login.ok)throw new Error('Operator authentication failed.');
const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
const headers={Origin:base,'Content-Type':'application/json',Cookie:cookie};
let raw='';if(!['status','begin-review-run'].includes(action)){for await(const chunk of process.stdin)raw+=chunk;}
const input=raw?JSON.parse(raw):{};
if(action==='evidence'){
 if(!/^[a-f0-9-]{36}$/i.test(input.id)||typeof input.output!=='string')throw new Error('Evidence ID and private output path required.');
 const r=await fetch(base+'/api/evidence/'+input.id,{headers,signal:AbortSignal.timeout(30000)});
 if(!r.ok||!/^image\/(jpeg|png|webp)/.test(r.headers.get('content-type')||''))throw new Error('Authorized evidence delivery failed.');
 await writeFile(input.output,Buffer.from(await r.arrayBuffer()),{mode:0o600});console.log(JSON.stringify({saved:true}));
}else{
 const r=await fetch(base+'/api/operator'+(action==='status'?'':'/'+action),{method:action==='status'?'GET':'POST',headers,...(action==='status'?{}:{body:JSON.stringify(input)}),signal:AbortSignal.timeout(180000)});
 const data=await r.json();if(!r.ok)throw new Error(data.error||'Private operation failed.');console.log(JSON.stringify(data));
}
