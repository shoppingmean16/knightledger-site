import Link from 'next/link';
import { load } from '@/lib/store';
import { sanitizePublic } from '@/lib/domain';
import { Board } from '@/components/board';
import { previewAstronomy } from '@/lib/astronomy';
export const dynamic='force-dynamic';
export default async function Home(){const {state}=await load();return <><section className="board-intro"><div style={{maxWidth:"70ch"}}><h1>Quest Board</h1><p>Help charities and public projects that depend on volunteers. No account needed to take part. Record your completed quests to earn knighthood.</p><p style={{marginTop:12}}>Have a quest in mind, or want to help locally? <Link href="/petitions?type=local">Request local quests.</Link></p></div><div className="join-intro"><p><Link href="/privacy#funding">Free. Self-funded. Not-for-profit.</Link></p></div></section><Board data={sanitizePublic(state)} proposals={previewAstronomy(state)}/></>}
