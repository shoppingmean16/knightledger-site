export async function formResponse(r:Response){
 const text=await r.text();let data;
 try{data=JSON.parse(text);}catch{throw new Error(r.status===413?'The photos are too large to upload. Try fewer photos, or submit the observation link without a photo.':'The server could not save this submission. Please retry; your form has been kept.');}
 if(!r.ok)throw new Error(typeof data?.error==='string'?data.error:'Unable to save. Please retry.');
 return data;
}
