import {config} from './config';
import {pitchAt} from './chart';
import type {NoteState} from './judgement';
export class PitchMapping {
 width=390;height=600;top=48;bottom=550;
 resize(w:number,h:number){this.width=w;this.height=h;this.top=44;this.bottom=h-54}
 y(pitch:number){return this.bottom-(pitch-config.pitchMin)/(config.pitchMax-config.pitchMin)*(this.bottom-this.top)}
 pitch(y:number){return config.pitchMin+(this.bottom-y)/(this.bottom-this.top)*(config.pitchMax-config.pitchMin)}
}
export class Renderer {
 mapping=new PitchMapping();private ctx:CanvasRenderingContext2D;
 constructor(private canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;this.resize()}
 resize(){const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,3);this.canvas.width=rect.width*dpr;this.canvas.height=rect.height*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);this.mapping.resize(rect.width,rect.height)}
 pitchFromY(y:number){return this.mapping.pitch(y)}
 get line(){return this.mapping.width*.28}
 x(delta:number){return this.line+delta*(this.mapping.width-this.line)/config.lookAhead}
 draw(time:number,states:NoteState[],contacts:{pitch:number}[]){
 const c=this.ctx,m=this.mapping,w=m.width,h=m.height;c.clearRect(0,0,w,h);
 const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#161b2a');gradient.addColorStop(1,'#0c101c');c.fillStyle=gradient;c.fillRect(0,0,w,h);
 for(let p=config.pitchMin;p<=config.pitchMax;p++){const y=m.y(p);c.strokeStyle=p%12===0?'#495063':'#ffffff0b';c.lineWidth=1;c.beginPath();c.moveTo(40,y);c.lineTo(w,y);c.stroke();if(p%2===0){c.font='10px monospace';c.fillStyle='#657084';c.fillText(['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][p%12]+(Math.floor(p/12)-1),8,y+3)}}
 c.fillStyle='#e8cb8c08';c.fillRect(this.line-24,30,48,h-62);c.strokeStyle='#f0d5a0';c.lineWidth=1.5;c.beginPath();c.moveTo(this.line,28);c.lineTo(this.line,h-32);c.stroke();c.fillStyle='#e8cb8c';c.font='10px sans-serif';c.textAlign='center';c.fillText('演奏线',this.line,18);c.textAlign='left';
 for(const s of states){const n=s.note,start=this.x(n.startTime-time),end=this.x(n.startTime+n.duration-time);if(start>w+40||end<40||s.status==='done'&&n.duration<config.holdThreshold)continue;
 const active=s.status==='active'&&s.gate;const color=s.grade==='Miss'?'#515669':s.status==='done'?'#8c91a0':active?'#fff0b9':n.pitchCurve?'#c4b2fa':'#efce91';c.globalAlpha=s.status==='done'?.35:1;
 if(n.duration>=config.holdThreshold){c.lineCap='round';c.lineJoin='round';c.lineWidth=active?13:10;c.strokeStyle=color+'55';c.beginPath();for(let i=0;i<=60;i++){const t=n.duration*i/60,x=this.x(n.startTime+t-time),y=m.y(pitchAt(n,t));i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.lineWidth=2;c.strokeStyle=color;c.stroke();}
 const y=m.y(n.pitch);c.fillStyle=color;c.shadowColor=color;c.shadowBlur=active?18:0;c.beginPath();c.arc(start,y,5,0,Math.PI*2);c.fill();c.shadowBlur=0;c.font='600 17px Georgia, serif';const textW=c.measureText(n.lyric).width;c.fillStyle='#111623';c.fillRect(start+9,y-23,textW+10,23);c.fillStyle=color;c.fillText(n.lyric,start+14,y-6);c.globalAlpha=1;
 }
 for(const contact of contacts){const y=m.y(contact.pitch);c.strokeStyle='#fff1c2';c.lineWidth=2;c.beginPath();c.arc(this.line,y,17,0,Math.PI*2);c.stroke();c.fillStyle='#fff1c244';c.beginPath();c.arc(this.line,y,8,0,Math.PI*2);c.fill()}
 c.fillStyle='#7c869c';c.font='10px sans-serif';c.textAlign='right';c.fillText('音高 ↑',w-14,18);c.fillText('歌词 ←',w-14,h-16);c.textAlign='left';
 }
}
