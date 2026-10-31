const maxBytes=1_200_000;
export async function prepareProofImages(files:File[]):Promise<File[]>{
 if(files.length>3)throw new Error('Choose up to three photos.');
 const prepared:File[]=[];
 for(const file of files){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG or WebP photo.');
  if(file.size<=maxBytes){prepared.push(file);continue;}
  const url=URL.createObjectURL(file);
  try{
   const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('This photo could not be opened. Try a JPEG or submit the observation link.'));image.src=url;});
   const canvas=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
   const context=canvas.getContext('2d');if(!context)throw new Error('This browser could not resize the photo. Submit the observation link instead.');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
   let blob:Blob|null=null;for(const quality of [.85,.7,.5]){blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=maxBytes)break;}
   if(!blob||blob.size>maxBytes)throw new Error('This photo is too large. Choose another photo or submit the observation link.');
   prepared.push(new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'}));
  }finally{URL.revokeObjectURL(url);}
 }
 return prepared;
}
