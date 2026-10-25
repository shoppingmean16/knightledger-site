import { neon } from '@neondatabase/serverless';
import { collections, type State } from './domain.ts';
import { initialState } from './seed.ts';
export const databaseConfigured=()=>!!process.env.DATABASE_URL;
const sql=()=>{if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured.');return neon(process.env.DATABASE_URL);};
const namespace=()=>process.env.KL_NAMESPACE||'live';
export async function load():Promise<{state:State;revision:number}>{
 const q=sql();
 const rows=await q.query(`SELECT revision, ${collections.map(c=>`(SELECT COALESCE(jsonb_agg(data),'[]'::jsonb) FROM kl_${c} WHERE namespace=$1) AS ${c}`).join(',')} FROM kl_revision WHERE namespace=$1`,[namespace()]);
 if(!rows.length)throw new Error('The database needs migration.');
 const {revision,...state}=rows[0];return {revision:Number(revision),state:state as State};
}
export async function change<T>(fn:(s:State)=>T):Promise<T>{
 for(let n=0;n<12;n++){
  const {state,revision}=await load();const result=fn(state);
  const rows=await sql().query('SELECT kl_commit($1,$2,$3::jsonb) AS ok',[namespace(),revision,JSON.stringify(state)]);
  if(rows[0].ok)return result;
 }
 throw new Error('The Ledger is busy. Your operation was not applied; please retry.');
}
export async function migrate(){
 const q=sql();
 await q.query('CREATE TABLE IF NOT EXISTS kl_revision(namespace text PRIMARY KEY, revision bigint NOT NULL DEFAULT 0)');
 for(const c of collections)await q.query(`CREATE TABLE IF NOT EXISTS kl_${c}(namespace text NOT NULL,id text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(namespace,id))`);
 await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS kl_member_recovery ON kl_members(namespace,(data->>'recoveryDigest'))`);
 await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS kl_credit ON kl_completions(namespace,(data->>'memberId'),(data->>'templateId'))`);
 await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS kl_title ON kl_chronicles(namespace,(data->>'memberId'))`);
 const body=collections.map(c=>`DELETE FROM kl_${c} WHERE namespace=ns AND id NOT IN (SELECT value->>'id' FROM jsonb_array_elements(payload->'${c}')); INSERT INTO kl_${c}(namespace,id,data) SELECT ns,value->>'id',value FROM jsonb_array_elements(payload->'${c}') ON CONFLICT(namespace,id) DO UPDATE SET data=EXCLUDED.data;`).join('\n');
 await q.query(`CREATE OR REPLACE FUNCTION kl_commit(ns text, expected bigint, payload jsonb) RETURNS boolean LANGUAGE plpgsql AS $$ BEGIN PERFORM 1 FROM kl_revision WHERE namespace=ns AND revision=expected FOR UPDATE; IF NOT FOUND THEN RETURN false; END IF; ${body} UPDATE kl_revision SET revision=revision+1 WHERE namespace=ns; RETURN true; END; $$`);
 await q.query('INSERT INTO kl_revision(namespace) VALUES($1) ON CONFLICT DO NOTHING',[namespace()]);
 const {state,revision}=await load();if(!state.meta.length)await q.query('SELECT kl_commit($1,$2,$3::jsonb)',[namespace(),revision,JSON.stringify(initialState())]);
}
