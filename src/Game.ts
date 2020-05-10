import { State } from "./State";
import { Action } from "./Action";
import { Pellet } from "./Pellet";
import { Point } from "./Point";
import { wrap } from "./util/wrap";
import { Timer } from "./Timer";
import { debug } from "./util/debug";
import { Pac } from "./Pac";
import { deflateSync } from 'zlib';

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

function getPelletScoreMatrix(allPellets: Map<string, Pellet>, neighbouringCells: Map<string, Set<Point>>, gridWidth: number, gridHeight: number): number[][] {
	const matrix: number[][] = [];
	for (let y = 0; y < gridHeight; y++) {
		matrix[y] = [];
		for (let x = 0; x < gridWidth; x++) {
			const pellet = allPellets.get(Point.toString(x, y));
			matrix[y][x] = pellet ? pellet.getValue(neighbouringCells.get(pellet.location.toString()).size === 1) : 0;
		}
	}
	return matrix;
}

function getPacScoreMatrix(pac: Pac, state: State, matrix: number[][], pelletScoreMatrix: number[][], currentDepth: number, maxDepth: number, checkedPoints: Set<string>, nextPointsToCheck: Point[]): void {
	if (currentDepth >= maxDepth || !nextPointsToCheck.length) {
		return;
	}

	const neighbours = nextPointsToCheck.map((point) => {
		const pointNeighbours = state.neighbouringCells.get(point.toString());
		return [...pointNeighbours.values()].filter((cell) => !checkedPoints.has(cell.toString()));
	}).reduce((flattened, neighbourNeighbours) => [...flattened, ...neighbourNeighbours], [] as Point[]);

	getPacScoreMatrix(pac, state, matrix, pelletScoreMatrix, currentDepth + 1, maxDepth, new Set([...checkedPoints.values(), ...nextPointsToCheck.map((point) => point.toString())]), neighbours);

	if (currentDepth !== 0) {
		for (const point of nextPointsToCheck) {
			const neighbours = [...state.neighbouringCells.get(point.toString()).values()];
			const neighbourSum = neighbours.reduce((sum, neighbour) => sum + matrix[neighbour.y][neighbour.x], 0);
			const pelletValueForPac = Math.max(0.1, pelletScoreMatrix[point.y][point.x] - (currentDepth*0.3));
			matrix[point.y][point.x] = (pelletValueForPac + (neighbourSum / neighbours.length));
		}
	} else {
		matrix[nextPointsToCheck[0].y][nextPointsToCheck[0].x] = -1;
	}
}

export class Game {
	public getActions(state: State): Action[] {
		let timer = new Timer(`getActions`);

		const pelletMatrix = getPelletScoreMatrix(state.allPellets, state.neighbouringCells, state.width, state.height);

		const pacMatrices: { id: number, matrix: number[][]}[] = [];
		const actions: Action[] = [];
		for (let pac of state.myPacs.values()) {
			let pacTimer = new Timer(`Pac ${pac.id} turn`);

			if (pac.abilityCooldown === 0) {
				actions.push(pac.startSpeed());
			} else {
				const pacMatrix: number[][] = [];
				for (let y = 0; y < state.height; y++) {
					pacMatrix[y] = [];
					for (let x = 0; x < state.width; x++) {
						pacMatrix[y][x] = 0;
					}
				}
				const NUMBER_TURNS_TO_CONSIDER = 20;
				const checkedCells = new Set<string>();
				getPacScoreMatrix(pac, state, pacMatrix, pelletMatrix, 0, NUMBER_TURNS_TO_CONSIDER, checkedCells, [pac.location]);
				pacMatrices.push({ id: pac.id, matrix: pacMatrix });

				let highestValueDirection: Point;
				let action: Action = pac.moveTo(pac.location);
				for (let neighbour of state.neighbouringCells.get(pac.location.toString())) {
					const neighbourValue = pacMatrix[neighbour.y][neighbour.x];
					if (!highestValueDirection || neighbourValue > pacMatrix[highestValueDirection.y][highestValueDirection.x]) {
						const newAction = pac.moveTo(neighbour);
						if (actions.every((otherPacAction) => !newAction.equalTo(otherPacAction))) {
							highestValueDirection = neighbour;
							action = newAction;
						}
					}
				}
				actions.push(action);
			}
			pacTimer.stop();
		}
		timer.stop();

		// debug(`Pellet Value Graph: ${Buffer.from(JSON.stringify(pelletMatrix)).toString('base64')}`);
		// debug(`Pellet Value Graph: ${JSON.stringify(pelletMatrix).toString()}`);
		for (const matrix of pacMatrices) {
			if (matrix.id !== 2) {
				continue;
			}
			debug(`Pac ${matrix.id} Value Graph: ${Buffer.from(JSON.stringify(matrix.matrix.map((row) => row.map((cell) => cell.toPrecision(2))))).toString('base64')}`);
			// debug(`Pac ${matrix.id} Value Graph: ${JSON.stringify(matrix.matrix.map((row) => row.map((cell) => cell.toPrecision(2)))).toString()}`);
		}


		return actions;
	}
}
