import {config} from './config';
import {pitchAt,type VocalNote} from './chart';
export interface Contact {id:number;pitch:number;pressedAt:number}
export type Grade='Perfect'|'Good'|'Miss';
export interface NoteState {note:VocalNote;status:'pending'|'active'|'done';grade?:Grade;gate:boolean;owner?:number;coverage:number;timing:number}
export interface JudgementEvent {noteId:string;grade:Grade}
export class JudgementEngine {
 states:NoteState[]=[]; private lastTime=0;private usedPresses=new Set<string>();private combo=0;private maxCombo=0;
 constructor(private notes:VocalNote[]){this.reset()}
 reset(){this.states=this.notes.map(note=>({note,status:'pending',gate:false,coverage:0,timing:0}));this.lastTime=0;this.usedPresses.clear();this.combo=0;this.maxCombo=0}
 update(time:number,contacts:Contact[]):JudgementEvent[]{
  const events:JudgementEvent[]=[];const dt=Math.max(0,Math.min(.05,time-this.lastTime));this.lastTime=time;
  const finish=(s:NoteState,grade:Grade)=>{s.status='done';s.grade=grade;s.gate=false;this.combo=grade==='Miss'?0:this.combo+1;this.maxCombo=Math.max(this.maxCombo,this.combo);events.push({noteId:s.note.id,grade})};
  for(const s of this.states){
   if(s.status==='done')continue;
   const n=s.note;
   if(s.status==='pending'){
    const c=contacts.find(c=>!this.usedPresses.has(`${c.id}:${c.pressedAt}`)&&Math.abs(c.pressedAt-n.startTime)<=config.goodWindow&&time-c.pressedAt<.1&&Math.abs(c.pitch-n.pitch)<=config.pitchTolerance);
    if(c){this.usedPresses.add(`${c.id}:${c.pressedAt}`);s.owner=c.id;s.timing=Math.abs(c.pressedAt-n.startTime);s.status='active';s.gate=true;
     if(n.duration<config.holdThreshold){finish(s,s.timing<=config.perfectWindow?'Perfect':'Good');continue}
    }else if(time>n.startTime+config.goodWindow){finish(s,'Miss');continue}
   }
   if(s.status==='active'){
    const c=contacts.find(c=>c.id===s.owner);
    s.gate=!!c&&Math.abs(c.pitch-pitchAt(n,time-n.startTime))<=config.pitchTolerance;
    if(s.gate&&time>=n.startTime&&time<=n.startTime+n.duration)s.coverage+=dt;
    if(time>=n.startTime+n.duration){const ratio=s.coverage/n.duration;finish(s,ratio>=config.perfectCoverage&&s.timing<=config.perfectWindow?'Perfect':ratio>=config.goodCoverage?'Good':'Miss')}
   }
  }
  return events;
 }
 results(){const perfect=this.states.filter(s=>s.grade==='Perfect').length,good=this.states.filter(s=>s.grade==='Good').length,miss=this.states.filter(s=>s.grade==='Miss').length;return {perfect,good,miss,score:perfect*config.perfectScore+good*config.goodScore,maxCombo:this.maxCombo,combo:this.combo}}
}
