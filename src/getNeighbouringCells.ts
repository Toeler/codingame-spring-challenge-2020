import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "./Point";
import { wrap } from "./util/wrap";

export function getNeighbouringCells(grid: BitGrid, width: number, height: number, point: Point): Set<Point> {
	const result: Set<Point> = new Set<Point>();
	[
		new Point(point.x, wrap(point.y - 1, height)), // Up
		new Point(point.x, wrap(point.y + 1, height)), // Down
		new Point(wrap(point.x - 1, width), point.y), // Left
		new Point(wrap(point.x + 1, width), point.y) // Right
	].forEach((dir) => {
		if (grid.get(dir.x, dir.y)) {
			result.add(dir);
		}
	});
	return result;
}