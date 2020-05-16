import { performance, PerformanceObserver } from 'perf_hooks';
import { debug } from "./util/debug";

export class Timer {
	#startName: string;
	#endName: string;
	constructor(protected name: string) {
		this.#startName = `${this.name} - Start`;
		this.#endName = `${this.name} - End`;
		const obs = new PerformanceObserver((list) => {
			const entry = list.getEntriesByName(this.name)[0];
			if (!entry) {
				return;
			}
			debug(`${this.name} took ${entry.duration}ms`);
			obs.disconnect();
			performance.clearMarks(this.#startName);
			performance.clearMarks(this.#endName);
		});
		obs.observe({ entryTypes: ['mark', 'measure']});
		this.start();
	}

	private start(): Timer {
		performance.mark(this.#startName);
		return this;
	}

	stop() {
		performance.mark(this.#endName);
		performance.measure(this.name, this.#startName, this.#endName);
	}
}