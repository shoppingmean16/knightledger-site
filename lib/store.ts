import type { State } from './domain.ts';
import { collections } from './domain.ts';
import * as postgres from './postgres-store.ts';
import * as blob from './blob-store.ts';
export const storageMode=()=>process.env.KNIGHTLEDGER_STORAGE==='blob'?'blob':'postgres';
export const databaseConfigured=()=>storageMode()==='blob'?!!process.env.BLOB_READ_WRITE_TOKEN:postgres.databaseConfigured();
export async function load():Promise<{state:State;revision:number;etag?:string}>{return storageMode()==='blob'?blob.load():postgres.load();}
export async function change<T>(fn:(s:State)=>T):Promise<T>{if(storageMode()==='blob')return blob.change(fn);return postgres.change(s=>{const result=fn(s);blob.assertState(s);return result;});}
export async function migrate(){if(storageMode()==='blob')await blob.migrate();else await postgres.migrate();}
export async function destroyTestNamespace(){
 const ns=process.env.KL_NAMESPACE||'live';if(!ns.startsWith('qa-'))throw new Error('Only isolated test namespaces can be removed.');
 if(storageMode()==='blob')await blob.destroyTestNamespace();
 else {const {neon}=await import('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL!);await sql.transaction([...collections.map(name=>sql.query(`DELETE FROM kl_${name} WHERE namespace=$1`,[ns])),sql.query('DELETE FROM kl_revision WHERE namespace=$1',[ns])]);}
}
