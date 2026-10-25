export function boundedInteger(value:string|undefined,fallback:number,min:number,max:number){const n=Number(value);return value!==undefined&&Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
export const dailyCallLimit=()=>boundedInteger(process.env.MAX_AI_TASKS_PER_DAY,12,0,100);
export const cycleLimit=()=>boundedInteger(process.env.MAX_CYCLE_ITEMS,3,1,10);
