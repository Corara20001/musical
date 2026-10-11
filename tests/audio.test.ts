import {it,expect} from 'vitest';
import {Transport} from '../src/audio';
it('pause freezes clock, resume continues, repeat start and stop reset',()=>{let now=10;const t=new Transport(()=>now);t.start();now=12;expect(t.time()).toBe(2);t.start();expect(t.time()).toBe(2);t.pause();now=20;expect(t.time()).toBe(2);t.resume();now=21;expect(t.time()).toBe(3);t.stop();expect(t.time()).toBe(0);t.start();expect(t.time()).toBe(0)});
