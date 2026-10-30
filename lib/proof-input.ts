export function proofAccount(questId:string,text:string,evidenceLink?:string){
 if(questId==='teach-a-lobster-to-be-useful'){
  if(!evidenceLink)throw new Error('Add the public link to your Moltbook post.');
  return text||'Submitted a public Moltbook post for review.';
 }
 if(text.length<40)throw new Error('Describe the completed deed in at least 40 characters.');
 return text;
}
