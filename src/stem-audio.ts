import {Transport} from './audio';
export class StemGate {
 private held=new Set<string>();private taps=new Map<string,{start:number;end:number}>();
 set(id:string,on:boolean){on?this.held.add(id):this.held.delete(id)}
 tap(id:string,time:number,duration:number){this.taps.set(id,{start:time,end:time+duration})}
 enabled(time:number){for(const [id,window] of this.taps)if(time>=window.end)this.taps.delete(id);return this.held.size>0||[...this.taps.values()].some(window=>time>=window.start&&time<window.end)}
 reset(){this.held.clear();this.taps.clear()}
}
export class StemAudioEngine {
 private ctx?:AudioContext;private transport?:Transport;private buffers?:AudioBuffer[];private loading?:Promise<void>;
 private sources:AudioBufferSourceNode[]=[];private master?:GainNode;private vocalGain?:GainNode;private instrumentalGain?:GainNode;
 private gate=new StemGate();private muted=false;private timer?:ReturnType<typeof setInterval>;private gateOpen=false;
 constructor(private urls:{vocal:string;instrumental:string}, private createContext:()=>AudioContext=()=>new AudioContext()){}
 async load(){if(this.buffers)return;this.ctx??=this.createContext();if(!this.loading)this.loading=(async()=>{const files=await Promise.all([this.urls.instrumental,this.urls.vocal].map(async url=>{const r=await fetch(url);if(!r.ok)throw new Error('Audio download failed');return r.arrayBuffer()}));const b=await Promise.all(files.map(f=>this.ctx!.decodeAudioData(f)));if(Math.abs(b[0].duration-b[1].duration)>.03)throw new Error('Stems are not synchronized');this.buffers=b})().catch(e=>{this.loading=undefined;throw e});await this.loading}
 async start(){this.ctx??=this.createContext();await this.ctx.resume();await this.load();this.stopSources();this.transport=new Transport(()=>this.ctx!.currentTime);this.transport.start();this.playAt(0);this.timer=setInterval(()=>this.updateGate(),10)}
 private playAt(offset:number){const c=this.ctx!;this.master??=c.createGain();this.master.disconnect();this.master.connect(c.destination);this.master.gain.value=this.muted?0:.85;this.vocalGain=c.createGain();this.instrumentalGain=c.createGain();this.vocalGain.gain.value=0;this.instrumentalGain.gain.value=1;this.vocalGain.connect(this.master);this.instrumentalGain.connect(this.master);const when=c.currentTime;this.sources=this.buffers!.map((b,i)=>{const source=c.createBufferSource();source.buffer=b;source.connect(i?this.vocalGain!:this.instrumentalGain!);if(offset<b.duration)source.start(when,offset);return source});this.gate.reset();this.gateOpen=false}
 time(){return this.transport?.time()??0}
 setVoice(id:string,_pitch:number,enabled:boolean){this.gate.set(id,enabled);this.updateGate()}
 tap(id:string,_pitch:number,duration:number,startTime=this.time()){this.gate.tap(id,startTime,duration);this.updateGate()}
 private updateGate(){const open=this.gate.enabled(this.time());if(open!==this.gateOpen&&this.ctx&&this.vocalGain){this.vocalGain.gain.setTargetAtTime(open?1:0,this.ctx.currentTime,.008);this.gateOpen=open}}
 setMuted(muted:boolean){this.muted=muted;if(this.ctx&&this.master)this.master.gain.setTargetAtTime(muted?0:.85,this.ctx.currentTime,.02)}
 private stopSources(){for(const s of this.sources){s.stop();s.disconnect()}this.sources=[];this.vocalGain?.disconnect();this.instrumentalGain?.disconnect();this.gate.reset();this.gateOpen=false}
 pause(){this.transport?.pause();this.stopSources();void this.ctx?.suspend()}
 async resume(){await this.ctx?.resume();const offset=this.time();this.playAt(offset);this.transport?.resume()}
 stop(){if(this.timer)clearInterval(this.timer);this.timer=undefined;this.transport?.stop();this.stopSources();void this.ctx?.suspend()}
}
