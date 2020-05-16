import { getNeighbouringPoints } from './getNeighbouringPoints';
import { getVisiblePoints } from './getVisiblePoints';
import { Graph } from './Graph';
import { Pac } from './Pac';
import { PacType } from './PacType';
import { Pellet } from './Pellet';
import { Point } from './Point';
import { Timer } from './Timer';
import { readInt, readInts, readStrings } from './util';
import { debug } from './util/debug';
import { permute } from './util/permutation';

const CELL_STRING_SEPARATOR = '';
const CELL_WALL_CHAR = '#';
const DEFAULT_PELLET_VALUE = 1;
const MY_ID = '1';
const ENEMY_ID = '0';
const WALL_VALUE = -1;

export class State {
	width: number;
	height: number;

	turn: number;

	myScore: number;
	opponentScore: number;

	myPacs: Map<number, Pac>;
	#myPacPermutations: Pac[][];
	enemyPacs: Map<number, Pac>;
	#allPellets: Map<Point, Pellet>;

	#emptyGraph: Graph<number>;

	#points: Map<string, Point>;

	initFromConsole(): void {
		[this.width, this.height] = readInts();
		const initTimer = new Timer('Grid Initialisation');
		this.#emptyGraph = new Graph(this.width, this.height);
		this.#points = new Map<string, Point>();
		for (let y = 0; y < this.height; y++) {
			const cells = readStrings(CELL_STRING_SEPARATOR);
			for (let [x, cell] of cells.entries()) {
				const isWall = cell === CELL_WALL_CHAR;
				this.#emptyGraph.setByCoord(x, y, isWall ? WALL_VALUE : 0);
				if (!isWall) {
					const point = new Point(x, y);
					this.#points.set(point.toString(), point);
				}
			}
		}
		this.myPacs = new Map<number, Pac>();
		this.enemyPacs = new Map<number, Pac>();
		this.#allPellets = new Map<Point, Pellet>();
		initTimer.stop();
		const visibleCellsTimer = new Timer('Walkable Cells Initialisation');
		for (let point of this.#points.values()) {
			point.neighbours = getNeighbouringPoints(point, this.#emptyGraph, this.#points);
		}
		for (let point of this.#points.values()) {
			point.visiblePoints = getVisiblePoints(point, this.#emptyGraph);
		}
		visibleCellsTimer.stop();
	}

	getEmptyGraph(): Graph<number> {
		return this.#emptyGraph.clone();
	}

	getPoints(): Point[] {
		return [...this.#points.values()];
	}

	private getPoint(x: number, y: number): Point {
		return this.#points.get(Point.toString(x, y));
	}

	getPellets(): Pellet[] {
		return [...this.#allPellets.values()];
	}

	getSuperPellets(): Pellet[] {
		return this.getPellets().filter((pellet) => pellet.value > DEFAULT_PELLET_VALUE);
	}

	getPellet(point: Point): Pellet {
		return this.#allPellets.get(point);
	}

	getMyPacs(): Pac[] {
		return [...this.myPacs.values()];
	}

	getEnemyPacs(): Pac[] {
		return [...this.enemyPacs.values()];
	}

	getAllPacs(): Pac[] {
		return this.getMyPacs().concat(this.getEnemyPacs());
	}

	private pointIsWalkable(x: number, y: number): boolean {
		return this.#emptyGraph.getByCoord(x, y) !== WALL_VALUE;
	}

	private getMyVisiblePoints(): Point[] {
		const uniqueVisiblePoints = new Set<Point>();
		for (const pac of this.getMyPacs()) {
			uniqueVisiblePoints.add(pac.location);
			const visiblePoints = pac.location.visiblePoints;
			for (const point of visiblePoints) {
				uniqueVisiblePoints.add(point);
			}
		}
		return [...uniqueVisiblePoints.values()];
	}

	public initFirstTurnFromConsole(): void {
		const timer = new Timer('First Turn Setup');
		this.turn = 1;
		this.initAllPacs();
		this.initAllPellets();
		this.initVisiblePellets();
		this.setPermutationOrder(Array.from(permute(this.getMyPacs())));
		timer.stop();
	}

	private initAllPacs(): void {
		const visiblePacCount = readInt();
		for (let i = 0; i < visiblePacCount; i++) {
			const inputs = readStrings();
			const pacId = parseInt(inputs[0]);
			const isMyPac = inputs[1] === MY_ID;
			const location = this.getPoint(parseInt(inputs[2]), parseInt(inputs[3]));
			let pac = new Pac();
			(isMyPac ? this.myPacs : this.enemyPacs).set(pacId, pac);
			pac.update(inputs, location);
			if (isMyPac) {
				const enemyPac = new Pac();
				inputs[1] = ENEMY_ID;
				inputs[2] = (this.width - parseInt(inputs[2]) - 1).toString();
				debug(`Created enemy pac ${inputs[0]} at position ${inputs[2]} ${inputs[3]}`)
				enemyPac.update(inputs, location);
				this.enemyPacs.set(pacId, enemyPac);
			}
		}
	}

	private initAllPellets(): void {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const point = this.getPoint(x, y);
				if (this.pointIsWalkable(x, y) && !this.getAllPacs().some((pac) => pac.location.equals(point))) {
					const pellet = new Pellet();
					pellet.update(point, DEFAULT_PELLET_VALUE);
					this.#allPellets.set(point, pellet);
				}
			}
		}
	}

	private initVisiblePellets(): void {
		const visiblePelletCount = readInt();
		for (let i = 0; i < visiblePelletCount; i++) {
			const inputs = readInts();
			if (inputs[2] > DEFAULT_PELLET_VALUE) {
				const point = this.getPoint(inputs[0], inputs[1]);
				const pellet = this.getPellet(point);
				pellet.update(point, inputs[2]);
			}
		}
	}

	public updateFromConsole(): void {
		const timer = new Timer('Inputs Update');
		this.turn++;
		this.updateVisiblePacs();
		this.updateVisiblePellets();
		this.deleteMyDeadPacs();
		const visiblePoints = this.getMyVisiblePoints();
		if (this.turn > 2) {
			// At the start of turn 2 all enemy pacs we can't see will have age === 1 but they may have used an ability so we can't be certain they moved
			this.tryUpdateInvisiblePacs(visiblePoints); // This runs first as it is looking at the enemy's data from last turn
			this.decrementInvisiblePacsCooldowns();
		}
		this.deleteEatenPellets(visiblePoints);
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
			const location = this.getPoint(parseInt(inputs[2]), parseInt(inputs[3]));
			const pac = isMyPac ? this.myPacs.get(pacId) : this.enemyPacs.get(pacId);
			if (isDead) {
				if (pac) {
					isMyPac ? this.myPacs.delete(pacId) : this.enemyPacs.delete(pacId);
					this.setPermutationOrder(Array.from(permute(this.getMyPacs())));
				}
			} else {
				pac.update(inputs, location);
			}
		}
	}

	private updateVisiblePellets(): void {
		const visiblePelletCount = readInt();
		for (let i = 0; i < visiblePelletCount; i++) {
			const inputs = readInts();
			const point = this.getPoint(inputs[0], inputs[1]);
			const pellet = this.getPellet(point);
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

	// If we could see an enemy last turn but not this turn and there is only one place they could have gone then update their position internally
	// - This needs a bit of work as there are cases where the enemy wouldn't have moved
	private tryUpdateInvisiblePacs(visiblePoints: Point[]) {
		for (const enemy of this.getEnemyPacs().filter((enemy) => enemy.age === 1)) {
			let possiblePositions = enemy.location.neighbours;
			if (enemy.speedTurnsLeft > 0) {
				for (const position of possiblePositions) {
					possiblePositions = possiblePositions.concat(position.neighbours)
				}
			}

			const possiblePointsWeCantSee = possiblePositions.filter((position) => !visiblePoints.includes(position));
			if (possiblePositions.length === 1) {
				printErr(`Enemy ${enemy.id} could only have gone to ${possiblePointsWeCantSee[0]}... updating`);
				enemy.location = possiblePointsWeCantSee[0];
			}
		}
	}

	private decrementInvisiblePacsCooldowns() {
		for (const enemy of this.getEnemyPacs().filter((enemy) => enemy.age > 0 && enemy.abilityCooldown > 0)) {
			enemy.abilityCooldown = Math.max(0, enemy.abilityCooldown - 1);
			enemy.speedTurnsLeft = Math.max(0, enemy.speedTurnsLeft - 1);
		}
	}

	private deleteEatenPellets(visiblePoints: Point[]) {
		for (const point of visiblePoints) {
			const pellet = this.getPellet(point);
			if (pellet && pellet.age > 0) {
				// debug(`Deleting pellet ${visibleCell}`);
				this.#allPellets.delete(point);
			}
		}
		for (const pellet of this.getSuperPellets()) {
			if (pellet.age > 0) {
				debug(`Deleting super pellet ${pellet.location}`);
				this.#allPellets.delete(pellet.location);
			}
		}
	}

	age(): void {
		for (const pac of this.getAllPacs()) {
			pac.increaseAge();
		}
		for (const pellet of this.getPellets()) {
			pellet.increaseAge();
		}
	}

	public getPermutationOrder(): Pac[][] {
		return this.#myPacPermutations;
	}

	public setPermutationOrder(pacs: Pac[][]): void {
		this.#myPacPermutations = pacs;
	}
}