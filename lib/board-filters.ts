export function filterBoardQuests<T extends {localityId:string;mode:string}>(quests:T[],locality='all',mode='All'):T[]{
 return quests.filter(q=>(mode==='All'||q.mode===mode)&&(locality==='all'||q.localityId===locality));
}
// Equirectangular positions, matching the 720×360 world.svg viewBox.
export function mapPosition(lat:number,lon:number){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
 return {left:(lon+180)/360*100,top:(90-lat)/180*100};
}
