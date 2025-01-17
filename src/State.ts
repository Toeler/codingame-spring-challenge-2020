import { BitGrid } from '../node_modules/codingame-js-starter/src/lib/collections/bit-grid';
import { readInt, readInts, readStrings } from './util';
import { Point } from './Point';
import { getVisibleCells } from './getVisibleCells';
import { Pac } from './Pac';
import { Pellet } from './Pellet';
import { Timer } from './Timer';
import { getNeighbouringCells } from './getNeighbouringCells';
import { debug } from './util/debug';
import { PacType } from './PacType';

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

	turn: number;

	myScore: number;
	opponentScore: number;

	myPacs: Map<number, Pac>;
	enemyPacs: Map<number, Pac>;
	allPellets: Map<string, Pellet>;

	gridMatrix: number[][];
	influenceMatrix: number[][];

	initFromConsole(): void {
		[this.width, this.height] = readInts();
		const initTimer = new Timer('Grid Initialisation');
		this.grid = new BitGrid(this.width, this.height);
		this.gridMatrix = [];
		this.influenceMatrix = [];
		for (let y = 0; y < this.height; y++) {
			const cells = readStrings(CELL_STRING_SEPARATOR);
			this.gridMatrix[y] = [];
			this.influenceMatrix[y] = [];
			for (let [x, cell] of cells.entries()) {
				this.grid.set(x, y, cell === CELL_FLOOR_CHAR);
				this.gridMatrix[y][x] = (cell === CELL_FLOOR_CHAR) ? 0 : -1;
				this.influenceMatrix[y][x] = (cell === CELL_FLOOR_CHAR) ? 1 : -1;
			}
		}
		this.myPacs = new Map<number, Pac>();
		this.enemyPacs = new Map<number, Pac>();
		this.allPellets = new Map<string, Pellet>();
		initTimer.stop();
		const visibleCellsTimer = new Timer('Walkable Cells Initialisation');
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

	getGridMatrix(): number[][] {
		return JSON.parse(JSON.stringify(this.gridMatrix));
	}

	getInflueceMatrix(): number[][] {
		return JSON.parse(JSON.stringify(this.influenceMatrix));
	}

	initFirstTurnFromConsole(): void {
		const timer = new Timer('First Turn Setup');
		this.turn = 1;
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
		timer.stop();
	}

	updateFromConsole(): void {
		const timer = new Timer('Inputs Update');
		this.turn++;
		this.updateVisiblePacs();
		this.updateVisiblePellets();
		this.deleteMyDeadPacs();
		this.deleteEnemyDeadPacs();
		const pacLocations = [...this.myPacs.values()].map((pac) => pac.location.toString());
		const visibleCellSets = pacLocations.map((pacLocation) => this.visibleCells.get(pacLocation));
		const visibleCells = new Set(pacLocations.concat(visibleCellSets.reduce((arr, set) => [...arr, ...[...set.values()].map((point) => point.toString())], [] as string[])));
		//this.tryUpdateInvisiblePacs(visibleCells);
		this.updatePelletsFromEnemyLocation();
		this.deleteEatenPellets(visibleCells);
		timer.stop();
	}

	public updateScores(): void {
		[this.myScore, this.opponentScore] = readInts();
	}

	private updateVisiblePacs(): void {
		const visiblePacCount = readInt();
		for (let i = 0; i < visiblePacCount; i++) {
			const inputs = readStrings();
			const pacId = parseInt(inputs[0]);
			const isMyPac = inputs[1] === MY_ID;
			const isDead = inputs[4] as PacType === PacType.DEAD;
			const pac = isMyPac ? this.myPacs.get(pacId) : this.enemyPacs.get(pacId);
			if (isDead) {
				if (pac) {
					isMyPac ? this.myPacs.delete(pacId) : this.enemyPacs.delete(pacId)
				}
			} else {
				pac.update(inputs);
			}
		}
	}

	private updateVisiblePellets(): void {
		const visiblePelletCount = readInt();
		for (let i = 0; i < visiblePelletCount; i++) {
			const inputs = readInts();
			const point = new Point(inputs[0], inputs[1]);
			const pellet = this.allPellets.get(point.toString());
			if (!pellet) {
				printErr(`No pellet at ${point}`);
			}
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

	private tryUpdateInvisiblePacs(visibleCells: Set<string>) {
		for (let enemy of [...this.enemyPacs.values()].filter((enemy) => enemy.age === 1)) {
			let possibleNeighbours = [...this.neighbouringCells.get(enemy.location.toString()).values()];
			if (enemy.speedTurnsLeft > 0) {
				possibleNeighbours = [...possibleNeighbours, ...possibleNeighbours.reduce((neighbourNeighbours, neighbour) => [...neighbourNeighbours, ...this.neighbouringCells.get(neighbour.toString()).values()], [] as Point[])];
			}
			const possibleCellsWeCantSee = possibleNeighbours.filter((neighbour) => !visibleCells.has(neighbour.toString()));
			if (possibleCellsWeCantSee.length === 1) {
				// TODO: Handle first turn
				printErr(`Enemy ${enemy.id} could only have gone to ${possibleCellsWeCantSee[0]}... updating`);
				enemy.location = possibleCellsWeCantSee[0];
				enemy.speedTurnsLeft = Math.max(0, enemy.speedTurnsLeft - 1); // TODO: Extract this out and re-calc everyone
			}
		}
	}

	public updatePelletsFromEnemyLocation() {
		for (let enemy of this.enemyPacs.values()) {
			if (enemy.age === 0 && enemy.previousAge > 1) {
				// We know their current position and last position, time to calculate a path
				const turnsMissing = enemy.previousAge - enemy.age;
				if (turnsMissing <= 10) {
					let maxSpacesTravelled = turnsMissing;
					if (enemy.speedTurnsLeft) {
						if (!enemy.previousSpeedTurnsLeft) {
							maxSpacesTravelled += ((5 - enemy.speedTurnsLeft) - 1);
						} else {
							if (turnsMissing > 5) {
								maxSpacesTravelled += enemy.previousSpeedTurnsLeft - (4-enemy.speedTurnsLeft);
							} else {
								maxSpacesTravelled += (enemy.previousSpeedTurnsLeft - enemy.speedTurnsLeft);
							}
						}
					} else if (enemy.previousSpeedTurnsLeft) {
						maxSpacesTravelled += enemy.previousSpeedTurnsLeft;
					} else if (enemy.abilityCooldown && !enemy.previousAbilityCooldown && enemy.typeId === enemy.previousTypeId) {
						maxSpacesTravelled += 4;
					}

					debug(`Haven't seen ${enemy.id} in ${turnsMissing} turns. Could have travelled ${maxSpacesTravelled} spaces. Calculating path.`);
					let possiblePaths: Point[][] = [[enemy.previousLocation]];

					for (let turn = 0; turn < maxSpacesTravelled; turn++) {
						const newPaths: Point[][] = [];
						for (const path of possiblePaths) {
							const neighbours = [...this.neighbouringCells.get(path[path.length - 1].toString()).values()].filter((n) => !path.some((x) => x.equals(n)));
							let idx = 1;
							for (const neighbour of neighbours) {
								if (idx === neighbours.length) {
									path.push(neighbour);
								} else {
									newPaths.push([...path, neighbour]);
								}
								idx++;
							}
						}
						possiblePaths = possiblePaths.concat(newPaths);
					}

					const enemyPaths = possiblePaths.filter((path) => path[path.length - 1].equals(enemy.location));
					debug(`Enemy ${enemy.id} could have taken ${enemyPaths.length} paths from ${enemy.previousLocation.toString()} to ${enemy.location.toString()}`);

					const allPoints: object = {};
					for (const path of enemyPaths) {
						for (const point of path) {
							allPoints[point.toString()] = (allPoints[point.toString()] || 0) + 1;
						}
					}

					const commonPoints: string[] = [];
					for (const point in allPoints) {
						if (allPoints[point] === enemyPaths.length) {
							commonPoints.push(point);
						}
					}

					debug(`Found ${commonPoints.length} common points in all paths, deleting pellets: ${commonPoints.join('|')}`);
					for (const point of commonPoints) {
						this.allPellets.delete(point);
					}
				}
			}
		}
	}

	private deleteEatenPellets(visibleCells: Set<string>) {
		for (let visibleCell of visibleCells) {
			const pellet = this.allPellets.get(visibleCell);
			if (pellet && pellet.age > 0) {
				// debug(`Deleting pellet ${visibleCell}`);
				this.allPellets.delete(visibleCell);
			}
		}
		for (let pellet of this.allPellets.values()) {
			if (pellet.value > DEFAULT_PELLET_VALUE && pellet.age > 1) {
				this.allPellets.delete(pellet.location.toString());
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