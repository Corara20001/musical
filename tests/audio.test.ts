import { it, expect } from 'vitest';
import { Transport } from '../src/audio';
it('pause freezes clock, resume continues, repeat start and stop reset', () => { let now = 10; const t = new Transport(() => now); t.start(); now = 12; expect(t.time()).toBe(2); t.start(); expect(t.time()).toBe(2); t.pause(); now = 20; expect(t.time()).toBe(2); t.resume(); now = 21; expect(t.time()).toBe(3); t.stop(); expect(t.time()).toBe(0); t.start(); expect(t.time()).toBe(0); });
import { AudioEngine } from '../src/audio';
import { vi } from 'vitest';
class Param {
    value = 0;
    setValueAtTime() { }
    linearRampToValueAtTime() { }
    exponentialRampToValueAtTime() { }
    setTargetAtTime() { }
}
class AudioNodeStub {
    gain = new Param();
    frequency = new Param();
    Q = new Param();
    type = '';
    onended?: () => void;
    connected = false;
    stopped = false;
    connect() { this.connected = true; }
    disconnect() { this.connected = false; }
    start() { }
    stop() { this.stopped = true; }
}
class ContextStub {
    currentTime = 1;
    destination = {};
    nodes: AudioNodeStub[] = [];
    createGain() { return new AudioNodeStub(); }
    createBiquadFilter() { return new AudioNodeStub(); }
    createOscillator() { const n = new AudioNodeStub(); this.nodes.push(n); return n; }
    async resume() { }
    async suspend() { }
}
it('pause and stop disconnect every live sound including tapped notes and accompaniment', async () => { vi.useFakeTimers(); try {
    const c = new ContextStub();
    const audio = new AudioEngine(() => c as unknown as AudioContext);
    await audio.start();
    vi.advanceTimersByTime(35);
    audio.tap('tap', 64, .2);
    audio.setVoice('hold', 65, true);
    expect(c.nodes.length).toBeGreaterThan(2);
    audio.pause();
    expect(c.nodes.every(n => n.stopped && !n.connected)).toBe(true);
    await audio.resume();
    audio.tap('new', 64, .2);
    audio.stop();
    expect(c.nodes.every(n => n.stopped && !n.connected)).toBe(true);
}
finally {
    vi.useRealTimers();
} });
