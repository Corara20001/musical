import {it,expect} from 'vitest';
import {saveBest} from '../src/results';
import {PitchMapping} from '../src/rendering';
it('storage errors still allow a result',()=>{expect(saveBest(100,{getItem(){throw Error()},setItem(){throw Error()}})).toBe(100)});
it('retains higher best score',()=>{expect(saveBest(60,{getItem(){return '100'},setItem(){}})).toBe(100)});
it('invalid storage does not produce NaN',()=>{expect(saveBest(60,{getItem(){return 'oops'},setItem(){}})).toBe(60)});
it('pitch mapping preserves semitones and survives resize',()=>{const m=new PitchMapping();m.resize(390,600);expect(m.y(64)).toBeGreaterThan(m.y(65));expect(m.pitch(m.y(65))).toBeCloseTo(65);m.resize(375,420);expect(m.pitch(m.y(64))).toBeCloseTo(64)});
