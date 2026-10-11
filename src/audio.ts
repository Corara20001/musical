export class Transport {
 private origin=0;private elapsed=0;private running=false;private started=false;
 constructor(private now:()=>number){}
 start(){if(this.started)return;this.started=true;this.running=true;this.origin=this.now();this.elapsed=0}
 time(){return this.running?this.elapsed+this.now()-this.origin:this.elapsed}
 pause(){if(this.running)this.elapsed=this.time();this.running=false}
 resume(){if(!this.started||this.running)return;this.origin=this.now();this.running=true}
 stop(){this.running=false;this.started=false;this.elapsed=0}
}
interface Voice {osc:OscillatorNode;gain:GainNode;filter:BiquadFilterNode}
export class AudioEngine {
 private ctx?:AudioContext;private master?:GainNode;private transport?:Transport;
 private voices=new Map<string,Voice>();private timer?:ReturnType<typeof setInterval>;private beat=-1;private starting=false;private muted=false;private paused=false;
 async start(){if(this.starting||this.timer)return;this.starting=true;try{
  this.ctx??=new AudioContext();await this.ctx.resume();
  this.master??=this.ctx.createGain();this.master.gain.value=this.muted?0:.7;this.master.disconnect();this.master.connect(this.ctx.destination);
  this.transport=new Transport(()=>this.ctx!.currentTime);this.transport.start();this.beat=-1;this.paused=false;
  this.timer=setInterval(()=>this.accompaniment(),30);
 }finally{this.starting=false}}
 time(){return this.transport?.time()??0}
 setMuted(muted:boolean){this.muted=muted;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(muted?0:.7,this.ctx.currentTime,.02)}
 private accompaniment(){if(!this.ctx||!this.master||this.paused)return;const beat=Math.floor(this.time()/.6);if(beat===this.beat)return;this.beat=beat;
  const chord=[48,53,57,55][Math.floor(beat/4)%4];this.tone(chord,.32,.07,'sine');if(beat%2===0)this.tone(chord+19,.25,.025,'triangle');
 }
 private tone(pitch:number,duration:number,volume:number,type:OscillatorType){if(!this.ctx||!this.master)return;const osc=this.ctx.createOscillator(),g=this.ctx.createGain();osc.type=type;osc.frequency.value=440*2**((pitch-69)/12);const t=this.ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(g);g.connect(this.master);osc.start();osc.stop(t+duration+.02);osc.onended=()=>{osc.disconnect();g.disconnect()}}
 setVoice(id:string,pitch:number,enabled:boolean){if(!this.ctx||!this.master)return;let v=this.voices.get(id);const t=this.ctx.currentTime;
  if(enabled&&!v){const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();osc.type='sawtooth';filter.type='bandpass';filter.frequency.value=1050;filter.Q.value=1.2;gain.gain.value=0;osc.connect(filter);filter.connect(gain);gain.connect(this.master);osc.start();v={osc,gain,filter};this.voices.set(id,v)}
  if(v){v.osc.frequency.setTargetAtTime(440*2**((pitch-69)/12),t,.012);v.gain.gain.setTargetAtTime(enabled?.14:0,t,.018);if(!enabled){v.osc.stop(t+.12);v.osc.onended=()=>{v!.osc.disconnect();v!.filter.disconnect();v!.gain.disconnect()};this.voices.delete(id)}}
 }
 tap(id:string,pitch:number,duration:number){this.setVoice(id,pitch,true);const v=this.voices.get(id);if(v&&this.ctx){const t=this.ctx.currentTime;v.gain.gain.setTargetAtTime(0,t+Math.max(.07,duration),.025);v.osc.stop(t+duration+.2);v.osc.onended=()=>{v.osc.disconnect();v.filter.disconnect();v.gain.disconnect()};this.voices.delete(id)}}
 pause(){this.transport?.pause();this.paused=true;this.silence();void this.ctx?.suspend()}
 async resume(){await this.ctx?.resume();this.transport?.resume();this.paused=false}
 private silence(){for(const [id,v]of this.voices)this.setVoice(id,69,false)}
 stop(){if(this.timer)clearInterval(this.timer);this.timer=undefined;this.transport?.stop();this.paused=true;this.silence();void this.ctx?.suspend()}
}
