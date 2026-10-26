import Link from 'next/link';
import { load } from '@/lib/store';
import { sanitizePublic } from '@/lib/domain';
import { Board } from '@/components/board';
import { previewAstronomy } from '@/lib/astronomy';
export const dynamic='force-dynamic';
export default async function Home(){const {state}=await load();return <><section className="board-intro"><div><h1>Quest Board</h1><p>Volunteer quests. Complete a deed; submit proof to earn knighthood.</p></div><div className="join-intro"><p><Link href="/privacy#funding">Free. Self-funded. Not-for-profit.</Link></p></div></section><Board data={sanitizePublic(state)} proposals={previewAstronomy(state)}/></>}
