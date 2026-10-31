import test from 'node:test';
import assert from 'node:assert/strict';
import {formResponse} from '../lib/form-response.ts';
import {prepareProofImages} from '../lib/proof-images.ts';
test('platform upload rejection returns an actionable error instead of a JSON parse exception',async()=>{await assert.rejects(formResponse(new Response('Request Entity Too Large',{status:413})),/photos are too large/);});
test('non-JSON outage preserves a retryable form error; JSON authentication errors survive',async()=>{await assert.rejects(formResponse(new Response('<html>Unavailable</html>',{status:503})),/form has been kept/);await assert.rejects(formResponse(Response.json({error:'Recover your passport.'},{status:401})),/Recover your passport/);assert.deepEqual(await formResponse(Response.json({receipt:'saved'})),{receipt:'saved'});});
test('photo preparation preserves small files and rejects excessive or unsupported uploads before enrollment',async()=>{const f=new File(['image'],'photo.jpg',{type:'image/jpeg'});assert.deepEqual(await prepareProofImages([f]),[f]);await assert.rejects(prepareProofImages([f,f,f,f]),/three photos/);await assert.rejects(prepareProofImages([new File(['x'],'x.heic',{type:'image/heic'})]),/JPEG/);});
