import { BitGrid } from '../node_modules/codingame-js-starter/src/lib/collections/bit-grid';
import { readInt, readInts, readStrings } from './util';
import { Point } from './Point';
import { getVisibleCells } from './getVisibleCells';
import { Pac } from './Pac';
import { Pellet } from './Pellet';
import { Timer } from './Timer';
import { getNeighbouringCells } from './getNeighbouringCells';
import { debug } from './util/debug';

const CELL_STRING_SEPARATOR = '';
const CELL_FLOOR_CHAR = ' ';
const DEFAULT_PELLET_VALUE = 1;
const MY_ID = '1';
const ENEMY_ID = '0';

export class State {
	width: number;
	height: number;
	grid: BitGrid;
	visibleCells: Map<string, Set<Point>>;
	neighbouringCells: Map<string, Set<Point>>;

	myScore: number;
	opponentScore: number;

	myPacs: Map<number, Pac>;
	enemyPacs: Map<number, Pac>;
	allPellets: Map<string, Pellet>;

	initFromConsole(): void {
		const initTimer = new Timer('Grid Initialisation').start();
		[this.width, this.height] = readInts();
		this.grid = new BitGrid(this.width, this.height);
		for (let y = 0; y < this.height; y++) {
			const cells = readStrings(CELL_STRING_SEPARATOR);
			for (let [x, cell] of cells.entries()) {
				this.grid.set(x, y, cell === CELL_FLOOR_CHAR);
			}
		}
		this.myPacs = new Map<number, Pac>();
		this.enemyPacs = new Map<number, Pac>();
		this.allPellets = new Map<string, Pellet>();
		initTimer.stop();
		const visibleCellsTimer = new Timer('Walkable Cells Initialisation').start();
		this.visibleCells = new Map<string, Set<Point>>();
		this.neighbouringCells = new Map<string, Set<Point>>();
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.grid.get(x, y)) { // isWalkable
					const point = new Point(x, y);
					this.visibleCells.set(point.toString(), getVisibleCells(this.grid, this.width, this.height, point));
					this.neighbouringCells.set(point.toString(), getNeighbouringCells(this.grid, this.width, this.height, point));
				}
			}
		}
		visibleCellsTimer.stop();
	}

	cellIsWalkable(x: number, y: number): boolean {
		return this.grid.get(x, y);
	}

	initFirstTurnFromConsole(): void {
		[this.myScore, this.opponentScore] = readInts();

		const visiblePacCount = readInt();
		for (let i = 0; i < visiblePacCount; i++) {
			const inputs = readStrings();
			const pacId = parseInt(inputs[0]);
			const isMyPac = inputs[1] === MY_ID;
			let pac = new Pac();
			(isMyPac ? this.myPacs : this.enemyPacs).set(pacId, pac);
			pac.update(inputs);
			if (isMyPac) {
				const enemyPac = new Pac();
				inputs[1] = ENEMY_ID;
				inputs[2] = (this.width - parseInt(inputs[2]) - 1).toString();
				debug(`Created enemy pac ${inputs[0]} at position ${inputs[2]} ${inputs[3]}`)
				enemyPac.update(inputs);
				this.enemyPacs.set(pacId, enemyPac);
			}
		}

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const point = new Point(x, y);
				if (this.cellIsWalkable(x, y) && ![...this.myPacs.values(), ...this.enemyPacs.values()].some((pac) => pac.location.equals(point))) {
					const pellet = new Pellet();
					pellet.update(point, DEFAULT_PELLET_VALUE);
					this.allPellets.set(point.toString(), pellet);
				}
			}
		}

		const visiblePelletCount = readInt();
		for (let i = 0; i < visiblePelletCount; i++) {
			const inputs = readInts();
			if (inputs[2] > DEFAULT_PELLET_VALUE) {
				const point = new Point(inputs[0], inputs[1]);
				const pellet = this.allPellets.get(point.toString());
				pellet.update(point, inputs[2]);
			}
		}
	}

	updateFromConsole(): void {
		this.updateScores();
		this.updateVisiblePacs();
		this.updateVisiblePellets();
		this.deleteMyDeadPacs();
		this.deleteEnemyDeadPacs();
		this.deleteEatenPellets();
	}

	private updateScores(): void {
		[this.myScore, this.opponentScore] = readInts();
	}

	private updateVisiblePacs(): void {
		const visiblePacCount = readInt();
		for (let i = 0; i < visiblePacCount; i++) {
			const inputs = readStrings();
			const pacId = parseInt(inputs[0]);
			const isMyPac = inputs[1] === MY_ID;
			const pac = isMyPac ? this.myPacs.get(pacId) : this.enemyPacs.get(pacId);
			pac.update(inputs);
		}
	}

	private updateVisiblePellets(): void {
		const visiblePelletCount = readInt();
		for (let i = 0; i < visiblePelletCount; i++) {
			const inputs = readInts();
			const point = new Point(inputs[0], inputs[1]);
			const pellet = this.allPellets.get(point.toString());
			pellet.update(point, inputs[2]);
		}
	}

	private deleteMyDeadPacs() {
		for (let pac of this.myPacs.values()) {
			if (pac.age > 0) {
				debug(`Deleted dead pac ${pac.id}`);
				this.myPacs.delete(pac.id);
			}
		}
	}

	private deleteEnemyDeadPacs() {
		// TODO
	}

	private deleteEatenPellets() {
		const pacLocations = [...this.myPacs.values()].map((pac) => pac.location.toString());
		const visibleCellSets = pacLocations.map((pacLocation) => this.visibleCells.get(pacLocation));
		const visibleCells = new Set(pacLocations.concat(visibleCellSets.reduce((arr, set) => [...arr, ...[...set.values()].map((point) => point.toString())], [] as string[])));
		for (let visibleCell of visibleCells) {
			const pellet = this.allPellets.get(visibleCell);
			if (pellet && pellet.age > 0) {
				debug(`Deleting pellet ${visibleCell}`);
				this.allPellets.delete(visibleCell);
			}
		}
	}

	age(): void {
		this.myPacs.forEach(pac => pac.increaseAge());
		this.enemyPacs.forEach(pac => pac.increaseAge());
		this.allPellets.forEach(pellet => pellet.increaseAge());
	}

	clone(): State {
		// TODO
		return this;
	}
}