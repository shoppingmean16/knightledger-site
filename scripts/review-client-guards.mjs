// Transport guardrails for the owner's delegated quest-review authority.
export function approvalItems(input,status,now=Date.now()){
 if(!input||input.groundingConfirmed!==true||!Array.isArray(input.items)||input.items.length<1||input.items.length>24)throw new Error('Independently review 1–24 exact quests before approval.');
 if(Object.keys(input).some(k=>!['items','groundingConfirmed'].includes(k)))throw new Error('Unknown approval field.');
 if(status.settings?.paused)throw new Error('The Steward is paused.');
 if(!status.runs?.some(r=>r.phase==='chat-review'&&r.status==='running'&&Date.parse(r.leaseUntil)>now))throw new Error('Acquire a current review lease before delegated approval.');
 const seen=new Set();
 return input.items.map(item=>{
  if(!item||Object.keys(item).some(k=>!['id','version'].includes(k))||typeof item.id!=='string'||!Number.isInteger(item.version)||item.version<1||seen.has(item.id))throw new Error('Use unique quest IDs and exact positive versions.');
  seen.add(item.id);
  const quest=status.quests?.find(q=>q.id===item.id&&q.version===item.version&&q.status==='draft');
  if(!quest)throw new Error('The draft changed or is no longer awaiting approval.');
  if(!quest.sources?.length||!Number.isFinite(Date.parse(quest.recheckAt))||Date.parse(quest.recheckAt)<=now||quest.sources.some(s=>!/^https?:\/\//.test(s.url)||!Number.isFinite(Date.parse(s.checkedAt))||Date.parse(s.checkedAt)>now+60000))throw new Error('Current researched sources and a future recheck date are required.');
  if(status.jobs?.some(j=>j.questId===quest.id&&j.kind==='editorial'&&j.status!=='done'))throw new Error('Editorial research is not finished.');
  return {id:item.id,version:item.version};
 });
}
export function publicationInput(input,now=new Date()){
 if(!input||Object.keys(input).length)throw new Error('Publication accepts no phase overrides.');
 return {phase:now.getUTCHours()<12?'publish00':'publish12'};
}
