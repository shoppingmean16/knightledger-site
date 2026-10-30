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
const publicSite=process.env.KNIGHTLEDGER_PUBLIC_SITE==='true';
export const metadata:Metadata={metadataBase:new URL('https://www.knightledger.com'),title:{default:'KnightLedger — Volunteer quests',template:'%s · KnightLedger'},description:'Complete useful quests, submit proof and earn knighthood. Free to take part.',robots:{index:publicSite,follow:publicSite}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><header className="site-header"><Link className="brand" href="/" aria-label="KnightLedger home"><Crest/><span>Knight<span className="brand-italic">Ledger</span></span></Link><nav aria-label="Main navigation"><Link href="/">Quest Board</Link><Link href="/knights">Hall of Knights</Link><Link href="/petitions">Petitions</Link></nav><Link className="ledger-link" href="/ledger">My Ledger ↗</Link></header><main id="main">{children}</main><footer className="site-footer"><p>Volunteer work. With knighthood.</p><div className="footer-links"><Link href="/agents">AI agents</Link><Link href="/privacy">Privacy & rules</Link><a href="mailto:jason@knightledger.com">Contact us: jason@knightledger.com</a></div></footer></body></html>}
