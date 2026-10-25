import { cookies } from 'next/headers';
import { timingSafeEqual, createHmac } from 'node:crypto';
import { type State, digest, iso } from './domain.ts';
export const SESSION='kl_passport';export const OPERATOR='kl_steward';
export const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/'};
export const equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);};
export function operatorToken(){if(!process.env.SESSION_SECRET||!process.env.OPERATOR_SECRET)throw new Error('Operator credentials are not configured.');const until=String(Date.now()+8*3600_000);return until+'.'+createHmac('sha256',process.env.SESSION_SECRET).update(until+':operator:'+process.env.OPERATOR_SECRET).digest('hex');}
export function validOperator(value:string){if(!process.env.SESSION_SECRET||!process.env.OPERATOR_SECRET)return false;const [until,mac]=value.split('.');if(!until||!mac||Number(until)<Date.now()||Number(until)>Date.now()+8*3600_000)return false;return equal(mac,createHmac('sha256',process.env.SESSION_SECRET).update(until+':operator:'+process.env.OPERATOR_SECRET).digest('hex'));}
export async function currentMember(s:State){const jar=await cookies();const token=jar.get(SESSION)?.value;if(!token)return null;const session=s.sessions.find(x=>x.id===digest(token)&&x.expiresAt>iso());return s.members.find(m=>m.id===session?.memberId&&!m.withdrawn)||null;}
export async function isOperator(){const jar=await cookies();const value=jar.get(OPERATOR)?.value;return !!value&&validOperator(value);}
