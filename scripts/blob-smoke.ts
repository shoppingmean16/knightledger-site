import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { put, get, del } from '@vercel/blob';
import { conditionalConflict, initialize, change, load, destroyTestNamespace } from '../lib/blob-store.ts';
import { initialState } from '../lib/seed.ts';
const path=`qa/cas-${randomUUID()}.json`,token=process.env.BLOB_READ_WRITE_TOKEN;
let url='';const payload=(n:number)=>JSON.stringify({n,padding:'large-ledger-regression '.repeat(1500)});
try{
 const created=await put(path,payload(0),{token,access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});url=created.url;
 const read=await get(path,{token,access:'private',useCache:false,headers:{'accept-encoding':'identity'}});assert.equal(read?.statusCode,200);assert.ok(read?.blob.etag);assert.equal(read?.blob.etag,created.etag);
 const writes=await Promise.allSettled([1,2].map(n=>put(path,payload(n),{token,access:'private',addRandomSuffix:false,ifMatch:read!.blob.etag,contentType:'application/json'})));
 assert.equal(writes.filter(r=>r.status==='fulfilled').length,1);
 assert.ok(writes.some(r=>r.status==='rejected'&&conditionalConflict(r.reason)));
 const latest=await get(path,{token,access:'private',useCache:false,headers:{'accept-encoding':'identity'}});assert.equal(latest?.statusCode,200);assert.ok(latest&&[1,2].includes((await new Response(latest.stream).json()).n));
 await put(path,payload(3),{token,access:'private',addRandomSuffix:false,ifMatch:latest!.blob.etag,contentType:'application/json'});
 const final=await get(path,{token,access:'private',useCache:false,headers:{'accept-encoding':'identity'}});assert.equal((await new Response(final!.stream).json()).n,3);
 assert.ok([401,403,404].includes((await fetch(url)).status));
 console.log('Private Blob: consistent reads, concurrent compare-and-swap, immediate update and unauthenticated access denial verified.');
}finally{if(url)await del(url,{token});}

process.env.KL_NAMESPACE='qa-counter-'+randomUUID();
try{await initialize(initialState());const keys:string[]=Array.from({length:5},()=>randomUUID());await Promise.all(keys.map(key=>change(s=>{s.audits.push({id:key,at:new Date().toISOString(),action:'isolated-concurrent-write',recordId:key,note:'Disposable concurrency check.'});})));const {state}=await load();assert.equal(state.audits.filter(a=>keys.includes(a.id)).length,5);console.log('Whole-state ledger: five concurrent distinct mutations preserved without lost updates.');}finally{await destroyTestNamespace();}
