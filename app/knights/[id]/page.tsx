import Link from 'next/link';
import { notFound } from 'next/navigation';
import { load } from '@/lib/store';
import { Heraldry } from '@/components/marks';
import { LocalTime } from '@/components/time';
export const dynamic='force-dynamic';
export default async function Chronicle({params}:{params:Promise<{id:string}>}){const {id}=await params;const {state}=await load();const c=state.chronicles.find(c=>c.id===id);if(!c)notFound();return <article className="chronicle reading-page"><Link href="/knights" className="back-link">← Hall of Knights</Link><Heraldry seed={c.heraldry}/><h1>{c.alias}</h1><p className="earned-title">{c.title}</p><p className="chronicle-text">{c.text}</p><div className="chronicle-seal">✳</div><p>Inducted <LocalTime value={c.inductedAt}/></p>{c.showLocality?<p>{state.localities.find(l=>l.id===c.localityId)?.name}</p>:null}<h2>Accepted deeds</h2><ul>{c.factRefs.map(ref=>{const deed=state.completions.find(d=>d.id===ref);const q=state.quests.find(q=>q.id===deed?.questId);return q?<li key={ref}><Link href={`/quests/${q.id}`}>{q.title} ↗</Link></li>:null;})}</ul></article>}
