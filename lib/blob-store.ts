import { setTimeout as delay } from 'node:timers/promises';
import { get, put, del, BlobPreconditionFailedError } from '@vercel/blob';
import { collections, type State } from './domain.ts';
import { initialState } from './seed.ts';
const namespace=()=>process.env.KL_NAMESPACE||'live';
const blobPath=()=>{const ns=namespace();if(!/^[a-zA-Z0-9_-]{1,90}$/.test(ns))throw new Error('Invalid Ledger namespace.');return `ledger/${ns}.json`;};
const token=()=>process.env.BLOB_READ_WRITE_TOKEN;
type Envelope={schema:1;revision:number;state:State};
export function assertState(s:State){
 for(const name of collections){if(!Array.isArray(s[name]))throw new Error('Invalid Ledger collection.');const ids=s[name].map(r=>r.id);if(new Set(ids).size!==ids.length)throw new Error('Duplicate Ledger record.');}
 if(s.meta.length!==1)throw new Error('Invalid Ledger settings.');
 const unique=(values:(string|undefined)[])=>{const present=values.filter((v):v is string=>!!v);if(new Set(present).size!==present.length)throw new Error('Duplicate credit, recovery digest or knighthood.');};
 unique(s.members.map(m=>m.recoveryDigest));unique(s.completions.map(c=>c.petitionId));unique(s.completions.map(c=>c.evidenceFingerprint));unique(s.completions.map(c=>c.deedFingerprint));unique(s.completions.flatMap(c=>c.evidenceKeys||[]));unique(s.chronicles.map(c=>c.memberId));
}
// Compressed responses carry weak transfer ETags. Request identity encoding for strong CAS tokens.
export async function load(){
 const result=await get(blobPath(),{token:token(),access:'private',useCache:false,headers:{'accept-encoding':'identity'},abortSignal:AbortSignal.timeout(15000)});
 if(!result||result.statusCode!==200||!result.stream)throw new Error('The Ledger needs initialization.');
 if((result.blob.size||0)>2_000_000)throw new Error('The Ledger requires a storage upgrade. No data was discarded.');
 const payload=await new Response(result.stream).json() as Envelope;
 if(payload.schema!==1||!Number.isSafeInteger(payload.revision)||payload.revision<0||!result.blob.etag||result.blob.etag.startsWith('W/'))throw new Error('Invalid Ledger storage version.');
 assertState(payload.state);return {state:payload.state,revision:payload.revision,etag:result.blob.etag};
}
export async function initialize(state:State){
 assertState(state);const data=JSON.stringify({schema:1,revision:0,state} satisfies Envelope);
 if(Buffer.byteLength(data)>2_000_000)throw new Error('The Ledger is too large for this storage adapter.');
 try{await put(blobPath(),data,{token:token(),access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',abortSignal:AbortSignal.timeout(15000)});return true;}
 catch(e){try{await load();return false;}catch{throw e;}}
}
export const conditionalConflict=(e:unknown)=>e instanceof BlobPreconditionFailedError||e instanceof Error&&e.message.includes('The conditional request cannot succeed due to a conflicting operation against this resource');
export async function change<T>(fn:(s:State)=>T):Promise<T>{
 for(let attempt=0;attempt<12;attempt++){
  const {state,revision,etag}=await load(),before=JSON.stringify(state),result=fn(state);assertState(state);
  if(JSON.stringify(state)===before)return result;
  const payload=JSON.stringify({schema:1,revision:revision+1,state} satisfies Envelope);
  if(Buffer.byteLength(payload)>2_000_000)throw new Error('The Ledger is at capacity. Your action was not saved; please retry later.');
  try{await put(blobPath(),payload,{token:token(),access:'private',addRandomSuffix:false,ifMatch:etag,contentType:'application/json',abortSignal:AbortSignal.timeout(15000)});return result;}
  catch(e){if(!conditionalConflict(e))throw e;await delay(Math.min(1000,30*2**attempt)+Math.floor(Math.random()*50));}
 }
 throw new Error('The Ledger is busy. Your action was not saved; please retry.');
}
export async function migrate(){await initialize(initialState());}
export async function destroyTestNamespace(){if(!namespace().startsWith('qa-'))throw new Error('Only isolated test namespaces can be removed.');await del(blobPath(),{token:token()});}
