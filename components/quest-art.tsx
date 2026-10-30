import type { Quest } from '@/lib/domain';
import { questArt } from '@/lib/quest-presentation';
export function QuestArt({quest,hero=false}:{quest:Pick<Quest,'id'|'templateId'|'title'|'summary'|'category'>;hero?:boolean}){const art=questArt(quest);return <div className={`quest-painting${hero?' hero-painting':''}`} role="img" aria-label={art.alt} style={{backgroundImage:`url("${art.src}")`,backgroundPosition:art.position,backgroundSize:art.size}}><span className="painting-corner" aria-hidden="true">✦</span></div>;}
