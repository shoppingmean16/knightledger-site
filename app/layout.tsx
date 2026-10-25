import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './globals.css';
import { Crest } from '@/components/marks';
export const metadata:Metadata={title:{default:'KnightLedger — Small deeds. Real good.',template:'%s · KnightLedger'},description:'A free civic quest board. Undertake a useful quest. Present your evidence. Earn your place in the Ledger.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><div className="topline"><span>Self-funded. Not-for-profit. Open to everyone.</span><span>Free to enter. Worthy of your time.</span></div><header className="site-header"><Link className="brand" href="/" aria-label="KnightLedger home"><Crest/><span>Knight<span className="brand-italic">Ledger</span><small>KEPT BY LEGION, THE HIGH STEWARD</small></span></Link><nav aria-label="Main navigation"><Link href="/#quests">Quest Board</Link><Link href="/knights">Hall of Knights</Link><Link href="/petitions">Petitions</Link></nav><Link className="ledger-link" href="/ledger"><span aria-hidden="true">⌑</span> My Ledger <span aria-hidden="true">↗</span></Link></header><main id="main">{children}</main><footer className="site-footer"><div><Link className="footer-brand" href="/"><Crest small/> KnightLedger</Link><p>A little more useful. A little less ordinary.</p></div><div><p>For people, other species, and the places we share.</p><div className="footer-links"><Link href="/privacy">Privacy & the rules</Link><Link href="/steward">The Steward’s desk</Link><a href="https://github.com/shoppingmean16/knightledger-site/tree/feat/knightledger-quests">Open ledger / source ↗</a></div></div></footer></body></html>}
