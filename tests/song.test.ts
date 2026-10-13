import {it,expect} from 'vitest';
import {song} from '../src/song';
import {chart} from '../src/chart';
it('real song excerpt uses distinct chart identity and valid boundaries',()=>{expect(song.id).not.toBe('demo');expect(song.duration).toBeGreaterThan(26);expect(song.audio).toBeDefined();expect(chart[0].lyric.toLowerCase()).toBe('i');expect(chart.at(-1)?.lyric.toLowerCase().replace(/[.!]/g,'')).toBe('game');expect(new Set(chart.map(n=>n.id)).size).toBe(chart.length);expect(chart.every(n=>n.duration>0&&n.startTime>=0&&n.startTime+n.duration<=song.duration)).toBe(true)});
