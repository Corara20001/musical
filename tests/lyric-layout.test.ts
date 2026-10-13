import {it,expect} from 'vitest';
import {placeLyricLabel} from '../src/lyric-layout';
it('dense same-pitch lyrics get nonoverlapping labels without moving note anchors',()=>{const occupied:ReturnType<typeof placeLyricLabel>[]=[];const a=placeLyricLabel(330,230,75,844,285,occupied);occupied.push(a);const b=placeLyricLabel(374,230,110,844,285,occupied);expect(b.y).not.toBe(a.y);expect(b.x).toBe(388);expect(b.y>=20&&b.y+b.height<=285).toBe(true)});
