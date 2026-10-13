import type { Contact } from './judgement';
export class TouchInput {
    private fingers = new Map<number, {
        y: number;
        pressedAt: number;
    }>();
    private pending = new Map<number, {
        y: number;
        pressedAt: number;
    }>();
    constructor(private canvas: HTMLCanvasElement, private pitch: (y: number) => number, private time: () => number, private enabled: () => boolean) {
        canvas.addEventListener('pointerdown', e => { if (!this.enabled())
            return; e.preventDefault(); canvas.setPointerCapture(e.pointerId); const finger = { y: e.clientY - canvas.getBoundingClientRect().top, pressedAt: this.time() }; this.fingers.set(e.pointerId, finger); this.pending.set(e.pointerId, { ...finger }); });
        canvas.addEventListener('pointermove', e => { const f = this.fingers.get(e.pointerId); if (f) {
            e.preventDefault();
            f.y = e.clientY - canvas.getBoundingClientRect().top;
        } });
        canvas.addEventListener('pointerup', e => this.fingers.delete(e.pointerId));
        for (const event of ['pointercancel', 'lostpointercapture'])
            canvas.addEventListener(event, e => { const id = (e as PointerEvent).pointerId; this.fingers.delete(id); if (event === 'pointercancel')
                this.pending.delete(id); });
    }
    contacts(): Contact[] { const all = new Map([...this.pending, ...this.fingers]); this.pending.clear(); return [...all].map(([id, f]) => ({ id, pitch: this.pitch(f.y), pressedAt: f.pressedAt })); }
    clear() { this.fingers.clear(); this.pending.clear(); }
}
