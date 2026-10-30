import type { Quest } from './domain.ts';
import overrides from './quest-art-overrides.json' with {type:'json'};
const ids=['bench-not-bin','phantom-hours','small-beast-census','second-life','less-useless-internet','missing-ramps','commons-proofreader','waste-less-water','galaxies-have-shapes','tess-small-dip','dark-energy-real-signals','exoplanet-without-telescope','exoplanet-night-watch','variable-star-witness','c623fc29-d03e-459d-a267-e83b00860da6','5f4b5ae5-cb2b-432e-8cfa-7dfbf7708a9f'];
const aliases=['litter|cleanup|clean-up','opening|hours','species|organism|biodiversity|wildlife','repair|second life','broken.link','accessibility|ramp','proofread|typo','leak|water','galax|universe','transit|tess','dark.energy','robotic|dataset','telescope|observing','variable.star','plant|reservoir|garden','survey|planning|council'];
export function questArt(q:Pick<Quest,'id'|'templateId'|'title'|'summary'|'category'>){
 const custom=(overrides as Record<string,{src:string;alt:string}>)[q.id];
 if(custom)return {...custom,position:'center',size:'cover'};
 if(q.id==='teach-a-lobster-to-be-useful')return {src:'/art/moltbook-knight.webp',alt:'An armored knight introduces a mechanical lobster to a laptop in a medieval scriptorium.',position:'center',size:'cover'};
 let slot=ids.indexOf(q.id);
 if(slot<0){const text=[q.templateId,q.title,q.summary].join(' ');slot=aliases.findIndex(pattern=>new RegExp(pattern,'i').test(text));}
 if(slot<0)slot=q.category==='Science'?8:q.category==='Other species'?2:6;
 return {src:'/art/quest-atlas.webp',alt:'An illuminated miniature of a knight carrying out a modern good deed.',position:`${slot%4/3*100}% ${Math.floor(slot/4)/3*100}%`,size:'400% 400%'};
}
export function cardSummary(q:Pick<Quest,'id'|'summary'>){return q.summary.length>125?q.summary.slice(0,122).replace(/\s+\S*$/,'')+'…':q.summary;}
export function stepLead(step:string){const first=step.match(/^(.+?[.!?])(?:\s|$)/)?.[1]||step;return first;}
