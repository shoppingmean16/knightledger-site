import { load, change } from './store.ts';
import { fetchSource } from './research.ts';
import { type Locality } from './domain.ts';
type Place={osm_type:string;osm_id:number;display_name:string;lat:string;lon:string;type:string;addresstype?:string;address?:Record<string,string>};
const normalize=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export async function verifyLocality(localityId:string):Promise<Locality>{
 const {state}=await load();const current=state.localities.find(l=>l.id===localityId);if(!current)throw new Error('The locality is no longer available.');if(current.verified)return current;
 // Public place names only. Nominatim does not receive a passport, IP, or evidence.
 const raw=await fetchSource('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=3&q='+encodeURIComponent(current.name));
 let places:Place[];try{places=JSON.parse(raw);}catch{throw new Error('The geographic source could not be read. The request remains queued.');}
 if(!Array.isArray(places)||!places.length)throw new Error('This locality could not be resolved. Please provide a town and region or neighborhood and city in a follow-up request.');
 const allowed=['city','town','village','hamlet','municipality','borough','suburb','neighbourhood','quarter','city_district','administrative'];
 const place=places.find(p=>allowed.includes(p.addresstype||p.type)&&['node','way','relation'].includes(p.osm_type));
 if(!place)throw new Error('The geographic source did not identify a recognized settlement or neighborhood. Exact addresses are not mapped.');
 if(places.length>1&&normalize(places[0].display_name.split(',')[0])===normalize(places[1].display_name.split(',')[0])&&current.name.split(',').length<2)throw new Error('This place name is ambiguous. Please supply its region or parent city; no guessed locality has been published.');
 const canonicalId=`osm-${place.osm_type}-${place.osm_id}`;const lat=Number(place.lat),lon=Number(place.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Invalid geographic-source coordinates.');
 let parentId:string|undefined;const address=place.address||{};const borough=state.localities.find(l=>l.type==='borough'&&Object.values(address).some(v=>normalize(v)===normalize(l.name.split(',')[0])));
 const isNyc=Object.values(address).some(v=>/^(New York|New York City|NYC)$/i.test(v));
 if(isNyc&&['suburb','neighbourhood','quarter'].includes(place.addresstype||place.type))parentId=borough?.id||'us-ny-nyc';
 const verified:Locality={id:canonicalId,name:place.display_name,type:place.addresstype||place.type,parentId,source:`https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`,verified:true,lat,lon,aliases:[normalize(current.name),...current.aliases||[]]};
 return change(s=>{
  const known=s.localities.find(l=>l.id===canonicalId||l.verified&&normalize(l.name)===normalize(verified.name));const target=known||verified;
  if(known)known.aliases=[...new Set([...(known.aliases||[]),...(verified.aliases||[])])];else s.localities.push(verified);
  for(const m of s.members)if(m.localityId===localityId)m.localityId=target.id;
  for(const p of s.petitions)if(p.localityId===localityId)p.localityId=target.id;
  for(const q of s.quests)if(q.localityId===localityId)q.localityId=target.id;
  for(const c of s.chronicles)if(c.localityId===localityId)c.localityId=target.id;
  if(localityId!==target.id)s.localities=s.localities.filter(l=>l.id!==localityId);return target;
 });
}
