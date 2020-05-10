import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "../Point";
import { findPath } from "./findPath";
import { wrap } from "../util/wrap";
import { getNeighbouringCells } from "../getNeighbouringCells";

describe('findPath', () => {
	it('should find a simple uninterrupted path', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		const neighbourLookup = new Map<string, Set<Point>>();
		for (let y = 0; y < height; y++) {
			grid.set(1, y, y !== (height - 1));
		}
		for (let y = 0; y < height; y++) {
			neighbourLookup.set(Point.toString(1, y), getNeighbouringCells(grid, width, height, new Point(1, y)));
		}
		
		const path = findPath(grid, width, height, neighbourLookup, new Point(1, 0), new Point(1, 3));
		expect(path).toHaveLength(3);
		expect(path).toContainEqual(new Point(1, 1));
		expect(path).toContainEqual(new Point(1, 2));
		expect(path).toContainEqual(new Point(1, 3));
	});
});
