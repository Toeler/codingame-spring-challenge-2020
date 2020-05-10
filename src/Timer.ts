export class Timer {
	#start: [number, number];
	constructor(protected name: string) {}

	start(): Timer {
		this.#start = process.hrtime();
		return this;
	}

	stop(): number {
		const end = process.hrtime(this.#start);
		const elapsedMs = end[1] / 1000000;
		printErr(`${this.name} took ${elapsedMs}ms`);
		return elapsedMs;
	}
}