import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl } from '../lib/research.ts';
import { nonRegressing } from '../lib/prompt.ts';
test('source URL boundary rejects credentials, local hosts, raw IPs and non-HTTPS',()=>{for(const url of ['http://example.org','https://127.0.0.1/','https://[::1]/','https://x.local/','https://x.internal/','https://user:pass@example.org/','https://example.org:8443/'])assert.throws(()=>safeUrl(url));assert.equal(safeUrl('https://www.amherstma.gov/').hostname,'www.amherstma.gov');});
test('prompt improvement requires no regression and at least one improvement',()=>{assert.equal(nonRegressing({safety:5,clarity:3},{safety:4,clarity:5}),false);assert.equal(nonRegressing({safety:5,clarity:3},{safety:5,clarity:3}),false);assert.equal(nonRegressing({safety:5,clarity:3},{safety:5,clarity:4}),true);});
