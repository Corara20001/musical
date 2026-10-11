import {describe,it,expect} from 'vitest';
import {pitchAt} from '../src/chart';
import {JudgementEngine} from '../src/judgement';
const note={id:'a',startTime:1,duration:.1,pitch:64,lyric:'light'};
const contact=(id=1,pitch=64,pressedAt=1)=>({id,pitch,pressedAt});
describe('vocal judgement',()=>{
 it('preserves semitones and interpolates bends',()=>{expect(pitchAt({...note,pitch:65},0)).toBe(65);expect(pitchAt({...note,pitchCurve:[{time:0,pitch:64},{time:1,pitch:66}]},.5)).toBe(65)});
 it('scores a fresh tap once',()=>{const e=new JudgementEngine([note]);e.update(1,[contact()]);expect(e.states[0].grade).toBe('Perfect');e.update(1.2,[contact()]);expect(e.results().perfect).toBe(1)});
 it('does not accept an old held finger for a new lyric',()=>{const e=new JudgementEngine([note]);e.update(1,[contact(1,64,0)]);e.update(1.3,[]);expect(e.states[0].grade).toBe('Miss')});
 it('rejects timing and pitch misses',()=>{const e=new JudgementEngine([note]);e.update(1,[contact(1,70)]);e.update(1.3,[]);expect(e.states[0].grade).toBe('Miss')});
 it('requires coverage for sustained sounds',()=>{const e=new JudgementEngine([{...note,duration:1}]);e.update(1,[contact()]);e.update(1.1,[]);e.update(2.1,[]);expect(e.states[0].grade).toBe('Miss');expect(e.states[0].gate).toBe(false)});
 it('trace follows changing pitch and closes on departure',()=>{const e=new JudgementEngine([{...note,duration:1,pitchCurve:[{time:0,pitch:64},{time:1,pitch:70}]}]);e.update(1,[contact()]);e.update(1.3,[contact(1,65.8)]);expect(e.states[0].gate).toBe(true);e.update(1.6,[contact(1,64)]);expect(e.states[0].gate).toBe(false)});
 it('supports independent simultaneous contacts and cancellation',()=>{const e=new JudgementEngine([{...note,duration:1},{...note,id:'b',pitch:70,duration:1}]);e.update(1,[contact(),contact(2,70)]);expect(e.states.map(s=>s.gate)).toEqual([true,true]);e.update(1.1,[contact(2,70)]);expect(e.states.map(s=>s.gate)).toEqual([false,true]);e.reset();expect(e.results().score).toBe(0)});
});
