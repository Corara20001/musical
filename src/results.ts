interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
export function saveBest(score:number,storage?:StorageLike):number {
 try{storage??=localStorage;const old=Number(storage.getItem('musical-demo-best'));const best=Math.max(score,Number.isFinite(old)?old:0);storage.setItem('musical-demo-best',String(best));return best}catch{return score}
}
