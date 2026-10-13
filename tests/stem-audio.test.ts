import {it,expect} from 'vitest';
import {StemGate} from '../src/stem-audio';
it('overlapping notes keep vocal open until every gate closes',()=>{const gate=new StemGate();gate.set('a',true);gate.set('b',true);gate.set('a',false);expect(gate.enabled(1)).toBe(true);gate.set('b',false);expect(gate.enabled(1)).toBe(false)});
it('tap window expires independently and reset clears every gate',()=>{const gate=new StemGate();gate.tap('tap',2,.15);expect(gate.enabled(2.1)).toBe(true);expect(gate.enabled(2.16)).toBe(false);gate.set('hold',true);gate.reset();expect(gate.enabled(3)).toBe(false)});
import {StemAudioEngine} from '../src/stem-audio';
import {vi} from 'vitest';
class Param {value=0;setTargetAtTime(value:number){this.value=value}}
class Gain {gain=new Param();connect(){}disconnect(){}}
class Source {buffer:unknown;when=-1;offset=-1;stopped=false;connect(){}disconnect(){}start(when:number,offset:number){this.when=when;this.offset=offset}stop(){this.stopped=true}}
class Context {currentTime=10;destination={};sources:Source[]=[];createGain(){return new Gain()}createBufferSource(){const s=new Source();this.sources.push(s);return s}async resume(){}async suspend(){}async decodeAudioData(){return {duration:35}}}
it('both tracks share one schedule and resume from the frozen excerpt offset',async()=>{vi.useFakeTimers();vi.stubGlobal('fetch',async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}));try{const c=new Context(),a=new StemAudioEngine({vocal:'v',instrumental:'i'},()=>c as unknown as AudioContext);await a.start();expect(c.sources.map(s=>[s.when,s.offset])).toEqual([[10,0],[10,0]]);c.currentTime=12;a.pause();expect(a.time()).toBe(2);expect(c.sources.every(s=>s.stopped)).toBe(true);c.currentTime=20;await a.resume();expect(c.sources.slice(2).map(s=>[s.when,s.offset])).toEqual([[20,2],[20,2]]);c.currentTime=21;expect(a.time()).toBe(3);a.stop();expect(a.time()).toBe(0);expect(c.sources.every(s=>s.stopped)).toBe(true)}finally{vi.unstubAllGlobals();vi.useRealTimers()}});
it('early accepted tap waits for recorded word and never leaks into its neighbor',()=>{const gate=new StemGate();gate.tap('word',3.5,.22);expect(gate.enabled(3.3)).toBe(false);expect(gate.enabled(3.51)).toBe(true);expect(gate.enabled(3.73)).toBe(false)});
