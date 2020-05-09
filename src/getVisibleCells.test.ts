import { getVisibleCells } from "./getVisibleCells";
import { BitGrid } from "codingame-js-starter/src/lib/collections/bit-grid";
import { Point } from "./Point";

describe('getVisibleCells', () => {
	it('should wrap at the top', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		for (let y = 0; y < height; y++) {
			grid.set(1, y, y !== 3);
		}

		const visibleCells = getVisibleCells(grid, width, height, new Point(1, 2));
		expect(visibleCells.size).toEqual(3);
		expect(visibleCells).toContainEqual(new Point(1, 0));
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells).toContainEqual(new Point(1, 4));
	});

	it('should wrap at the bottom', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		for (let y = 0; y < height; y++) {
			grid.set(1, y, y !== 1);
		}

		const visibleCells = getVisibleCells(grid, width, height, new Point(1, 2));
		expect(visibleCells.size).toEqual(3);
		expect(visibleCells).toContainEqual(new Point(1, 0));
		expect(visibleCells).toContainEqual(new Point(1, 3));
		expect(visibleCells).toContainEqual(new Point(1, 4));
	});

	it('should wrap vertically without crashing', () => {
		const width = 3;
		const height = 5;
		const grid = new BitGrid(width, height);
		for (let y = 0; y < height; y++) {
			grid.set(1, y, true);
		}

		const visibleCells = getVisibleCells(grid, width, height, new Point(1, 2));
		expect(visibleCells.size).toEqual(4);
		expect(visibleCells).toContainEqual(new Point(1, 0));
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells).toContainEqual(new Point(1, 3));
		expect(visibleCells).toContainEqual(new Point(1, 4));
	});

	it('should wrap at the left', () => {
		const width = 5;
		const height = 3;
		const grid = new BitGrid(width, height);
		for (let x = 0; x < width; x++) {
			grid.set(x, 1, x !== 3);
		}

		const visibleCells = getVisibleCells(grid, width, height, new Point(2, 1));
		expect(visibleCells.size).toEqual(3);
		expect(visibleCells).toContainEqual(new Point(0, 1));
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells).toContainEqual(new Point(4, 1));
	});

	it('should wrap at the right', () => {
		const width = 5;
		const height = 3;
		const grid = new BitGrid(width, height);
		for (let x = 0; x < width; x++) {
			grid.set(x, 1, x !== 1);
		}

		const visibleCells = getVisibleCells(grid, width, height, new Point(2, 1));
		expect(visibleCells.size).toEqual(3);
		expect(visibleCells).toContainEqual(new Point(0, 1));
		expect(visibleCells).toContainEqual(new Point(3, 1));
		expect(visibleCells).toContainEqual(new Point(4, 1));
	});

	it('should wrap horizontally without crashing', () => {
		const width = 5;
		const height = 3;
		const grid = new BitGrid(width, height);
		for (let x = 0; x < width; x++) {
			grid.set(x, 1, true);
		}

		const visibleCells = getVisibleCells(grid, width, height, new Point(2, 1));
		expect(visibleCells.size).toEqual(4);
		expect(visibleCells).toContainEqual(new Point(0, 1));
		expect(visibleCells).toContainEqual(new Point(1, 1));
		expect(visibleCells).toContainEqual(new Point(3, 1));
		expect(visibleCells).toContainEqual(new Point(4, 1));
	});
});
