 'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { sanitizePublic, Quest } from '@/lib/domain';
import { LocalTime } from './time';
const Map=dynamic(()=>import('./coverage'),{loading:()=> <p>Loading map…</p>});
type PublicData=ReturnType<typeof sanitizePublic>;
export function Board({data,proposals=[]}:{data:PublicData;proposals?:Quest[]}){
 const [locality,setLocality]=useState('everywhere'),[mode,setMode]=useState('All'),[mapOpen,setMapOpen]=useState(false);
 const available=data.localities.filter(l=>l.id==='everywhere'||data.coverage.some(c=>c.localityId===l.id));
 const list=[...data.quests,...proposals].filter(q=>(mode==='All'||q.mode===mode)&&(q.localityId==='everywhere'||q.localityId===locality));
 return <section className="board-section lean-board" id="quests" aria-label="Available quests"><div className="board-tools"><label className="locality-control" htmlFor="locality">Locality<select id="locality" value={locality} onChange={e=>setLocality(e.target.value)}>{available.map(l=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label><div className="filter-group" aria-label="Quest mode">{['All','Digital','In person'].map(m=><button key={m} aria-pressed={mode===m} className={mode===m?'selected':''} onClick={()=>setMode(m)}>{m}</button>)}</div></div><div className="board-meta"><span>{list.length} {list.length===1?'quest':'quests'}</span></div><div className="quest-grid">{list.map(q=><Link prefetch={false} href={`/quests/${q.id}`} className="quest-card" key={q.id}>{q.status!=='published'?<span className="proposal-tag">Proposed</span>:null}<h2>{q.title}</h2><p>{q.standard}</p><div className="card-bottom"><span>{q.mode} · {q.effort}</span><span aria-hidden="true">↗</span></div><div className="card-locality">{q.localityId==='everywhere'?'Anywhere':data.localities.find(l=>l.id===q.localityId)?.name}</div></Link>)}</div>{!list.length?<p className="empty-note">No matching quests.</p>:null}<div className="board-schedule"><span>Updated <LocalTime value={data.lastPublication!}/></span><span>Next update <LocalTime value={data.nextPublication}/></span></div><details className="lean-coverage" onToggle={e=>setMapOpen(e.currentTarget.open)}><summary>Local coverage</summary>{mapOpen?<Map data={data}/>:null}</details></section>;
}
