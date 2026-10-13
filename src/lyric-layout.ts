export interface LyricBox {x:number;y:number;width:number;height:number}
export function placeLyricLabel(anchorX:number,anchorY:number,width:number,_canvasWidth:number,height:number,occupied:LyricBox[]):LyricBox {
 const x=anchorX+14,labelHeight=18;
 for(const offset of [-24,-46,-68,4,26,48,-90]){
  const y=Math.min(height-labelHeight-12,Math.max(24,anchorY+offset));
  const box={x,y,width:width+8,height:labelHeight};
  if(!occupied.some(o=>box.x<o.x+o.width+5&&box.x+box.width+5>o.x&&box.y<o.y+o.height+3&&box.y+box.height+3>o.y))return box;
 }
 return {x,y:Math.max(24,anchorY-24),width:width+8,height:labelHeight};
}
