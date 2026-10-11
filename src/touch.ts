import type {Contact} from './judgement';
export class TouchInput {
 private fingers=new Map<number,{y:number;pressedAt:number}>();
 constructor(private canvas:HTMLCanvasElement,private pitch:(y:number)=>number,private time:()=>number,private enabled:()=>boolean){
 canvas.addEventListener('pointerdown',e=>{if(!this.enabled())return;e.preventDefault();canvas.setPointerCapture(e.pointerId);this.fingers.set(e.pointerId,{y:e.clientY-canvas.getBoundingClientRect().top,pressedAt:this.time()})});
 canvas.addEventListener('pointermove',e=>{const f=this.fingers.get(e.pointerId);if(f){e.preventDefault();f.y=e.clientY-canvas.getBoundingClientRect().top}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>this.fingers.delete((e as PointerEvent).pointerId));
 }
 contacts():Contact[]{return [...this.fingers].map(([id,f])=>({id,pitch:this.pitch(f.y),pressedAt:f.pressedAt}))}
 clear(){this.fingers.clear()}
}
