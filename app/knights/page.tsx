import Link from 'next/link';
import { load } from '@/lib/store';
import { nextInduction } from '@/lib/domain';
import { Heraldry } from '@/components/marks';
import { LocalTime } from '@/components/time';
export const dynamic='force-dynamic';
export const metadata={title:'Hall of Knights'};
export default async function Hall(){const {state}=await load();return <div className="hall-page lean-hall"><div className="page-intro left"><h1>Hall of Knights</h1><p>Next induction: <LocalTime value={nextInduction()}/></p><Link className="text-link" href="/privacy#knighthood">Qualification rules ↗</Link></div>{!state.chronicles.length?<div className="hall-empty"><h2>No Knights yet.</h2><Link className="button" href="/">Find a quest ↗</Link></div>:<>{[...new Set(state.chronicles.map(c=>c.rollId))].sort().reverse().map(roll=><section className="weekly-roll" key={roll}><h2>Inducted {roll}</h2><div className="knight-grid">{state.chronicles.filter(c=>c.rollId===roll).map(c=><Link href={`/knights/${c.id}`} className="knight-card" key={c.id}><Heraldry seed={c.heraldry}/><span className="eyebrow">{c.title}</span><h3>{c.alias}</h3><p>{c.text.slice(0,160)}…</p><span className="text-link">Read chronicle ↗</span></Link>)}</div></section>)}</>}</div>}
