import { Point } from "./Point";
import { Node } from "./dijkstra/Node";

export class Graph<T> {
	public width: number;
	public height: number;
	#graph: T[][];

	constructor(widthOrGraph: number | Graph<T>, height?: number) {
		if (widthOrGraph instanceof Graph) {
			this.height = widthOrGraph.height;
			this.width = widthOrGraph.width;
			this.#graph = [...Array(widthOrGraph.height)].map((_, y) =>
				[...Array(widthOrGraph.width)].map((_, x) =>
					widthOrGraph.getByCoord(x, y)));
		} else {
			this.height = height;
			this.width = widthOrGraph;
			this.#graph = [...Array(this.height)].map(() => [...Array(this.width)]);
		}
	}

	get(point: Point): T {
		return this.getByCoord(point.x, point.y);
	}

	getByCoord(x: number, y: number): T {
		return this.#graph[y][x];
	}

	set(point: Point, value: T): void {
		return this.setByCoord(point.x, point.y, value);
	}

	setByCoord(x: number, y: number, value: T): void {
		this.#graph[y][x] = value;
	}

	clone(): Graph<T> {
		return new Graph(this);
	}

	toString(): string {
		// return JSON.stringify((this.#graph as unknown as Node[][]).map((row) => row.map((col) => col && col.value || 0)));
		return JSON.stringify((this.#graph as unknown as number[][]).map((row) => row.map((col) => col && col || -3)));
		// return this.#graph.map((row) => row.join('|')).join('\n');
	}
}
