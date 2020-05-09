import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "./Point";

function wrap(num: number, maxExclusive: number) {
    return (num%maxExclusive + maxExclusive)%maxExclusive;
}

export function getVisibleCells(grid: BitGrid, width: number, height: number, point: Point): Set<Point> {
	const result: Set<Point> = new Set<Point>();
	const seenPoints: Set<string> = new Set<string>();
	// Up
	let y = wrap(point.y - 1, height);
	let x = point.x;
	while (y !== point.y && grid.get(x, y)) {
		const point = new Point(x, y);
		result.add(point);
		seenPoints.add(point.toString());
		y = wrap(y - 1, height);
	}
	// Down
	y = wrap(point.y + 1, height);
	x = point.x;
	while (y !== point.y && !seenPoints.has(Point.toString(x, y)) && grid.get(x, y)) {
		result.add(new Point(x, y));
		seenPoints.add(`${x},${y}`);
		y = wrap(y + 1, height);
	}
	// Left
	y = point.y;
	x = wrap(point.x - 1, width);
	while (x !== point.x && !seenPoints.has(Point.toString(x, y)) && grid.get(x, y)) {
		result.add(new Point(x, y));
		seenPoints.add(`${x},${y}`);
		x = wrap(x - 1, width);
	}
	// Right
	y = point.y;
	x = wrap(point.x + 1, width);
	while (x !== point.x && !seenPoints.has(Point.toString(x, y)) && grid.get(x, y)) {
		result.add(new Point(x, y));
		seenPoints.add(`${x},${y}`);
		x = wrap(x + 1, width);
	}

	return result;
}