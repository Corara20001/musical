import { it, expect } from 'vitest';
import { TouchInput } from '../src/touch';
class Surface extends EventTarget {
    setPointerCapture() { }
    getBoundingClientRect() { return { top: 10 }; }
}
function pointer(target: EventTarget, type: string, id = 1, y = 74) { const e = new Event(type, { cancelable: true }); Object.assign(e, { pointerId: id, clientY: y }); target.dispatchEvent(e); }
it('captures a tap released between rendering frames', () => { const canvas = new Surface(); const input = new TouchInput(canvas as unknown as HTMLCanvasElement, y => y, () => 1, () => true); pointer(canvas, 'pointerdown'); pointer(canvas, 'pointerup'); expect(input.contacts()).toEqual([{ id: 1, pitch: 64, pressedAt: 1 }]); expect(input.contacts()).toEqual([]); });
it('cancels and clears held pointers', () => { const canvas = new Surface(); const input = new TouchInput(canvas as unknown as HTMLCanvasElement, y => y, () => 1, () => true); pointer(canvas, 'pointerdown'); input.contacts(); pointer(canvas, 'pointercancel'); expect(input.contacts()).toEqual([]); pointer(canvas, 'pointerdown', 2); input.clear(); expect(input.contacts()).toEqual([]); });
