'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="empty-state"><span className="eyebrow">THE LEDGER IS TEMPORARILY UNAVAILABLE</span><h1>A pause in the telling.</h1><p>The database or a service could not be reached. We have not substituted a pretend Ledger.</p><button className="button" onClick={reset}>Try again ↻</button></section>}
