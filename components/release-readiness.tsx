import type { releaseReadiness } from '@/lib/readiness';
export function ReleaseReadiness({report}:{report:ReturnType<typeof releaseReadiness>}) {
  return <section className="release-readiness" aria-labelledby="release-title">
    <div className="section-heading"><h2 id="release-title">Before the public opening</h2><span className="status-chip">{report.ready?'Service checks ready':'Private preview · release held'}</span></div>
    <p>Keep testing here. Nothing on this desk replaces KnightLedger.com.</p>
    <div className="readiness-list">{report.items.map(item=><div key={item.id} className="readiness-item"><span aria-hidden="true" className={item.ready?'readiness-tick':'readiness-pending'}>{item.ready?'✓':'○'}</span><div><h3>{item.label}<small>{item.ready?'CHECK PASSED':'ACTION / VERIFICATION NEEDED'}</small></h3><p>{item.detail}</p></div></div>)}</div>
    <p className="inline-note">{report.remainingAcceptance}</p>
  </section>;
}
