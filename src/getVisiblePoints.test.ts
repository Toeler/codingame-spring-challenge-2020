import { getVisiblePoints } from "./getVisiblePoints";
import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "./Point";
import { getNeighbouringPoints } from "./getNeighbouringPoints";
import { Graph } from "./Graph";

describe('getVisiblePoints', () => {
	it('should wrap at the top', () => {
		const width = 3;
		const height = 5;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const x = 1;
		for (let y = 0; y < height; y++) {
			if (y !== 3) {
				graph.set(x, y, 1);
				const point = new Point(x, y);
				allPoints.set(point.toString(), point);
			}
		}
		for (const point of allPoints.values()) {
			point.neighbours = getNeighbouringPoints(point, graph, allPoints);
		}

		const point = allPoints.get(Point.toString(1, 2));
		const visiblePoints = getVisiblePoints(point, graph);
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 0)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 4)));
		expect(visiblePoints).toHaveLength(3);
	});

	it('should wrap at the bottom', () => {
		const width = 3;
		const height = 5;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const x = 1;
		for (let y = 0; y < height; y++) {
			if (y !== 1) {
				graph.set(x, y, 1);
				const point = new Point(x, y);
				allPoints.set(point.toString(), point);
			}
		}
		for (const point of allPoints.values()) {
			point.neighbours = getNeighbouringPoints(point, graph, allPoints);
		}

		const point = allPoints.get(Point.toString(1, 2));
		const visiblePoints = getVisiblePoints(point, graph);
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 0)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 3)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 4)));
		expect(visiblePoints).toHaveLength(3);
	});

	it('should wrap vertically without crashing', () => {
		const width = 3;
		const height = 5;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const x = 1;
		for (let y = 0; y < height; y++) {
			graph.set(x, y, 1);
			const point = new Point(x, y);
			allPoints.set(point.toString(), point);
		}
		for (const point of allPoints.values()) {
			point.neighbours = getNeighbouringPoints(point, graph, allPoints);
		}

		const point = allPoints.get(Point.toString(1, 2));
		const visiblePoints = getVisiblePoints(point, graph);
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 0)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 3)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 4)));
		expect(visiblePoints).toHaveLength(4);
	});

	it('should wrap at the left', () => {
		const width = 5;
		const height = 3;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const y = 1;
		for (let x = 0; x < width; x++) {
			if (x !== 3) {
				graph.set(x, y, 1);
				const point = new Point(x, y);
				allPoints.set(point.toString(), point);
			}
		}
		for (const point of allPoints.values()) {
			point.neighbours = getNeighbouringPoints(point, graph, allPoints);
		}

		const point = allPoints.get(Point.toString(2, 1));
		const visiblePoints = getVisiblePoints(point, graph);
		expect(visiblePoints).toContain(allPoints.get(Point.toString(0, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(4, 1)));
		expect(visiblePoints).toHaveLength(3);
	});

	it('should wrap at the right', () => {
		const width = 5;
		const height = 3;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const y = 1;
		for (let x = 0; x < width; x++) {
			if (x !== 1) {
				graph.set(x, y, 1);
				const point = new Point(x, y);
				allPoints.set(point.toString(), point);
			}
		}
		for (const point of allPoints.values()) {
			point.neighbours = getNeighbouringPoints(point, graph, allPoints);
		}

		const point = allPoints.get(Point.toString(2, 1));
		const visiblePoints = getVisiblePoints(point, graph);
		expect(visiblePoints).toContain(allPoints.get(Point.toString(0, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(3, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(4, 1)));
		expect(visiblePoints).toHaveLength(3);
	});

	it('should wrap horizontally without crashing', () => {
		const width = 5;
		const height = 3;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const y = 1;
		for (let x = 0; x < width; x++) {
			graph.set(x, y, 1);
			const point = new Point(x, y);
			allPoints.set(point.toString(), point);
		}
		for (const point of allPoints.values()) {
			point.neighbours = getNeighbouringPoints(point, graph, allPoints);
		}

		const point = allPoints.get(Point.toString(2, 1));
		const visiblePoints = getVisiblePoints(point, graph);
		expect(visiblePoints).toContain(allPoints.get(Point.toString(0, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(1, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(3, 1)));
		expect(visiblePoints).toContain(allPoints.get(Point.toString(4, 1)));
		expect(visiblePoints).toHaveLength(4);
	});
});
