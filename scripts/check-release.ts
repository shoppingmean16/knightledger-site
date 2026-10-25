import { load } from '../lib/store.ts';
import { releaseReadiness } from '../lib/readiness.ts';
try {
  const {state}=await load();
  const report=releaseReadiness(state);
  console.log(JSON.stringify(report,null,2));
  // Read-only: no AI calls, approval, publication, configuration changes or domain mutations.
  process.exitCode=report.ready?0:1;
} catch {
  console.error('Release check could not read the configured database. No release action was taken.');
  process.exitCode=1;
}
