/** Discards async transitions invalidated by navigation or browser visibility. */
export class TransitionGuard {
    private generation = 0;
    constructor(private allowed: () => boolean = () => true) { }
    cancel() { this.generation++; }
    async run(operation: () => Promise<void>, commit: () => void): Promise<boolean> { const generation = ++this.generation; await operation(); if (generation !== this.generation || !this.allowed())
        return false; commit(); return true; }
}
