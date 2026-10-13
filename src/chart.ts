import data from './satisfied-chart.json';
import {config} from './config';
export interface VocalNote {
    id: string;
    startTime: number;
    duration: number;
    pitch: number;
    lyric: string;
    kind?: 'tap' | 'hold' | 'trace';
    pitchStatus?: 'estimated' | 'reference';
    pitchConfidence?: number;
    timingStatus?: string;
    pitchCurve?: {
        time: number;
        pitch: number;
    }[];
}
export const chart = data as VocalNote[];
export function interactionFor(note: VocalNote): 'tap' | 'hold' | 'trace' {return note.kind ?? (note.duration < config.holdThreshold ? 'tap' : note.pitchCurve ? 'trace' : 'hold');}
export function pitchAt(note: VocalNote, elapsed: number): number {
    const curve = note.pitchCurve;
    if (!curve?.length)
        return note.pitch;
    if (elapsed <= curve[0].time)
        return curve[0].pitch;
    for (let i = 1; i < curve.length; i++)
        if (elapsed <= curve[i].time) {
            const a = curve[i - 1], b = curve[i];
            return a.pitch + (b.pitch - a.pitch) * (elapsed - a.time) / (b.time - a.time);
        }
    return curve[curve.length - 1].pitch;
}
