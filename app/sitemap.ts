import type { MetadataRoute } from 'next';
import { load } from '@/lib/store';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(process.env.KNIGHTLEDGER_PUBLIC_SITE!=='true')return [];
 const {state}=await load(),base='https://www.knightledger.com';
 return [...['','/knights','/petitions','/privacy'].map(path=>({url:base+path})),...state.quests.filter(q=>q.status==='published').map(q=>({url:base+'/quests/'+q.id,lastModified:q.publishedAt})),...state.chronicles.map(c=>({url:base+'/knights/'+c.id,lastModified:c.inductedAt}))];
}
