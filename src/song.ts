import metadata from './satisfied-song.json';
export const song = metadata;
export function formatTime(seconds:number):string {const n=Math.max(0,Math.floor(seconds));return `${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`}
