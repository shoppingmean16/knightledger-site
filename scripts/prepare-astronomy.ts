import { change } from '../lib/store.ts';
import { prepareAstronomy } from '../lib/astronomy.ts';
const count=await change(s=>prepareAstronomy(s));
console.log(`Prepared ${count} astronomy drafts. No approval, publication, member progress or title was changed.`);
