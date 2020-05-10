import { getNeighbouringCells } from "./getNeighbouringCells";
import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "./Point";

describe('getNeighbouringCells', () => {
	it('should wrap at the top when open', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		for (let y = 0; y < height; y++) {
			grid.set(1, y, true);
		}

		const visibleCells = getNeighbouringCells(grid, width, height, new Point(1, 0));
		expect(visibleCells.size).toEqual(2);
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells).toContainEqual(new Point(1, 4));
	});

	it('should wrap at the bottom', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		for (let y = 0; y < height; y++) {
			grid.set(1, y, true);
		}

		const visibleCells = getNeighbouringCells(grid, width, height, new Point(1, 4));
		expect(visibleCells.size).toEqual(2);
		expect(visibleCells).toContainEqual(new Point(1, 0));
		expect(visibleCells).toContainEqual(new Point(1, 3));
	});

	it('should wrap at the left', () => {
		const width = 5;
		const height = 3;
		const grid = new BitGrid(width, height);
		for (let x = 0; x < width; x++) {
			grid.set(x, 1, true);
		}

		const visibleCells = getNeighbouringCells(grid, width, height, new Point(0, 1));
		expect(visibleCells.size).toEqual(2);
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells).toContainEqual(new Point(4, 1));
	});

	it('should wrap at the right', () => {
		const width = 5;
		const height = 3;
		const grid = new BitGrid(width, height);
		for (let x = 0; x < width; x++) {
			grid.set(x, 1, true);
		}

		const visibleCells = getNeighbouringCells(grid, width, height, new Point(4, 1));
		expect(visibleCells.size).toEqual(2);
		expect(visibleCells).toContainEqual(new Point(0, 1));
		expect(visibleCells).toContainEqual(new Point(3, 1));
	});

	it('should wrap at the top when closed', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		for (let y = 0; y < height; y++) {
			grid.set(1, y, y !== (height - 1));
		}

		const visibleCells = getNeighbouringCells(grid, width, height, new Point(1, 0));
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells.size).toEqual(1);
	});
});
