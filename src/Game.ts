import { State } from "./State";
import { Action } from "./Action";
import { Pellet } from "./Pellet";
import { Point } from "./Point";
import { wrap } from "./util/wrap";
import { Timer } from "./Timer";
import { Pac } from "./Pac";
import { PacType } from "./PacType";

const ENEMY_INFLUENCE_RADIUS = 3.0;
const MAX_ENEMY_AGE_INFLUENCE = 10;
const FRIENDLY_PAC_INFLUENCE_RANGE = 7;
const FRIENDLY_PAC_MULTIPLIER = 0.8;
const ENEMY_PAC_INFLUENCE_RANGE = 4;
const ENEMY_PAC_MULTIPLIER = 0.8;

function getPelletsInRange(center: Point, pellets: Map<string, Pellet>, mapWidth: number, mapHeight: number, distance: number): Pellet[] {
	const result: Pellet[] = [];
	for (let x = wrap(center.x - distance, mapWidth); x !== wrap(center.x + distance, mapWidth); x = wrap(x + 1, mapWidth)) {
		for (let y = wrap(center.y - distance, mapHeight); y !== wrap(center.y + distance, mapHeight); y = wrap(y + 1, mapHeight)) {
			const pellet = pellets.get(new Point(x, y).toString());
			if (pellet) {
				result.push(pellet);
			}
		}
	}
	return result;
}

function getPelletScoreMatrix(emptyMatrix: number[][], allPellets: Map<string, Pellet>, neighbouringCells: Map<string, Set<Point>>, gridWidth: number, gridHeight: number): number[][] {
	const matrix: number[][] = emptyMatrix;
	for (let y = 0; y < gridHeight; y++) {
		for (let x = 0; x < gridWidth; x++) {
			if (matrix[y][x] !== -1) {
				const pellet = allPellets.get(Point.toString(x, y));
				matrix[y][x] = pellet ? pellet.getValue(neighbouringCells.get(pellet.location.toString()).size === 1) : 0;
			}
		}
	}
	return matrix;
}

function getPacInfluenceMatrix(pac: Pac, state: State, influenceRange: number, multiplier: number, offset: number = 0): number[][] {
	const matrix = state.getInflueceMatrix();

	let neighbours = [pac.location];
	let seen = [pac.location.toString()];
	matrix[pac.location.y][pac.location.x] = 1-multiplier;
	const otherPacLocations = [...state.myPacs.values()].filter((otherPac) => otherPac.id !== pac.id).concat([...state.enemyPacs.values()]).map((otherPac) => otherPac.location.toString());
	for (let i = 1; i <= influenceRange; i++) {
		neighbours = neighbours.reduce((newNeighbours, neighbour) => {
			const neighbourNeighbours = [...state.neighbouringCells.get(neighbour.toString())];
			return [...newNeighbours, ...neighbourNeighbours.filter((n) => !seen.includes(n.toString()) && !otherPacLocations.includes(n.toString()))];
		}, [] as Point[]);

		const influenceValue = 1-Math.pow(multiplier, i+1) + offset;
		for (const neighbour of neighbours) {
			matrix[neighbour.y][neighbour.x] = influenceValue;
			seen.push(neighbour.toString());
		}
	}
	return matrix;
}

function getPacScoreMatrix(pac: Pac, state: State, matrix: number[][], pelletScoreMatrix: number[][], pacInfluenceMatrices: number[][][], currentDepth: number, maxDepth: number, checkedPoints: Set<string>, nextPointsToCheck: Point[]): void {
	if (currentDepth >= maxDepth || !nextPointsToCheck.length) {
		return;
	}

	const neighbours = nextPointsToCheck.map((point) => {
		const pointNeighbours = state.neighbouringCells.get(point.toString());
		return [...pointNeighbours.values()].filter((cell) => !checkedPoints.has(cell.toString()));
	}).reduce((flattened, neighbourNeighbours) => [...flattened, ...neighbourNeighbours.filter((neighbour) => flattened.every((n) => !neighbour.equals(n)))], [] as Point[]);

	getPacScoreMatrix(pac, state, matrix, pelletScoreMatrix, pacInfluenceMatrices, currentDepth + 1, maxDepth, new Set([...checkedPoints.values(), ...nextPointsToCheck.map((point) => point.toString())]), neighbours);

	if (currentDepth !== 0) {
		// const enemyPacs = [...state.enemyPacs.values()];
		for (const point of nextPointsToCheck) {
			const neighbours = [...state.neighbouringCells.get(point.toString()).values()].filter((cell) => !checkedPoints.has(cell.toString()));
			const neighbourSum = neighbours.reduce((sum, neighbour) => sum + matrix[neighbour.y][neighbour.x], 0) || 0;
			const distanceMultiplier = Math.pow(0.9, currentDepth);
			// const enemyInfluenceMultiplier = enemyPacs.reduce((multiplier, enemy) => {
			// 	const enemyDistanceToPellet = point.distanceTo(enemy.location);
			// 	let distanceModifier: number;
			// 	if (enemyDistanceToPellet > 3) {
			// 		distanceModifier = 1.0;
			// 	} else {
			// 		distanceModifier = Math.max(0.2, (0.360674 * Math.log(enemyDistanceToPellet)) + 0.2);
			// 		const ageModifier = (1-(Math.min(MAX_ENEMY_AGE_INFLUENCE, enemy.age)/MAX_ENEMY_AGE_INFLUENCE));
			// 		distanceModifier = 1 - ((1 - distanceModifier) * ageModifier);
			// 		// TODO: Type that beats us should have more influence. Type that we beat should have less.
			// 	}
			// 	return multiplier *= distanceModifier;
			// }, 1.0);
			let pelletValueForPac = pelletScoreMatrix[point.y][point.x] * distanceMultiplier;// * enemyInfluenceMultiplier;
			matrix[point.y][point.x] = (pelletValueForPac + (neighbourSum / (neighbours.length || 1)));
			for (let influenceMatrix of pacInfluenceMatrices) {
				// TODO: Don't include influence if they are behind us
				// TODO: This can make a Pac get stuck in a corridor as it approaches a friendly pac
				matrix[point.y][point.x] = matrix[point.y][point.x] *= influenceMatrix[point.y][point.x];
			}
		}
	} else {
		matrix[nextPointsToCheck[0].y][nextPointsToCheck[0].x] = -2;
	}
}

export class Game {
	public getActions(state: State): Action[] {
		const timer = new Timer(`getActions`);

		const pelletMatrix = getPelletScoreMatrix(state.getGridMatrix(), state.allPellets, state.neighbouringCells, state.width, state.height);
		const myPacInfluenceMatrices: Map<number, number[][]> = new Map();
		const enemyPacInfluenceMatrices: Map<Pac, number[][]> = new Map();
		for (const pac of state.myPacs.values()) {
			myPacInfluenceMatrices.set(pac.id, getPacInfluenceMatrix(pac, state, FRIENDLY_PAC_INFLUENCE_RANGE, FRIENDLY_PAC_MULTIPLIER));
		}
		for (const enemy of state.enemyPacs.values()) {
			enemyPacInfluenceMatrices.set(enemy, getPacInfluenceMatrix(enemy, state, ENEMY_PAC_INFLUENCE_RANGE, ENEMY_PAC_MULTIPLIER, -0.2));
		}

		const enemyPacs = [...state.enemyPacs.values()];
		const pacMatrices: { id: number, matrix: number[][]}[] = [];
		const actions: Action[] = [];
		for (let pac of state.myPacs.values()) {
			const pacTimer = new Timer(`Pac ${pac.id} turn`);

			let neighbours: Point[] = [...state.neighbouringCells.get(pac.location.toString()).values()];
			let nearbyEnemies: Pac[] = enemyPacs.filter((enemy) => enemy.age < 2 && neighbours.some((point) => point.equals(enemy.location) || [...state.neighbouringCells.get(point.toString())].some((point2) => point2.equals(enemy.location))));
			if (pac.abilityCooldown === 0) {
				if (nearbyEnemies.length) {
					// TODO: handle more than 1 nearby enemy
					printErr(`${nearbyEnemies.length} nearby enemies`);
					const enemy = nearbyEnemies[0];
					switch (enemy.typeId) {
						case PacType.getLoseTo(pac.typeId): {
							actions.push(pac.switchType(PacType.getLoseTo(enemy.typeId)));
							break;
						}
						case pac.typeId: {
							// if (enemy.abilityCooldown > 1) {
							// 	actions.push(pac.switchType(PacType.getLoseTo(enemy.typeId)));
							// }
							actions.push(pac.startSpeed());
							break;
						}
						default: { // We win
							actions.push(pac.startSpeed());
							// if (enemy.speedTurnsLeft === 0 && enemy.abilityCooldown > 0) {
							// 	printErr(`Eat enemy ${enemy.id}`);
							// 	actions.push(pac.moveTo(enemy.location));
							// } else {
							// }
						}
					}
				} else {
					actions.push(pac.startSpeed());
				}
			} else {
				if (pac.speedTurnsLeft > 0 && nearbyEnemies.length) {
					const enemy = nearbyEnemies[0];
					if (enemy.speedTurnsLeft === 0 && enemy.abilityCooldown > 1 && PacType.getLoseTo(enemy.typeId) === pac.typeId) {
						actions.push(pac.moveTo(enemy.location));
						continue;
					}
				}

				const pacMatrix: number[][] = state.getGridMatrix();
				const pelletMatrixForPac: number[][] = JSON.parse(JSON.stringify(pelletMatrix));
				const NUMBER_TURNS_TO_CONSIDER = 30;
				const checkedCells = new Set<string>();
				// TODO: Treat different enemy types differently
				const otherPacInfluence = [...myPacInfluenceMatrices].filter(([pacId]) => pacId !== pac.id).map(([_, matrix]) => matrix).concat([...enemyPacInfluenceMatrices.keys()].filter((enemy) => PacType.getLoseTo(pac.typeId) === enemy.typeId).map((enemy) => enemyPacInfluenceMatrices.get(enemy)));
				// const pacScoreTimer = new Timer(`Pac ${pac.id} Score Matrix`);
				if (pac.speedTurnsLeft > 0) {
					// We're moving 2 spaces
					// TODO: Move this up out of the else so we can attack 2 spaces
					neighbours = neighbours.map((neighbour) => {
						// TODO: This needs improvement, it just doesn't even consider the space where an enemy is
						const nextNeighbours = [...state.neighbouringCells.get(neighbour.toString())].filter((nextNeighbour) => !nextNeighbour.equals(pac.location) && enemyPacs.every((enemy) => !nextNeighbour.equals(enemy.location)));
						if (nextNeighbours.length === 0) {
							// Dead-end, so include this single-step move
							return [neighbour];
						}
						for (const nextNeighbour of nextNeighbours) {
							// If we are movng through a point to another, then the second point should include the value of the one we pass through
							pelletMatrixForPac[nextNeighbour.y][nextNeighbour.x] += pelletMatrixForPac[neighbour.y][neighbour.x];
							//pacMatrix[nextNeighbour.y][nextNeighbour.x] += pacMatrix[neighbour.y][neighbour.x];
						}
						return nextNeighbours;
					}).reduce((allNeighbours, neighbour) => [...allNeighbours, ...neighbour.values()], [] as Point[]);
				}
				if (pac.id === 1 && state.turn > 0 && state.turn < 3) {
					// printErr(JSON.stringify(pelletMatrixForPac.map((row) => row.map((cell) => cell.toFixed(0)))));
				}
				getPacScoreMatrix(pac, state, pacMatrix, pelletMatrixForPac, otherPacInfluence, 0, NUMBER_TURNS_TO_CONSIDER, checkedCells, [pac.location]);
				// pacScoreTimer.stop();
				pacMatrices.push({ id: pac.id, matrix: pacMatrix });

				let highestValueDirection: Point;
				let action: Action = pac.moveTo(pac.location);
				
				// const pacDirectionTimer = new Timer(`Pac ${pac.id} Direction Selection`);
				for (let neighbour of neighbours) {
					// const cellsToCheckForEnemy: Point[] = [neighbour];
					// if (neighbour.distanceTo(pac.location) === 2) {
					// 	// Need to check the space between us
					// 	const between = [...state.neighbouringCells.get(neighbour.toString()).values()].filter((x) => x.distanceTo(pac.location) === 1);
					// 	if (between[0]) {
					// 		cellsToCheckForEnemy.push(between[0]);
					// 	}
					// }
					// let couldDieToEnemy = false;
					// for (const enemy of state.enemyPacs.values()) {
					// 	if (enemy.abilityCooldown === 0 && cellsToCheckForEnemy.some((x) => x.equals(enemy.location))) {
					// 		couldDieToEnemy = true;
					// 	}
					// }
					// if (couldDieToEnemy) {
					// 	continue;
					// }

					const neighbourValue = pacMatrix[neighbour.y][neighbour.x];
					if (!highestValueDirection || neighbourValue > pacMatrix[highestValueDirection.y][highestValueDirection.x]) {
						// TODO: Handle crossing paths with our own pac. This only checks moving 1 tile at a time
						const newAction = pac.moveTo(neighbour);
						if (actions.every((otherPacAction) => !newAction.equalTo(otherPacAction))) {
							highestValueDirection = neighbour;
							action = newAction;
						}
					}
				}
				if (pac.id === 0) {
					// printErr(pelletMatrixForPac.filter((_, rowNum) => rowNum > 1 && rowNum < 7 ).map((row, rowNum) => row.filter((_, colNum) => colNum > 21 && colNum < 29).map((col, colNum) => `${colNum + 22}, ${rowNum + 2} = ${col}`).join('\n')).join('\n'));
				}
				// pacDirectionTimer.stop();
				actions.push(action);
			}
			pacTimer.stop();
		}
		timer.stop();

		// debug(`Pellet Value Graph: ${Buffer.from(JSON.stringify(pelletMatrix)).toString('base64')}`);
		for (const matrix of pacMatrices) {
			if (matrix.id !== 1 || state.turn < 42) {
				continue;
			}
			// const pac2 = state.myPacs.get(2);
			// if (pac2.location.x !== 13 && pac2.location.y !== 9 && pac2.location.y !== 10) {
			// 	continue;
			// }
			// printErr(`Pellet Value Graph: ${Buffer.from(JSON.stringify(pelletMatrix)).toString('base64')}`);
			// printErr(`Pellet Value Graph: ${JSON.stringify(pelletMatrix.map((row) => row.map((cell) => cell.toFixed(0))))}`);
			printErr(`Pac ${matrix.id} Value Graph: ${Buffer.from(JSON.stringify(matrix.matrix.map((row) => row.map((cell) => cell.toFixed(0))))).toString('base64')}`);
			// printErr(`Pac Influence Graph: ${Buffer.from(JSON.stringify(myPacInfluenceMatrices.get(1).map((row) => row.map((cell) => cell)))).toString('base64')}`);
			// printErr(`Pac Influence Graph: ${Buffer.from(JSON.stringify(enemyPacInfluenceMatrices.get(state.enemyPacs.get(0)).map((row) => row.map((cell) => cell)))).toString('base64')}`);
		}


		return actions;
	}
}
