'use client';
import type { sanitizePublic } from '@/lib/domain';
import { mapPosition } from '@/lib/board-filters';
export default function Coverage({data,onSelectLocality}:{data:ReturnType<typeof sanitizePublic>;onSelectLocality?:(id:string)=>void}){
 return <div className="atlas"><div className="map-frame"><img loading="lazy" decoding="async" src="/world.svg" alt="World land outlines showing locality coverage"/>{data.coverage.map(c=>{
  const l=data.localities.find(l=>l.id===c.localityId);
  const point=l?.verified&&l.lat!==undefined&&l.lon!==undefined?mapPosition(l.lat,l.lon):null;
  if(!l||!point)return null;
  const label=`${l.name}: ${c.squires} Squires, ${c.knights} Knights, ${c.quests} local quests. Filter quests for this locality.`;
  return <button type="button" className="map-pin" key={l.id} style={{left:`${point.left}%`,top:`${point.top}%`}} title={label} aria-label={label} onClick={()=>onSelectLocality?.(l.id)}/>;
 })}</div><p className="map-attribution">Select a dot or locality below to filter quests. Dots mark locality centres, never people. Nearby localities may overlap at this scale.</p>{data.coverage.length?<ul className="coverage-list">{data.coverage.map(c=><li key={c.localityId}><button type="button" className="text-link" onClick={()=>onSelectLocality?.(c.localityId)}>{data.localities.find(l=>l.id===c.localityId)?.name}</button><span>{c.squires} Squires · {c.knights} Knights · {c.quests} quests</span></li>)}</ul>:<p className="atlas-empty">No local participation yet.</p>}<p className="map-attribution">Land outlines: Natural Earth, public domain. Place data: © OpenStreetMap contributors and linked public geographic sources.</p></div>;
}
