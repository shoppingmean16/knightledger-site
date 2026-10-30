import Link from 'next/link';
import { load } from '@/lib/store';
import { sanitizePublic } from '@/lib/domain';
import { Board } from '@/components/board';
import { previewAstronomy } from '@/lib/astronomy';
export const dynamic='force-dynamic';
export default async function Home(){const {state}=await load();return <><section className="board-intro"><div style={{maxWidth:"70ch"}}><p className="codex-kicker">THE QUEST BOARD · OPEN TO ALL</p><h1>Small deeds.<br/><em>Excellent armour.</em></h1><p>Do something useful. Collect a story worth telling. Earn your knighthood.</p><p style={{marginTop:12}}>Your neighbourhood needs a side quest? <Link href="/petitions?type=local">Request local quests.</Link></p></div><div className="join-intro"><p><Link href="/privacy#funding">Free. Self-funded. Not-for-profit.</Link></p></div></section><Board data={sanitizePublic(state)} proposals={previewAstronomy(state)}/></>}
