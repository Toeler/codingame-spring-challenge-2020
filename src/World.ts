import { Entity } from "./Entity";
import { readInts, readStrings, readStringLine } from "./util";
import { Wall } from "./Wall";
import { Floor } from "./Floor";

export class World {
	width: number;
	height: number;
	map: (Wall | Floor)[][];

	initFromConsole(): void {
		[this.width, this.height] = readInts();
		this.map = [];
		for (let y = 0; y < this.height; y++) {
			const cells = readStringLine(); // one line of the grid: space " " is floor, pound "#" is wall
			this.map[y] = cells.map((char) => {
				switch (char) {
					case '#': {
						return new Wall();
					}
					case ' ': {
						return new Floor();
					}
					default: {
						printErr(`Unknown world object ${char}`);
						return new Wall();
					}
				}
			});
		}
	}
}