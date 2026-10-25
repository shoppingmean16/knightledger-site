'use client';
import { useEffect, useState } from 'react';
export function LocalTime({value}:{value:string}){const [local,setLocal]=useState<string|null>(null);useEffect(()=>{setLocal(new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}));},[value]);return <time dateTime={value}>{local||new Date(value).toISOString().slice(0,16).replace('T',' ')+' UTC'}</time>}
