import { getNeighbouringPoints } from "./getNeighbouringPoints";
import { Point } from "./Point";
import { Graph } from "./Graph";

describe('getNeighbouringPoints', () => {
	it('should wrap at the top when open', () => {
		const width = 3;
		const height = 5;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const x = 1;
		for (let y = 0; y < height; y++) {
			graph.setByCoord(x, y, 1);
			const point = new Point(x, y);
			allPoints.set(point.toString(), point);
		}

		const neighbours = getNeighbouringPoints(new Point(1, 0), graph, allPoints);
		expect(neighbours).toContain(allPoints.get(Point.toString(1, 1)));
		expect(neighbours).toContain(allPoints.get(Point.toString(1, 4)));
		expect(neighbours).toHaveLength(2);
	});

	it('should wrap at the bottom', () => {
		const width = 3;
		const height = 5;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const x = 1;
		for (let y = 0; y < height; y++) {
			graph.setByCoord(x, y, 1);
			const point = new Point(x, y);
			allPoints.set(point.toString(), point);
		}

		const neighbours = getNeighbouringPoints(new Point(1, 4), graph, allPoints);
		expect(neighbours).toContain(allPoints.get(Point.toString(1, 0)));
		expect(neighbours).toContain(allPoints.get(Point.toString(1, 3)));
		expect(neighbours).toHaveLength(2);
	});

	it('should wrap at the left', () => {
		const width = 5;
		const height = 3;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const y = 1;
		for (let x = 0; x < width; x++) {
			graph.setByCoord(x, y, 1);
			const point = new Point(x, y);
			allPoints.set(point.toString(), point);
		}

		const neighbours = getNeighbouringPoints(new Point(0, 1), graph, allPoints);
		expect(neighbours).toContain(allPoints.get(Point.toString(1, 1)));
		expect(neighbours).toContain(allPoints.get(Point.toString(4, 1)));
		expect(neighbours).toHaveLength(2);
	});

	it('should wrap at the right', () => {
		const width = 5;
		const height = 3;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const y = 1;
		for (let x = 0; x < width; x++) {
			graph.setByCoord(x, y, 1);
			const point = new Point(x, y);
			allPoints.set(point.toString(), point);
		}

		const neighbours = getNeighbouringPoints(new Point(4, 1), graph, allPoints);
		expect(neighbours).toContain(allPoints.get(Point.toString(0, 1)));
		expect(neighbours).toContain(allPoints.get(Point.toString(3, 1)));
		expect(neighbours).toHaveLength(2);
	});

	it('should not wrap at the top when closed', () => {
		const width = 3;
		const height = 5;
		const graph = new Graph(width, height);
		const allPoints = new Map<string, Point>();
		const x = 1;
		for (let y = 0; y < height; y++) {
			if (y !== (height - 1)) {
				graph.setByCoord(x, y, 1);
				const point = new Point(x, y);
				allPoints.set(point.toString(), point);
			}
		}

		const neighbours = getNeighbouringPoints(new Point(1, 0), graph, allPoints);
		expect(neighbours).toContain(allPoints.get(Point.toString(1, 1)));
		expect(neighbours).toHaveLength(1);
	});
});
