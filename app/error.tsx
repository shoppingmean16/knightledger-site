'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="empty-state"><h1>Unable to load the Ledger.</h1><button className="button" onClick={reset}>Try again</button></section>}
